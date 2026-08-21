'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { esEntorno } from '@/lib/arca/config'
import { verificarConexion, type ResultadoVerificacion } from '@/lib/arca/verificar'
import { sincronizarContador, type Emisor } from '@/lib/arca/emitir'
import { CBTE } from '@/lib/arca/tipos'
import type { ClaveEmisor } from '@/lib/arca/credenciales'

export type EstadoVerificacion =
  | { success: true; resultado: ResultadoVerificacion }
  | { success: false; message: string }

async function cargarEmisor(id: string): Promise<Emisor> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('arca_emisores')
    .select('id, clave, cuit, pto_vta, entorno')
    .eq('id', id)
    .single()

  if (error || !data) throw new Error('No se encontró el emisor.')
  if (Number(data.cuit) <= 0) {
    throw new Error('El emisor todavía no tiene CUIT cargado.')
  }
  if (!esEntorno(String(data.entorno))) {
    throw new Error(`Entorno inválido: ${data.entorno}`)
  }

  return {
    id: data.id,
    clave: data.clave as ClaveEmisor,
    cuit: Number(data.cuit),
    ptoVta: Number(data.pto_vta),
    entorno: data.entorno,
  }
}

/** Prueba la conexión paso a paso y devuelve dónde se corta. */
export async function probarConexionArcaAction(emisorId: string): Promise<EstadoVerificacion> {
  try {
    const supabase = await createClient()
    const emisor = await cargarEmisor(emisorId)
    const resultado = await verificarConexion(supabase, emisor)
    return { success: true, resultado }
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Alinea el contador local con el último número que ARCA tiene registrado.
 * Sin esto, un punto de venta que ya emitió desde otro sistema arranca en 1 y
 * ARCA rechaza todo hasta alcanzar el número real.
 */
export async function sincronizarContadorAction(
  emisorId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const emisor = await cargarEmisor(emisorId)
    const ultimo = await sincronizarContador(supabase, emisor, CBTE.FACTURA_C)
    revalidatePath('/admin/settings')
    return {
      success: true,
      message:
        ultimo === 0
          ? 'ARCA no tiene comprobantes en este punto de venta. La próxima factura es la número 1.'
          : `Contador sincronizado: la última en ARCA es la ${ultimo}, la próxima será la ${ultimo + 1}.`,
    }
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : String(e) }
  }
}
