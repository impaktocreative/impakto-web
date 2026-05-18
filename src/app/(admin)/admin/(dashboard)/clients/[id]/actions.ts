'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'

export async function assignServiceAction(prevState: any, formData: FormData) {
  const client_id = formData.get('client_id') as string
  const service_id = formData.get('service_id') as string
  const domain_name = (formData.get('domain_name') as string) || null
  const last_payment_date = (formData.get('last_payment_date') as string) || null
  const notes = (formData.get('notes') as string) || null
  const status = (formData.get('status') as string) || 'activo'
  const receiver = (formData.get('receiver') as string) || null

  if (!client_id || !service_id) {
    return { success: false, message: 'El cliente y el servicio son requeridos.' }
  }

  const supabase = await createClient()

  const { data: serviceData, error: srvError } = await supabase
    .from('services')
    .select('price, currency, duration_months')
    .eq('id', service_id)
    .single()

  if (srvError || !serviceData) {
    return { success: false, message: 'Servicio no encontrado en el catálogo.' }
  }

  const { price, currency, duration_months } = serviceData

  // Always compute next_payment_date from last_payment_date + duration_months
  let next_payment_date: string | null = null
  if (last_payment_date && duration_months) {
    const d = new Date(last_payment_date)
    d.setMonth(d.getMonth() + duration_months)
    next_payment_date = d.toISOString().split('T')[0]
  }

  const { error } = await supabase.from('client_services').insert({
    client_id,
    service_id,
    domain_name,
    price,
    currency,
    duration_months,
    last_payment_date,
    next_payment_date,
    notes,
    status,
    receiver,
  })

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  return { success: true, message: 'Servicio asignado correctamente.' }
}

export async function removeClientServiceAction(id: string, client_id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('client_services').delete().eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function editClientServiceAction(prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  const client_id = formData.get('client_id') as string
  const domain_name = (formData.get('domain_name') as string) || null
  const last_payment_date = (formData.get('last_payment_date') as string) || null
  const notes = (formData.get('notes') as string) || null
  const status = (formData.get('status') as string) || 'activo'
  const receiver = (formData.get('receiver') as string) || null

  if (!id || !client_id) {
    return { success: false, message: 'ID y cliente son requeridos.' }
  }

  const supabase = await createClient()

  const { data: existingService, error: existingError } = await supabase
    .from('client_services')
    .select('duration_months')
    .eq('id', id)
    .single()

  if (existingError || !existingService) {
    return { success: false, message: 'Servicio de cliente no encontrado.' }
  }

  let next_payment_date: string | null = null
  if (last_payment_date && existingService.duration_months) {
    const d = new Date(last_payment_date)
    d.setMonth(d.getMonth() + existingService.duration_months)
    next_payment_date = d.toISOString().split('T')[0]
  }

  const { error } = await supabase.from('client_services').update({
    domain_name,
    last_payment_date,
    next_payment_date,
    notes,
    status,
    receiver,
  }).eq('id', id)

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  return { success: true, message: 'Servicio actualizado correctamente.' }
}

export async function sendManualReminderAction(clientServiceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_services')
    .select(`
      id, client_id, domain_name, price, currency, next_payment_date,
      services ( name ),
      clients ( email, contact_name, brand_name )
    `)
    .eq('id', clientServiceId)
    .single()

  if (error || !data) {
    return { success: false, message: 'Servicio no encontrado.' }
  }

  const clientData = Array.isArray(data.clients) ? data.clients[0] : data.clients
  const serviceData = Array.isArray(data.services) ? data.services[0] : data.services

  if (!clientData?.email) {
    return { success: false, message: 'El cliente no tiene email registrado.' }
  }

  if (!serviceData?.name) {
    return { success: false, message: 'El servicio no tiene nombre.' }
  }

  const daysOverdue = data.next_payment_date
    ? Math.max(Math.ceil((Date.now() - new Date(data.next_payment_date).getTime()) / 86400000), 1)
    : 1

  const { data: dbTemplate } = await supabase
    .from('email_templates')
    .select('subject, body')
    .eq('type', 'overdue_every_3_days')
    .maybeSingle()

  const fallback = {
    subject: 'Servicio vencido hace {{dias_vencido}} dias: {{servicio}}',
    body: 'Hola {{nombre}},<br><br>Tu servicio <strong>{{servicio}}</strong> se encuentra vencido desde hace <strong>{{dias_vencido}} dias</strong>.<br><br>Dominio: {{dominio}}<br>Monto pendiente: {{monto}}<br><br>Este aviso se envia el primer dia de mora y luego cada 3 dias hasta registrar el pago.',
  }

  const templateSubject = dbTemplate?.subject ?? fallback.subject
  const templateBody = dbTemplate?.body ?? fallback.body

  const vars: Record<string, string> = {
    '{{nombre}}': clientData.contact_name ?? '',
    '{{marca}}': clientData.brand_name ?? '',
    '{{servicio}}': serviceData.name,
    '{{dominio}}': data.domain_name ?? 'N/A',
    '{{dias}}': String(daysOverdue),
    '{{dias_vencido}}': String(daysOverdue),
    '{{monto}}': `${data.currency === 'USD' ? 'USD' : '$'} ${Number(data.price).toLocaleString('es-AR')}`,
  }

  const subject = interpolate(templateSubject, vars)
  const body = interpolate(templateBody, vars)
  const htmlContent = buildEmailHtml(body)

  const emailResult = await sendEmail({
    to: clientData.email.toLowerCase(),
    name: clientData.contact_name ?? clientData.brand_name ?? 'Cliente',
    subject,
    htmlContent,
    cc: [{ email: 'impaktoagency@gmail.com', name: 'Impakto Creative' }],
  })

  if (!emailResult.success) {
    return { success: false, message: 'Error al enviar el email. Intentalo de nuevo.' }
  }

  await supabase.from('email_logs').insert([{
    client_service_id: data.id,
    reminder_type: 'overdue_every_3_days',
  }])

  revalidatePath(`/admin/clients/${data.client_id}`)
  revalidatePath('/admin')

  return { success: true, message: 'Aviso de vencimiento enviado correctamente.' }
}
