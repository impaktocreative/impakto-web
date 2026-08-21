'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  hoyIso,
  montoNeto,
  proximoVencimiento,
  sumarMeses,
} from '@/lib/billing'
import type { ActionState } from '@/types/admin'

const PAYMENT_TEMPLATE_FALLBACK = {
  subject: 'Pago recibido - {{servicio}}',
  body: 'Hola {{nombre}},<br><br>Te confirmamos que registramos correctamente tu pago para <strong>{{servicio}}</strong>.<br><br>Dominio: {{dominio}}<br>Monto: {{monto}}<br><br>Gracias por trabajar con Impakto Creative.',
}

function formatearFecha(iso: string) {
  return format(new Date(iso + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Recalcula último pago, próximo vencimiento y estado de un servicio a
 * partir de los pagos que quedan registrados.
 *
 * Se usa después de editar o borrar un pago: si el vencimiento solo se
 * moviera al registrar, corregir un error dejaría al servicio marcado como
 * al día sin estarlo.
 */
async function recalcularServicio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientServiceId: string,
) {
  const { data: servicio } = await supabase
    .from('client_services')
    .select('duration_months, status')
    .eq('id', clientServiceId)
    .single()

  if (!servicio) return

  const { data: pagos } = await supabase
    .from('payments')
    .select('payment_date')
    .eq('client_service_id', clientServiceId)
    .order('payment_date', { ascending: false })
    .limit(1)

  const ultimoPago = pagos?.[0]?.payment_date ?? null
  const duracion = Number(servicio.duration_months) || 1

  const proximo = ultimoPago ? sumarMeses(ultimoPago, duracion) : null

  // Un servicio dado de baja no vuelve solo por recalcular fechas.
  const estado =
    servicio.status === 'inactivo'
      ? 'inactivo'
      : proximo && proximo < hoyIso()
        ? 'vencido'
        : 'activo'

  await supabase
    .from('client_services')
    .update({ last_payment_date: ultimoPago, next_payment_date: proximo, status: estado })
    .eq('id', clientServiceId)
}

export async function registerPaymentAction(_prevState: ActionState | null, formData: FormData) {
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

  // El aviso de duplicado se busca ANTES de insertar. Consultarlo después
  // encuentra siempre el pago recién creado y el aviso salta en todos los
  // cobros, que es lo que venía pasando.
  const hace10Dias = sumarMeses(payment_date, 0)
  const desde = new Date(hace10Dias + 'T00:00:00')
  desde.setDate(desde.getDate() - 10)
  const desdeIso = desde.toISOString().slice(0, 10)

  const { data: pagosPrevios } = await supabase
    .from('payments')
    .select('payment_date')
    .eq('client_service_id', client_service_id)
    .gte('payment_date', desdeIso)
    .lte('payment_date', payment_date)
    .order('payment_date', { ascending: false })
    .limit(1)

  const duplicateWarning = pagosPrevios?.length
    ? `Ojo: ya había un pago de este servicio el ${formatearFecha(pagosPrevios[0].payment_date)}.`
    : ''

  const nextDateStr = proximoVencimiento(
    (clientService as { next_payment_date?: string | null }).next_payment_date ?? null,
    payment_date,
    durationMonths,
  )

  const deductBankFee = (clientService as { deduct_bank_fee?: boolean }).deduct_bank_fee === true
  const netAmount = montoNeto(amount, deductBankFee)
  const receiver = (clientService as { receiver?: string | null }).receiver ?? null

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

  // La cadena de avisos de mora se cuenta desde el último pago. Sin esto los
  // registros viejos se acumulan para siempre y el servicio deja de recibir
  // recordatorios aunque se atrase de nuevo.
  await supabase
    .from('email_logs')
    .delete()
    .eq('client_service_id', client_service_id)
    .in('reminder_type', ['overdue_every_3_days', 'suspension_warning'])

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
  } else if (!clientEmail) {
    warningMessage = ' (el cliente no tiene email cargado, no se envió confirmación)'
  }

  if (client_id) revalidatePath(`/admin/clients/${client_id}`)
  revalidatePath('/admin')
  revalidatePath('/admin/income')
  return {
    success: true,
    message: `Próximo vencimiento: ${formatearFecha(nextDateStr)}${warningMessage}`,
    warning: duplicateWarning,
  }
}

export async function updatePaymentAction(_prevState: ActionState | null, formData: FormData) {
  const id = formData.get('id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const payment_date = formData.get('payment_date') as string

  if (!id || Number.isNaN(amount) || amount <= 0 || !payment_date) {
    return { success: false, message: 'ID, monto y fecha son requeridos.' }
  }

  const supabase = await createClient()

  // Hay que releer el servicio porque el neto depende de si ese servicio
  // descuenta la retención bancaria. Si solo se guardara el monto, el neto
  // quedaría calculado sobre el importe anterior.
  const { data: pagoActual } = await supabase
    .from('payments')
    .select('client_service_id, client_services ( deduct_bank_fee )')
    .eq('id', id)
    .single()

  const servicio = Array.isArray(pagoActual?.client_services)
    ? pagoActual?.client_services[0]
    : pagoActual?.client_services
  const netAmount = montoNeto(amount, servicio?.deduct_bank_fee === true)

  const { error } = await supabase
    .from('payments')
    .update({ amount, net_amount: netAmount, payment_date })
    .eq('id', id)

  if (error) return { success: false, message: `Error al actualizar pago: ${error.message}` }

  // Cambiar la fecha del pago mueve el vencimiento del servicio.
  if (pagoActual?.client_service_id) {
    await recalcularServicio(supabase, pagoActual.client_service_id)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/income')
  revalidatePath('/admin/clients')
  return { success: true, message: 'Pago actualizado y vencimiento recalculado.' }
}

export async function deletePaymentAction(id: string) {
  const supabase = await createClient()

  const { data: pago } = await supabase
    .from('payments')
    .select('client_service_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('payments').delete().eq('id', id)

  if (error) return { success: false, message: `Error al eliminar pago: ${error.message}` }

  // Sin esto el servicio queda con el vencimiento que le había dado el pago
  // borrado: figura al día sin estarlo.
  if (pago?.client_service_id) {
    await recalcularServicio(supabase, pago.client_service_id)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/income')
  revalidatePath('/admin/clients')
  return { success: true }
}

/**
 * Ingreso suelto, sin cliente ni servicio.
 *
 * Va a la misma tabla que los cobros para que entre al balance sin lógica
 * aparte. `client_service_id` queda en null y el concepto lo explica
 * `description`, que es lo único que distingue una fila de la otra.
 */
export async function registerManualIncomeAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const description = String(formData.get('description') ?? '').trim()
  const amount = parseFloat(formData.get('amount') as string)
  const payment_date = formData.get('payment_date') as string
  const currency = (formData.get('currency') as string) || 'ARS'
  const receiver = (formData.get('receiver') as string) || null

  if (!description) {
    return { success: false, message: 'Poné un concepto para saber de qué es el ingreso.' }
  }

  if (Number.isNaN(amount) || amount <= 0 || !payment_date) {
    return { success: false, message: 'Monto y fecha son requeridos.' }
  }

  if (!receiver) {
    return { success: false, message: 'Elegí quién recibió el pago.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('payments').insert({
    client_service_id: null,
    description,
    amount,
    net_amount: null,
    currency,
    payment_date,
    receiver,
  })

  if (error) return { success: false, message: `Error al registrar el ingreso: ${error.message}` }

  revalidatePath('/admin')
  revalidatePath('/admin/income')
  revalidatePath('/admin/balance')
  return { success: true, message: `Ingreso registrado: ${description}` }
}
