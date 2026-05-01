'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerPaymentAction(prevState: any, formData: FormData) {
  const client_service_id = formData.get('client_service_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const payment_date = formData.get('payment_date') as string
  const currency = formData.get('currency') as string
  const duration_months = parseInt(formData.get('duration_months') as string)
  const client_id = formData.get('client_id') as string

  if (!client_service_id || !amount || !payment_date) {
    return { success: false, message: 'Monto y fecha son requeridos.' }
  }

  const supabase = await createClient()

  const { error: paymentError } = await supabase.from('payments').insert({
    client_service_id,
    amount,
    currency,
    payment_date,
  })

  if (paymentError) return { success: false, message: `Error al registrar pago: ${paymentError.message}` }

  const newNextDate = new Date(payment_date)
  newNextDate.setMonth(newNextDate.getMonth() + duration_months)
  const nextDateStr = newNextDate.toISOString().split('T')[0]

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
