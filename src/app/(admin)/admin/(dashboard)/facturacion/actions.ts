'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { esEntorno } from '@/lib/arca/config'
import { emitir, type Emisor } from '@/lib/arca/emitir'
import { tipoFacturaPara, tipoFacturaRI, redondear, type CondicionFiscal } from '@/lib/arca/tipos'
import { documentoReceptor } from '@/lib/arca-receptor'
import type { ClaveEmisor } from '@/lib/arca/credenciales'

export type LineaDetalle = { descripcion: string; cantidad: number; precioUnitario: number }

export type EstadoEmision =
  | { success: true; id: string; numero: number; cae: string; caeVto: string; mensaje: string }
  | { success: false; message: string }

/** yyyy-mm-dd → yyyymmdd, que es lo que espera ARCA. */
function aFormatoARCA(iso: string): string {
  return iso.replaceAll('-', '')
}

function leerDetalle(formData: FormData): LineaDetalle[] {
  const descripciones = formData.getAll('linea_descripcion').map(String)
  const cantidades = formData.getAll('linea_cantidad').map(Number)
  const precios = formData.getAll('linea_precio').map(Number)

  const lineas: LineaDetalle[] = []
  for (let i = 0; i < descripciones.length; i++) {
    const descripcion = descripciones[i]?.trim()
    const cantidad = cantidades[i]
    const precioUnitario = precios[i]
    if (!descripcion) continue
    if (!Number.isFinite(cantidad) || cantidad <= 0) continue
    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) continue
    lineas.push({ descripcion, cantidad, precioUnitario })
  }
  return lineas
}

export async function emitirFacturaAction(
  _prevState: EstadoEmision | null,
  formData: FormData,
): Promise<EstadoEmision> {
  try {
    const supabase = await createClient()

    const emisorId = String(formData.get('emisor_id') ?? '')
    const clientId = String(formData.get('client_id') ?? '') || null
    const fecha = String(formData.get('fecha') ?? '')
    const servDesde = String(formData.get('serv_desde') ?? '')
    const servHasta = String(formData.get('serv_hasta') ?? '')
    const vtoPago = String(formData.get('vto_pago') ?? '')

    if (!emisorId) return { success: false, message: 'Elegí quién emite.' }
    if (!fecha || !servDesde || !servHasta || !vtoPago) {
      return { success: false, message: 'Faltan las fechas del comprobante.' }
    }

    const lineas = leerDetalle(formData)
    if (lineas.length === 0) {
      return { success: false, message: 'Cargá al menos una línea con descripción, cantidad y precio.' }
    }

    const total = redondear(lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0))
    if (total <= 0) return { success: false, message: 'El importe total tiene que ser mayor a cero.' }

    // --- emisor
    const { data: e, error: errorEmisor } = await supabase
      .from('arca_emisores')
      .select('id, clave, cuit, pto_vta, entorno, condicion_fiscal')
      .eq('id', emisorId)
      .single()

    if (errorEmisor || !e) return { success: false, message: 'No se encontró el emisor.' }
    if (Number(e.cuit) <= 0) return { success: false, message: 'El emisor no tiene CUIT cargado.' }
    if (!esEntorno(String(e.entorno))) return { success: false, message: 'Entorno inválido.' }

    const emisor: Emisor = {
      id: e.id,
      clave: e.clave as ClaveEmisor,
      cuit: Number(e.cuit),
      ptoVta: Number(e.pto_vta),
      entorno: e.entorno,
    }

    // --- receptor
    let receptorNombre = String(formData.get('receptor_nombre') ?? '').trim() || null
    const receptorDomicilio = String(formData.get('receptor_domicilio') ?? '').trim() || null
    let cuitReceptor: string | null = String(formData.get('receptor_cuit') ?? '').trim() || null
    let condIva = Number(formData.get('receptor_cond_iva'))

    if (clientId) {
      const { data: c } = await supabase
        .from('clients')
        .select('brand_name, razon_social, cuit, cond_iva_receptor')
        .eq('id', clientId)
        .single()

      if (c) {
        receptorNombre = receptorNombre ?? c.razon_social ?? c.brand_name
        cuitReceptor = cuitReceptor ?? c.cuit
        if (!Number.isFinite(condIva) || condIva <= 0) condIva = Number(c.cond_iva_receptor ?? 5)
      }
    }

    if (!Number.isFinite(condIva) || condIva <= 0) condIva = 5

    const { docTipo, docNro } = documentoReceptor(cuitReceptor)

    const condicion = String(e.condicion_fiscal) as CondicionFiscal
    const cbteTipo =
      condicion === 'responsable_inscripto' ? tipoFacturaRI(condIva) : tipoFacturaPara(condicion)

    const resultado = await emitir({
      supabase,
      emisor,
      cbteTipo,
      clientId,
      receptorNombre,
      receptorDomicilio,
      detalle: { lineas },
      referencia: String(formData.get('referencia') ?? '').trim() || undefined,
      fecha: aFormatoARCA(fecha),
      datos: {
        concepto: 2, // Servicios
        docTipo,
        docNro,
        condIvaReceptor: condIva,
        // Factura C: el neto es igual al total y no lleva discriminación de IVA.
        impTotal: total,
        impNeto: total,
        impIVA: 0,
        fchServDesde: aFormatoARCA(servDesde),
        fchServHasta: aFormatoARCA(servHasta),
        fchVtoPago: aFormatoARCA(vtoPago),
        monId: 'PES',
        monCotiz: 1,
      },
    })

    revalidatePath('/admin/facturacion')

    if (resultado.resultado !== 'A' || !resultado.cae) {
      const obs = resultado.observaciones?.map(o => `[${o.Code}] ${o.Msg}`).join(' · ')
      return {
        success: false,
        message: `ARCA rechazó el comprobante${obs ? `: ${obs}` : '.'}`,
      }
    }

    return {
      success: true,
      id: resultado.id,
      numero: resultado.numero,
      cae: resultado.cae,
      caeVto: resultado.caeVto ?? '',
      mensaje:
        emisor.entorno === 'homologacion'
          ? `Comprobante ${resultado.numero} autorizado en homologación. No tiene validez fiscal.`
          : `Factura ${resultado.numero} autorizada. CAE ${resultado.cae}.`,
    }
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : String(e) }
  }
}
