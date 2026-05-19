'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'

const PAYMENT_TEMPLATE_FALLBACK = {
  subject: 'Pago recibido - {{servicio}}',
  body: 'Hola {{nombre}},<br><br>Te confirmamos que registramos correctamente tu pago para <strong>{{servicio}}</strong>.<br><br>Dominio: {{dominio}}<br>Monto: {{monto}}<br><br>Gracias por trabajar con Impakto Creative.',
}

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
    .select(`
      duration_months,
      next_payment_date,
      domain_name,
      deduct_bank_fee,
      receiver,
      services ( name ),
      clients ( email, contact_name, brand_name )
    `)
    .eq('id', client_service_id)
    .single()

  if (serviceError || !clientService) {
    return { success: false, message: `No se pudo cargar el servicio: ${serviceError?.message ?? 'Servicio no encontrado.'}` }
  }

  const durationMonths = Number(clientService.duration_months)
  if (!Number.isFinite(durationMonths) || durationMonths < 1) {
    return { success: false, message: 'El servicio no tiene una duración válida en meses.' }
  }

  const baseDate = (clientService as any).next_payment_date || payment_date
  const nextDateStr = addMonthsToIsoDate(baseDate, durationMonths)

  const deductBankFee = (clientService as any).deduct_bank_fee === true
  const netAmount = deductBankFee ? Math.round(amount * 0.965 * 100) / 100 : null

  const receiver = (clientService as any).receiver ?? null

  const { error: paymentError } = await supabase.from('payments').insert({
    client_service_id,
    amount,
    net_amount: netAmount,
    currency,
    payment_date,
    receiver,
  })

  if (paymentError) return { success: false, message: `Error al registrar pago: ${paymentError.message}` }

  const { error: updateError } = await supabase
    .from('client_services')
    .update({ last_payment_date: payment_date, next_payment_date: nextDateStr, status: 'activo' })
    .eq('id', client_service_id)

  if (updateError) return { success: false, message: `Pago guardado pero error al actualizar vencimiento: ${updateError.message}` }

  let warningMessage = ''
  const { data: paymentTemplateFromDb } = await supabase
    .from('email_templates')
    .select('subject, body')
    .eq('type', 'payment_registered')
    .maybeSingle()

  const paymentTemplate = paymentTemplateFromDb ?? PAYMENT_TEMPLATE_FALLBACK

  const clientData = Array.isArray(clientService.clients) ? clientService.clients[0] : clientService.clients
  const serviceData = Array.isArray(clientService.services) ? clientService.services[0] : clientService.services

  const clientEmail = clientData?.email?.trim()
  if (paymentTemplate.subject && paymentTemplate.body && clientEmail) {
    const vars: Record<string, string> = {
      '{{nombre}}': clientData?.contact_name ?? 'Cliente',
      '{{marca}}': clientData?.brand_name ?? '',
      '{{servicio}}': serviceData?.name ?? '',
      '{{dominio}}': clientService.domain_name ?? 'N/A',
      '{{dias}}': '',
      '{{dias_vencido}}': '0',
      '{{monto}}': `${currency === 'USD' ? 'USD' : '$'} ${Number(amount).toLocaleString('es-AR')}`,
    }

    const emailResult = await sendEmail({
      to: clientEmail,
      name: clientData?.contact_name ?? 'Cliente',
      subject: interpolate(paymentTemplate.subject, vars),
      htmlContent: buildEmailHtml(interpolate(paymentTemplate.body, vars)),
    })

    if (!emailResult.success) {
      warningMessage = ' (el pago se registró, pero no se pudo enviar el email de confirmación)'
    }
  }

  if (client_id) revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  revalidatePath('/admin/income')
  return { success: true, message: `Próximo vencimiento actualizado a ${nextDateStr}${warningMessage}` }
}
