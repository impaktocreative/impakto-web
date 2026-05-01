'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

function addMonthsToIsoDate(isoDate: string, monthsToAdd: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const baseMonthIndex = month - 1
  const targetMonthIndex = baseMonthIndex + monthsToAdd
  const targetYear = year + Math.floor(targetMonthIndex / 12)
  const normalizedTargetMonth = ((targetMonthIndex % 12) + 12) % 12
  const maxDay = new Date(Date.UTC(targetYear, normalizedTargetMonth + 1, 0)).getUTCDate()
  const targetDay = Math.min(day, maxDay)

  const y = String(targetYear)
  const m = String(normalizedTargetMonth + 1).padStart(2, '0')
  const d = String(targetDay).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function registerPaymentAction(_prevState: unknown, formData: FormData) {
  const client_service_id = formData.get('client_service_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const payment_date = formData.get('payment_date') as string
  const currency = formData.get('currency') as string
  const client_id = formData.get('client_id') as string

  if (!client_service_id || Number.isNaN(amount) || amount <= 0 || !payment_date) {
    return { success: false, message: 'Monto y fecha son requeridos.' }
  }

  const supabase = await createClient()

  const { data: clientService, error: serviceError } = await supabase
    .from('client_services')
    .select('duration_months')
    .eq('id', client_service_id)
    .single()

  if (serviceError || !clientService) {
    return { success: false, message: `No se pudo cargar el servicio: ${serviceError?.message ?? 'Servicio no encontrado.'}` }
  }

  const durationMonths = Number(clientService.duration_months)
  if (!Number.isFinite(durationMonths) || durationMonths < 1) {
    return { success: false, message: 'El servicio no tiene una duración válida en meses.' }
  }

  const nextDateStr = addMonthsToIsoDate(payment_date, durationMonths)

  const { error: paymentError } = await supabase.from('payments').insert({
    client_service_id,
    amount,
    currency,
    payment_date,
  })

  if (paymentError) return { success: false, message: `Error al registrar pago: ${paymentError.message}` }

  const { error: updateError } = await supabase
    .from('client_services')
    .update({ last_payment_date: payment_date, next_payment_date: nextDateStr, status: 'activo' })
    .eq('id', client_service_id)

  if (updateError) return { success: false, message: `Pago guardado pero error al actualizar vencimiento: ${updateError.message}` }

  if (client_id) revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  revalidatePath('/admin/income')
  return { success: true, message: `Próximo vencimiento actualizado a ${nextDateStr}` }
}
