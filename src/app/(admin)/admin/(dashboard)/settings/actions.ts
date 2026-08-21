'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import type { ActionState } from '@/types/admin'
import { cuitValido, soloDigitos } from '@/lib/cuit'

const PREVIEW_DATA: Record<string, string> = {
  '{{nombre}}': 'Juan García',
  '{{marca}}': 'Mi Empresa S.A.',
  '{{servicio}}': 'Hosting Web Premium',
  '{{dominio}}': 'misitioweb.com',
  '{{dias}}': '10',
  '{{dias_vencido}}': '6',
  '{{monto}}': '25.000',
}

type Recipient = {
  id: string
  contact_name: string | null
  brand_name: string | null
  email: string | null
}

export async function saveTemplateAction(prevState: ActionState | null, formData: FormData) {
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

export async function sendTestEmailAction(prevState: ActionState | null, formData: FormData) {
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

export async function sendMassEmailTestAction(prevState: ActionState | null, formData: FormData) {
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

export async function sendMassEmailAction(prevState: ActionState | null, formData: FormData) {
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
          '{{dias_vencido}}': '',
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

/**
 * Datos fiscales de un emisor. El CUIT es lo único que ARCA usa para
 * identificar quién factura, así que se valida antes de guardarlo y se bloquea
 * una vez que ese emisor tiene comprobantes: cambiarlo dejaría una serie
 * numerada a nombre de otro contribuyente.
 */
export async function saveEmisorAction(prevState: ActionState | null, formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'Falta el emisor.' }

  const razonSocial = ((formData.get('razon_social') as string) ?? '').trim()
  if (!razonSocial) return { success: false, message: 'La razón social es requerida.' }

  const cuitTexto = soloDigitos((formData.get('cuit') as string) ?? '')
  if (!cuitValido(cuitTexto)) {
    return { success: false, message: 'El CUIT no es válido. Tienen que ser 11 dígitos y el último es un verificador.' }
  }
  const cuit = Number(cuitTexto)

  const ptoVta = Number(formData.get('pto_vta'))
  if (!Number.isInteger(ptoVta) || ptoVta < 1) {
    return { success: false, message: 'El punto de venta tiene que ser un número mayor a cero.' }
  }

  const condicionFiscal = formData.get('condicion_fiscal') as string
  if (!['monotributo', 'responsable_inscripto', 'exento'].includes(condicionFiscal)) {
    return { success: false, message: 'Condición fiscal inválida.' }
  }

  const entorno = formData.get('entorno') as string
  if (!['homologacion', 'produccion'].includes(entorno)) {
    return { success: false, message: 'Entorno inválido.' }
  }

  const supabase = await createClient()

  const { data: actual, error: errorLectura } = await supabase
    .from('arca_emisores')
    .select('cuit')
    .eq('id', id)
    .single()

  if (errorLectura || !actual) {
    return { success: false, message: 'No se encontró el emisor.' }
  }

  if (Number(actual.cuit) !== cuit) {
    const { count } = await supabase
      .from('arca_comprobantes')
      .select('id', { count: 'exact', head: true })
      .eq('emisor_id', id)

    if ((count ?? 0) > 0) {
      return {
        success: false,
        message: `No se puede cambiar el CUIT: este emisor ya tiene ${count} comprobante(s). Cargá un emisor nuevo en vez de reescribir este.`,
      }
    }
  }

  const { error } = await supabase
    .from('arca_emisores')
    .update({
      razon_social: razonSocial,
      cuit,
      pto_vta: ptoVta,
      condicion_fiscal: condicionFiscal,
      entorno,
      domicilio: ((formData.get('domicilio') as string) ?? '').trim() || null,
      pie_comprobante: ((formData.get('pie_comprobante') as string) ?? '').trim() || null,
      ingresos_brutos: ((formData.get('ingresos_brutos') as string) ?? '').trim() || null,
      inicio_actividades: ((formData.get('inicio_actividades') as string) ?? '') || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath('/admin/settings')
  return { success: true, message: 'Datos de facturación guardados.' }
}

/**
 * Guarda la llave y el modelo del asesor del sitio.
 *
 * La llave se escribe solo si vino algo: el campo llega vacío cuando el
 * administrador entró a cambiar el modelo y no quiere tocar la llave, y en ese
 * caso sobrescribirla con un string vacío apagaría el asesor sin aviso.
 */
export async function guardarConfigIAAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const apiKey = ((formData.get('apiKey') as string) ?? '').trim()
  const model = ((formData.get('model') as string) ?? '').trim()

  const supabase = await createClient()
  const filas: { key: string; value: string; updated_at: string }[] = []
  const ahora = new Date().toISOString()

  if (apiKey) filas.push({ key: 'openrouter.api_key', value: apiKey, updated_at: ahora })
  if (model) filas.push({ key: 'openrouter.model', value: model, updated_at: ahora })

  if (!filas.length) {
    return { success: false, message: 'No hay nada que guardar.' }
  }

  const { error } = await supabase.from('app_settings').upsert(filas, { onConflict: 'key' })
  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath('/admin/settings')
  return {
    success: true,
    message: apiKey ? 'Llave y modelo guardados.' : 'Modelo guardado.',
  }
}
