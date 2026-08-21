import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { feDummy, puntosDeVenta, ultimoAutorizado } from './wsfe'
import { getTA } from './ta-cache'
import { credencialesDe, hayCredenciales, nombresDeVariables } from './credenciales'
import { CBTE } from './tipos'
import type { Emisor } from './emitir'

/**
 * Diagnóstico de la conexión con ARCA, paso a paso.
 *
 * Los errores de ARCA son poco descriptivos: un mismo mensaje puede significar
 * que falta el certificado, que falta la delegación del servicio o que el
 * punto de venta no está habilitado. Probar en orden y cortar en el primer
 * fallo dice exactamente cuál de los tres es.
 */

export interface PasoVerificacion {
  paso: string
  ok: boolean
  detalle: string
}

export interface ResultadoVerificacion {
  pasos: PasoVerificacion[]
  puntosDeVentaDisponibles: { nro: number; tipo: string; bloqueado: boolean }[]
  ultimoNumero: number | null
}

type PtoVentaARCA = {
  Nro?: number | string
  EmisionTipo?: string
  Bloqueado?: string
  FchBaja?: string
}

export async function verificarConexion(
  supabase: SupabaseClient,
  emisor: Emisor,
): Promise<ResultadoVerificacion> {
  const pasos: PasoVerificacion[] = []
  let puntos: { nro: number; tipo: string; bloqueado: boolean }[] = []
  let ultimoNumero: number | null = null

  const agregar = (paso: string, ok: boolean, detalle: string) => {
    pasos.push({ paso, ok, detalle })
    return ok
  }

  // 1. Credenciales presentes y decodificables.
  const nombres = nombresDeVariables(emisor.clave, emisor.entorno)
  if (!hayCredenciales(emisor.clave, emisor.entorno)) {
    agregar(
      'Certificado',
      false,
      `Faltan ${nombres.cert} y ${nombres.key} en el entorno.`,
    )
    return { pasos, puntosDeVentaDisponibles: puntos, ultimoNumero }
  }

  let cred
  try {
    cred = credencialesDe(emisor.clave, emisor.entorno)
    agregar('Certificado', true, `Cargado desde ${nombres.cert} y ${nombres.key}.`)
  } catch (e) {
    agregar('Certificado', false, e instanceof Error ? e.message : String(e))
    return { pasos, puntosDeVentaDisponibles: puntos, ultimoNumero }
  }

  // 2. El servicio responde. No requiere ticket, así que separa "ARCA está
  //    caído" de "mi certificado no sirve".
  try {
    const d = await feDummy(emisor.entorno)
    const ok = d.AppServer === 'OK' && d.DbServer === 'OK' && d.AuthServer === 'OK'
    if (
      !agregar(
        'Servicio de ARCA',
        ok,
        `AppServer ${d.AppServer} · DbServer ${d.DbServer} · AuthServer ${d.AuthServer}`,
      )
    ) {
      return { pasos, puntosDeVentaDisponibles: puntos, ultimoNumero }
    }
  } catch (e) {
    agregar('Servicio de ARCA', false, e instanceof Error ? e.message : String(e))
    return { pasos, puntosDeVentaDisponibles: puntos, ultimoNumero }
  }

  // 3. Ticket de acceso: prueba el certificado y la delegación del servicio.
  let ta
  try {
    ta = await getTA(supabase, cred, emisor.entorno, 'wsfe')
    agregar('Ticket de acceso', true, `Vigente hasta ${ta.expira}.`)
  } catch (e) {
    agregar(
      'Ticket de acceso',
      false,
      (e instanceof Error ? e.message : String(e)) +
        ' — Suele significar que al certificado no se le delegó el servicio de Facturación Electrónica.',
    )
    return { pasos, puntosDeVentaDisponibles: puntos, ultimoNumero }
  }

  // 4. Puntos de venta habilitados. Acá se ve cuál sirve para web service.
  try {
    const lista = (await puntosDeVenta(emisor.entorno, ta, emisor.cuit)) as PtoVentaARCA[]
    puntos = lista
      .filter(p => !p.FchBaja)
      .map(p => ({
        nro: Number(p.Nro),
        tipo: String(p.EmisionTipo ?? ''),
        bloqueado: String(p.Bloqueado ?? 'N') === 'S',
      }))

    const propio = puntos.find(p => p.nro === emisor.ptoVta)
    agregar(
      'Punto de venta',
      Boolean(propio && !propio.bloqueado),
      propio
        ? propio.bloqueado
          ? `El punto de venta ${emisor.ptoVta} está bloqueado.`
          : `El ${emisor.ptoVta} está habilitado (${propio.tipo}).`
        : `El ${emisor.ptoVta} no figura entre los habilitados. Disponibles: ${
            puntos.map(p => `${p.nro} (${p.tipo})`).join(', ') || 'ninguno'
          }.`,
    )
  } catch (e) {
    agregar('Punto de venta', false, e instanceof Error ? e.message : String(e))
    return { pasos, puntosDeVentaDisponibles: puntos, ultimoNumero }
  }

  // 5. Último autorizado: confirma que se puede leer la serie.
  try {
    ultimoNumero = await ultimoAutorizado(
      emisor.entorno,
      ta,
      emisor.cuit,
      emisor.ptoVta,
      CBTE.FACTURA_C,
    )
    agregar(
      'Última factura C',
      true,
      ultimoNumero === 0
        ? 'Sin comprobantes emitidos en este punto de venta. La próxima es la número 1.'
        : `La última autorizada es la ${ultimoNumero}. La próxima es la ${ultimoNumero + 1}.`,
    )
  } catch (e) {
    agregar('Última factura C', false, e instanceof Error ? e.message : String(e))
  }

  return { pasos, puntosDeVentaDisponibles: puntos, ultimoNumero }
}
