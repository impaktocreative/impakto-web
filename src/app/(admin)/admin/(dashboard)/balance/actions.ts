'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { ActionState } from '@/types/admin'

/**
 * Guarda la cotización de un mes.
 *
 * Solo afecta la conversión de ese mes: el total de doce meses es la suma de
 * cada mes convertido a la suya, así que corregir mayo no toca agosto.
 */
export async function saveUsdRateAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const month = String(formData.get('month') ?? '')
  const rate = Number(formData.get('rate'))

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, message: 'Mes inválido.' }
  }

  if (!Number.isFinite(rate) || rate <= 0) {
    return { success: false, message: 'La cotización tiene que ser mayor a cero.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('usd_rates')
    .upsert(
      { month, rate, updated_at: new Date().toISOString() },
      { onConflict: 'month' },
    )

  if (error) return { success: false, message: `No se pudo guardar: ${error.message}` }

  revalidatePath('/admin/balance')
  return { success: true, message: `${month}: $ ${rate.toLocaleString('es-AR')}` }
}

/**
 * Carga un ajuste de liquidación en un mes.
 *
 * El monto va siempre positivo y la dirección la lleva `favor`. El signo lo
 * pone la lectura, no quien carga: pedir "-50000 para Rodrigo" es pedir que
 * alguien se equivoque.
 */
export async function crearAjusteAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const month = String(formData.get('month') ?? '')
  const favor = String(formData.get('favor') ?? '')
  const currency = String(formData.get('currency') ?? 'ARS')
  const description = String(formData.get('description') ?? '').trim()
  const amount = Number(formData.get('amount'))

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, message: 'Mes inválido.' }
  }

  if (favor !== 'sergio' && favor !== 'rodrigo') {
    return { success: false, message: 'Elegí a favor de quién queda el ajuste.' }
  }

  if (currency !== 'ARS' && currency !== 'USD') {
    return { success: false, message: 'Moneda inválida.' }
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: 'El monto tiene que ser mayor a cero.' }
  }

  if (!description) {
    return { success: false, message: 'Escribí de qué se trata el ajuste.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('balance_adjustments')
    .insert({ month, favor, amount, currency, description })

  if (error) return { success: false, message: `No se pudo guardar: ${error.message}` }

  revalidatePath('/admin/balance')

  const nombre = favor === 'sergio' ? 'Sergio' : 'Rodrigo'
  const signo = currency === 'USD' ? 'USD ' : '$ '
  return {
    success: true,
    message: `Ajuste de ${signo}${amount.toLocaleString('es-AR')} a favor de ${nombre}.`,
  }
}

export async function eliminarAjusteAction(id: string): Promise<ActionState> {
  if (!id) return { success: false, message: 'Falta el ajuste a eliminar.' }

  const supabase = await createClient()
  const { error } = await supabase.from('balance_adjustments').delete().eq('id', id)

  if (error) return { success: false, message: `No se pudo eliminar: ${error.message}` }

  revalidatePath('/admin/balance')
  return { success: true, message: 'Ajuste eliminado.' }
}
