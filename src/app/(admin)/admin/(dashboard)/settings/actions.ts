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
