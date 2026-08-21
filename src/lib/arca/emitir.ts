import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { llamarWSFE, ErrorWSFE, ultimoAutorizado } from './wsfe'
import { getTA } from './ta-cache'
import { armarFECAESolicitar } from './comprobantes'
import { fechaARCA, type DatosComprobante, type ResultadoEmision } from './tipos'
import { credencialesDe, type ClaveEmisor } from './credenciales'
import type { Entorno } from './config'

/**
 * Emisión de un comprobante.
 *
 * El skill original sostiene una transacción de Postgres durante la llamada a
 * ARCA, para que un fallo devuelva el número reservado. Acá se entra por
 * PostgREST y eso no es posible, así que el número se reserva de forma
 * atómica, el comprobante se guarda como `pendiente` antes de llamar, y si la
 * llamada se corta el registro queda pendiente en vez de desaparecer.
 *
 * Es la diferencia importante: un comprobante pendiente puede tener CAE en
 * ARCA aunque nosotros no lo hayamos recibido. Nunca se lo vuelve a emitir a
 * ciegas — se reconcilia contra ARCA con `reconciliar()`.
 */

export interface Emisor {
  id: string
  clave: ClaveEmisor
  cuit: number
  ptoVta: number
  entorno: Entorno
}

export interface OpcionesEmision {
  supabase: SupabaseClient
  emisor: Emisor
  cbteTipo: number
  datos: DatosComprobante
  /** Identifica el hecho que originó el comprobante. Da idempotencia. */
  referencia?: string
  clientId?: string | null
  paymentId?: string | null
  receptorNombre?: string | null
  receptorDomicilio?: string | null
  /** Líneas del detalle. ARCA no las recibe; se guardan para el PDF. */
  detalle?: unknown
  /** Fecha del comprobante en formato yyyymmdd. Por defecto, hoy. */
  fecha?: string
}

export interface ComprobanteEmitido extends ResultadoEmision {
  id: string
  ptoVta: number
  cbteTipo: number
}

async function reservarNumero(
  supabase: SupabaseClient,
  emisorId: string,
  ptoVta: number,
  cbteTipo: number,
): Promise<number> {
  const { data, error } = await supabase.rpc('arca_reservar_numero', {
    p_emisor_id: emisorId,
    p_pto_vta: ptoVta,
    p_cbte_tipo: cbteTipo,
  })
  if (error) throw new Error(`No se pudo reservar el número: ${error.message}`)
  return Number(data)
}

export async function emitir(opts: OpcionesEmision): Promise<ComprobanteEmitido> {
  const { supabase, emisor, cbteTipo, datos, referencia } = opts
  const fecha = opts.fecha ?? fechaARCA()

  // Idempotencia: si ya se emitió para esta referencia, se devuelve lo que hay.
  if (referencia) {
    const { data: existente } = await supabase
      .from('arca_comprobantes')
      .select('id, numero, cae, cae_vto, estado, pto_vta, cbte_tipo')
      .eq('emisor_id', emisor.id)
      .eq('referencia', referencia)
      .in('estado', ['pendiente', 'autorizado'])
      .maybeSingle()

    if (existente?.estado === 'autorizado') {
      return {
        id: existente.id,
        numero: Number(existente.numero),
        ptoVta: Number(existente.pto_vta),
        cbteTipo: Number(existente.cbte_tipo),
        resultado: 'A',
        cae: existente.cae ?? undefined,
        caeVto: existente.cae_vto ?? undefined,
      }
    }

    if (existente) {
      throw new Error(
        `Ya hay un comprobante pendiente para esta operación (número ${existente.numero}). ` +
          'Puede tener CAE en ARCA aunque no lo hayamos recibido. Reconciliá antes de reintentar.',
      )
    }
  }

  const cred = credencialesDe(emisor.clave, emisor.entorno)
  const ta = await getTA(supabase, cred, emisor.entorno, 'wsfe')

  const numero = await reservarNumero(supabase, emisor.id, emisor.ptoVta, cbteTipo)

  const { data: fila, error: errorInsert } = await supabase
    .from('arca_comprobantes')
    .insert({
      emisor_id: emisor.id,
      client_id: opts.clientId ?? null,
      payment_id: opts.paymentId ?? null,
      pto_vta: emisor.ptoVta,
      cbte_tipo: cbteTipo,
      numero,
      estado: 'pendiente',
      entorno: emisor.entorno,
      referencia: referencia ?? null,
      doc_tipo: datos.docTipo,
      doc_nro: datos.docNro,
      cond_iva_receptor: datos.condIvaReceptor,
      receptor_nombre: opts.receptorNombre ?? null,
      receptor_domicilio: opts.receptorDomicilio ?? null,
      concepto: datos.concepto,
      detalle: opts.detalle ?? null,
      importe_total: datos.impTotal,
      importe_neto: datos.impNeto,
      moneda: datos.monId ?? 'PES',
      cotizacion: datos.monCotiz ?? 1,
    })
    .select('id')
    .single()

  if (errorInsert || !fila) {
    throw new Error(`No se pudo registrar el comprobante: ${errorInsert?.message}`)
  }

  const cuerpo = armarFECAESolicitar({ ptoVta: emisor.ptoVta, cbteTipo, numero, fecha, datos })
  let requestXml = ''

  try {
    const resp = await llamarWSFE<Record<string, unknown>>(
      emisor.entorno,
      'FECAESolicitar',
      cuerpo,
      ta,
      emisor.cuit,
      xml => {
        requestXml = xml
      },
    )

    const detResp = (resp as { FeDetResp?: { FECAEDetResponse?: Record<string, unknown> } })
      .FeDetResp?.FECAEDetResponse
    const cabResp = (resp as { FeCabResp?: { Resultado?: string } }).FeCabResp

    const resultado = String(detResp?.Resultado ?? cabResp?.Resultado ?? 'R') as 'A' | 'R' | 'P'

    const obsRaw = (detResp?.Observaciones as { Obs?: unknown } | undefined)?.Obs
    const observaciones = obsRaw
      ? (Array.isArray(obsRaw) ? obsRaw : [obsRaw]).map(o => ({
          Code: Number((o as { Code: unknown }).Code),
          Msg: String((o as { Msg: unknown }).Msg),
        }))
      : undefined

    if (resultado !== 'A') {
      await supabase
        .from('arca_comprobantes')
        .update({
          estado: 'rechazado',
          observaciones: observaciones ?? [],
          request_xml: requestXml,
          response_json: resp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fila.id)

      return { id: fila.id, numero, ptoVta: emisor.ptoVta, cbteTipo, resultado, observaciones }
    }

    const cae = String(detResp?.CAE)
    const caeVtoARCA = String(detResp?.CAEFchVto)
    const caeVto = `${caeVtoARCA.slice(0, 4)}-${caeVtoARCA.slice(4, 6)}-${caeVtoARCA.slice(6, 8)}`

    await supabase
      .from('arca_comprobantes')
      .update({
        estado: 'autorizado',
        cae,
        cae_vto: caeVto,
        observaciones: observaciones ?? [],
        request_xml: requestXml,
        response_json: resp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fila.id)

    return {
      id: fila.id,
      numero,
      ptoVta: emisor.ptoVta,
      cbteTipo,
      resultado: 'A',
      cae,
      caeVto,
      observaciones,
    }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : String(e)

    await supabase
      .from('arca_comprobantes')
      .update({
        observaciones: [{ Code: 0, Msg: mensaje }],
        request_xml: requestXml,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fila.id)

    // 10016: el número ya fue usado en ARCA. El contador local quedó atrasado.
    if (e instanceof ErrorWSFE && e.tieneCodigo(10016)) {
      throw new Error(
        `ARCA ya tiene autorizado el número ${numero} en este punto de venta. ` +
          'El contador local quedó atrasado: sincronizalo y volvé a emitir.',
      )
    }

    throw e
  }
}

/**
 * Alinea el contador local con el último número que ARCA tiene registrado.
 *
 * Se corre al configurar un punto de venta y ante el error 10016. Sin esto,
 * un punto de venta que ya emitió desde otro sistema arranca en 1 y ARCA
 * rechaza todo hasta alcanzar el número real.
 */
export async function sincronizarContador(
  supabase: SupabaseClient,
  emisor: Emisor,
  cbteTipo: number,
): Promise<number> {
  const cred = credencialesDe(emisor.clave, emisor.entorno)
  const ta = await getTA(supabase, cred, emisor.entorno, 'wsfe')
  const ultimo = await ultimoAutorizado(emisor.entorno, ta, emisor.cuit, emisor.ptoVta, cbteTipo)

  const { error } = await supabase.rpc('arca_fijar_contador', {
    p_emisor_id: emisor.id,
    p_pto_vta: emisor.ptoVta,
    p_cbte_tipo: cbteTipo,
    p_ultimo: ultimo,
  })
  if (error) throw new Error(`No se pudo fijar el contador: ${error.message}`)

  return ultimo
}
