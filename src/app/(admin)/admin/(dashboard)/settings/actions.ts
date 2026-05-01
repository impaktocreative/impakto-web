'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'

const PREVIEW_DATA: Record<string, string> = {
  '{{nombre}}': 'Juan García',
  '{{marca}}': 'Mi Empresa S.A.',
  '{{servicio}}': 'Hosting Web Premium',
  '{{dominio}}': 'misitioweb.com',
  '{{dias}}': '10',
  '{{monto}}': '25.000',
}

type Recipient = {
  id: string
  contact_name: string | null
  brand_name: string | null
  email: string | null
}

export async function saveTemplateAction(prevState: any, formData: FormData) {
  const type = formData.get('type') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string

  if (!type || !subject || !body) {
    return { success: false, message: 'Todos los campos son requeridos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('email_templates')
    .upsert({ type, subject, body, updated_at: new Date().toISOString() }, { onConflict: 'type' })

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath('/admin/settings')
  return { success: true, message: 'Plantilla guardada correctamente.' }
}

export async function sendTestEmailAction(prevState: any, formData: FormData) {
  const email = formData.get('test_email') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string

  if (!email || !subject || !body) {
    return { success: false, message: 'Faltan datos o correo para enviar la prueba.' }
  }

  const finalSubject = interpolate(subject, PREVIEW_DATA)
  const finalBody = buildEmailHtml(interpolate(body, PREVIEW_DATA))

  const result = await sendEmail({
    to: email,
    name: 'Admin',
    subject: `[PRUEBA] ${finalSubject}`,
    htmlContent: finalBody,
  })

  if (!result.success) {
    return { success: false, message: 'Error al enviar el email de prueba.' }
  }

  return { success: true, message: 'Email de prueba enviado a ' + email }
}

export async function sendMassEmailTestAction(prevState: any, formData: FormData) {
  const email = (formData.get('test_email') as string)?.trim()
  const subject = (formData.get('subject') as string)?.trim()
  const body = formData.get('body') as string

  if (!email || !subject || !body) {
    return { success: false, message: 'Completá asunto, contenido y email de prueba.' }
  }

  const finalSubject = interpolate(subject, PREVIEW_DATA)
  const finalBody = buildEmailHtml(interpolate(body, PREVIEW_DATA))

  const result = await sendEmail({
    to: email,
    name: 'Prueba Admin',
    subject: `[PRUEBA MASIVA] ${finalSubject}`,
    htmlContent: finalBody,
  })

  if (!result.success) {
    return { success: false, message: 'No se pudo enviar el email de prueba.' }
  }

  return { success: true, message: `Prueba enviada correctamente a ${email}` }
}

export async function sendMassEmailAction(prevState: any, formData: FormData) {
  const subject = (formData.get('subject') as string)?.trim()
  const body = formData.get('body') as string
  const confirmed = formData.get('confirmed') === 'yes'

  if (!subject || !body) {
    return { success: false, message: 'Completá asunto y contenido antes de enviar.' }
  }

  if (!confirmed) {
    return { success: false, message: 'Debes confirmar el envío masivo para continuar.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('id, contact_name, brand_name, email')
    .not('email', 'is', null)

  if (error) {
    return { success: false, message: `No se pudieron cargar los clientes: ${error.message}` }
  }

  const recipientsRaw = (data ?? []) as unknown as Recipient[]
  const uniqueMap = new Map<string, Recipient>()

  for (const recipient of recipientsRaw) {
    const email = recipient.email?.trim().toLowerCase()
    if (!email) continue
    if (!uniqueMap.has(email)) uniqueMap.set(email, recipient)
  }

  const recipients = Array.from(uniqueMap.values())

  if (recipients.length === 0) {
    return { success: false, message: 'No hay clientes con email cargado.' }
  }

  let sent = 0
  let failed = 0
  const failedEmails: string[] = []

  const batchSize = 12
  for (let index = 0; index < recipients.length; index += batchSize) {
    const batch = recipients.slice(index, index + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (recipient) => {
        const vars: Record<string, string> = {
          '{{nombre}}': recipient.contact_name ?? 'Cliente',
          '{{marca}}': recipient.brand_name ?? 'Tu marca',
          '{{servicio}}': '',
          '{{dominio}}': '',
          '{{dias}}': '',
          '{{monto}}': '',
        }

        const finalSubject = interpolate(subject, vars)
        const finalBody = buildEmailHtml(interpolate(body, vars))
        const response = await sendEmail({
          to: recipient.email!,
          name: recipient.contact_name || recipient.brand_name || 'Cliente',
          subject: finalSubject,
          htmlContent: finalBody,
        })

        return { ok: response.success, email: recipient.email! }
      }),
    )

    for (const result of batchResults) {
      if (result.ok) {
        sent += 1
      } else {
        failed += 1
        if (failedEmails.length < 6) failedEmails.push(result.email)
      }
    }
  }

  revalidatePath('/admin/settings')

  if (failed === 0) {
    return {
      success: true,
      message: `Email masivo enviado a ${sent} cliente(s).`,
      sent,
      failed,
      total: recipients.length,
    }
  }

  return {
    success: failed < recipients.length,
    message: `Envío finalizado: ${sent} enviado(s), ${failed} fallido(s).`,
    sent,
    failed,
    total: recipients.length,
    failedEmails,
  }
}
