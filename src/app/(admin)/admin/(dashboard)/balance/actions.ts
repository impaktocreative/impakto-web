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
