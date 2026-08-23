import { NextResponse } from 'next/server'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import { avisosInternos, copiaOculta } from '@/lib/correos'

const UPCOMING_DAYS_MAP = {
  '10_days': 10,
  '5_days': 5,
  '24_hours': 1,
} as const

type UpcomingReminderType = keyof typeof UPCOMING_DAYS_MAP
type ReminderType = UpcomingReminderType | 'overdue_every_3_days' | 'suspension_warning'

type ReminderServiceRow = {
  id: string
  domain_name: string | null
  last_payment_date?: string | null
  status?: string | null
  price: number | string | null
  currency: string | null
  next_payment_date: string | null
  services: { name: string | null } | Array<{ name: string | null }> | null
  clients:
    | { email: string | null; contact_name: string | null; brand_name: string | null }
    | Array<{ email: string | null; contact_name: string | null; brand_name: string | null }>
    | null
}

const TEMPLATE_FALLBACKS: Record<ReminderType, { subject: string; body: string } | null> = {
  '10_days': {
    subject: 'Recordatorio: {{servicio}} vence en {{dias}} dias',
    body: 'Hola {{nombre}},<br><br>Te recordamos que tu servicio <strong>{{servicio}}</strong> para <strong>{{marca}}</strong> vence en <strong>{{dias}} dias</strong>.<br><br>Dominio: {{dominio}}<br>Monto: {{monto}}<br><br>Si ya abonaste, podes ignorar este mensaje.',
  },
  '5_days': {
    subject: 'Tu servicio {{servicio}} vence en {{dias}} dias',
    body: 'Hola {{nombre}},<br><br>Faltan <strong>{{dias}} dias</strong> para el vencimiento de <strong>{{servicio}}</strong>.<br><br>Dominio: {{dominio}}<br>Monto: {{monto}}<br><br>Para evitar interrupciones, te recomendamos registrar el pago a tiempo.',
  },
  '24_hours': {
    subject: 'Ultimo aviso: {{servicio}} vence en 24 horas',
    body: 'Hola {{nombre}},<br><br>Este es el ultimo aviso: tu servicio <strong>{{servicio}}</strong> vence en 24 horas.<br><br>Dominio: {{dominio}}<br>Monto: {{monto}}<br><br>Por favor, realiza el pago para mantenerlo activo.',
  },
  'overdue_every_3_days': {
    subject: 'Servicio vencido hace {{dias_vencido}} dias: {{servicio}}',
    body: 'Hola {{nombre}},<br><br>Tu servicio <strong>{{servicio}}</strong> se encuentra vencido desde hace <strong>{{dias_vencido}} dias</strong>.<br><br>Dominio: {{dominio}}<br>Monto pendiente: {{monto}}<br><br>Este aviso se envia el primer dia de mora y luego cada 3 dias hasta registrar el pago.',
  },
  'suspension_warning': {
    subject: 'AVISO DE SUSPENSION: {{servicio}} - Impakto Creative',
    body: 'Hola {{nombre}},<br><br>Tu servicio <strong>{{servicio}}</strong> se encuentra vencido desde hace <strong>{{dias_vencido}} dias</strong> y no hemos recibido el pago correspondiente.<br><br>Dominio: {{dominio}}<br>Monto pendiente: {{monto}}<br><br>Por este motivo, el servicio sera SUSPENDIDO hasta recibir el pago. Si no recibimos el pago en los proximos 30 dias, el servicio sera suspendido de forma definitiva y eliminado de nuestro sistema.<br><br>Por favor, contactanos a la brevedad para regularizar tu situacion.<br><br>Saludos,<br>Impakto Creative',
  },
}

const CC_RECIPIENTS_24H = copiaOculta()

/** Días de mora a partir de los cuales el servicio se suspende. */
const DIAS_PARA_SUSPENDER = 15

/**
 * Destinatarios del aviso interno de suspensión. Se pueden pisar con
 * ADMIN_ALERT_EMAILS, separados por coma, sin tocar el código.
 */
const ADMINS = avisosInternos()

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function shouldSendOverdueReminder(daysOverdue: number): boolean {
  return daysOverdue === 1 || (daysOverdue > 1 && (daysOverdue - 1) % 3 === 0)
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createAdminSupabaseClient()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Falta configurar NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para ejecutar el cron.' },
      { status: 500 },
    )
  }

  // Load email templates from DB
  const { data: dbTemplates, error: tplError } = await supabase
    .from('email_templates')
    .select('type, subject, body')

  if (tplError) {
    console.error('No se pudieron cargar las plantillas de email, se usaran fallbacks:', tplError)
  }

  const templates = { ...TEMPLATE_FALLBACKS } as Record<ReminderType, { subject: string; body: string }>
  for (const template of dbTemplates ?? []) {
    if ((template.type as ReminderType) in templates && template.subject && template.body) {
      templates[template.type as ReminderType] = {
        subject: template.subject,
        body: template.body,
      }
    }
  }

  // Load active services
  const { data: activeServices, error } = await supabase
    .from('client_services')
    .select(`
      id, domain_name, price, currency, next_payment_date, last_payment_date, status,
      services ( name ),
      clients ( email, contact_name, brand_name )
    `)
    .in('status', ['activo', 'vencido', 'suspendido'])

  if (error || !activeServices) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  let emailsSent = 0
  let emailsFailed = 0
  let estadosCorregidos = 0
  const todayStartIso = startOfDay(new Date()).toISOString()

  // El estado de los servicios lo sincroniza el cron. Antes solo se movía al
  // registrar un cobro, así que un servicio que vencía y nadie pagaba seguía
  // figurando como activo para siempre: el panel mostraba al día lo que
  // estaba en mora.
  const hoyIso = new Date().toISOString().slice(0, 10)
  for (const service of activeServices as ReminderServiceRow[]) {
    if (!service.next_payment_date) continue
    const deberia = service.next_payment_date < hoyIso ? 'vencido' : 'activo'
    if (service.status === deberia) continue

    const { error: estadoError } = await supabase
      .from('client_services')
      .update({ status: deberia })
      .eq('id', service.id)

    if (!estadoError) {
      service.status = deberia
      estadosCorregidos++
    }
  }

  // Suspensión por mora prolongada.
  //
  // Pasados los 15 días el servicio se marca suspendido y se avisa a los
  // administradores en un solo mail con todos los casos del día, en lugar de
  // uno por servicio. El aviso queda registrado en email_logs para que no se
  // repita en cada corrida del cron.
  const aSuspender: { id: string; marca: string; servicio: string; dias: number; vencio: string }[] = []

  for (const service of activeServices as ReminderServiceRow[]) {
    if (!service.next_payment_date) continue
    if (service.status === 'suspendido' || service.status === 'inactivo') continue

    const diasDeMora = differenceInCalendarDays(startOfDay(new Date()), parseISO(service.next_payment_date))
    if (diasDeMora < DIAS_PARA_SUSPENDER) continue

    const { data: yaAvisado } = await supabase
      .from('email_logs')
      .select('id')
      .eq('client_service_id', service.id)
      .eq('reminder_type', 'admin_suspension')
      .gte('sent_at', `${service.last_payment_date ?? '1970-01-01'}T00:00:00Z`)
      .limit(1)

    if (yaAvisado && yaAvisado.length > 0) continue

    const cliente = Array.isArray(service.clients) ? service.clients[0] : service.clients
    const servicio = Array.isArray(service.services) ? service.services[0] : service.services

    aSuspender.push({
      id: service.id,
      marca: cliente?.brand_name ?? 'Sin marca',
      servicio: servicio?.name ?? 'Sin servicio',
      dias: diasDeMora,
      vencio: service.next_payment_date,
    })
  }

  let suspendidos = 0

  if (aSuspender.length > 0) {
    const { error: errorSuspension } = await supabase
      .from('client_services')
      .update({ status: 'suspendido' })
      .in('id', aSuspender.map((s) => s.id))

    if (!errorSuspension) {
      suspendidos = aSuspender.length

      const filas = aSuspender
        .map(
          (s) =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e2dd;">${s.marca}</td>` +
            `<td style="padding:8px 12px;border-bottom:1px solid #e2e2dd;">${s.servicio}</td>` +
            `<td style="padding:8px 12px;border-bottom:1px solid #e2e2dd;">${s.vencio}</td>` +
            `<td style="padding:8px 12px;border-bottom:1px solid #e2e2dd;text-align:right;"><strong>${s.dias} días</strong></td></tr>`,
        )
        .join('')

      const cuerpo =
        `<p style="margin:0 0 14px 0;">Estos servicios superaron los ${DIAS_PARA_SUSPENDER} días de mora y quedaron marcados como <strong>suspendidos</strong> en el panel:</p>` +
        `<table style="width:100%;border-collapse:collapse;font-size:14px;">` +
        `<tr><th align="left" style="padding:8px 12px;border-bottom:2px solid #0a0a09;">Cliente</th>` +
        `<th align="left" style="padding:8px 12px;border-bottom:2px solid #0a0a09;">Servicio</th>` +
        `<th align="left" style="padding:8px 12px;border-bottom:2px solid #0a0a09;">Venció</th>` +
        `<th align="right" style="padding:8px 12px;border-bottom:2px solid #0a0a09;">Mora</th></tr>` +
        filas +
        `</table>` +
        `<p style="margin:16px 0 0 0;">Hay que dar de baja el servicio o acordar la regularización con el cliente.</p>`

      for (const destinatario of ADMINS) {
        await sendEmail({
          to: destinatario,
          name: 'Administración',
          subject: `${aSuspender.length} servicio(s) para suspender por mora`,
          htmlContent: buildEmailHtml(cuerpo),
        })
      }

      await supabase.from('email_logs').insert(
        aSuspender.map((s) => ({ client_service_id: s.id, reminder_type: 'admin_suspension' })),
      )

      for (const service of activeServices as ReminderServiceRow[]) {
        if (aSuspender.some((s) => s.id === service.id)) service.status = 'suspendido'
      }
    }
  }

  for (const service of activeServices as ReminderServiceRow[]) {
    if (!service.next_payment_date) continue
    // Un servicio suspendido ya no se persigue por mail: pasó a gestión manual.
    if (service.status === 'suspendido') continue

    const dueDate = parseISO(service.next_payment_date)
    if (Number.isNaN(dueDate.getTime())) continue

    const daysLeft = differenceInCalendarDays(dueDate, startOfDay(new Date()))
    let reminderType: ReminderType | null = null

    for (const [type, days] of Object.entries(UPCOMING_DAYS_MAP)) {
      if (daysLeft === days) {
        reminderType = type as UpcomingReminderType
        break
      }
    }

    if (!reminderType && daysLeft < 0) {
      const daysOverdue = Math.abs(daysLeft)
      if (shouldSendOverdueReminder(daysOverdue)) {
        // Count how many overdue_every_3_days have been sent for this service
        // Solo cuentan los avisos del ciclo actual. Contando todo el
        // historial, un servicio que ya se atrasó dos veces en su vida
        // nunca vuelve a recibir recordatorios, aunque haya pagado y se
        // haya vuelto a atrasar.
        let consultaMora = supabase
          .from('email_logs')
          .select('*', { count: 'exact', head: true })
          .eq('client_service_id', service.id)
          .eq('reminder_type', 'overdue_every_3_days')

        if (service.last_payment_date) {
          consultaMora = consultaMora.gte('sent_at', `${service.last_payment_date}T00:00:00Z`)
        }

        const { count } = await consultaMora
        const overdueSentCount = count ?? 0

        if (overdueSentCount < 2) {
          reminderType = 'overdue_every_3_days'
        } else if (overdueSentCount === 2) {
          // Check if suspension warning already sent (prevents re-sending)
          let consultaSusp = supabase
            .from('email_logs')
            .select('id')
            .eq('client_service_id', service.id)
            .eq('reminder_type', 'suspension_warning')
            .limit(1)

          if (service.last_payment_date) {
            consultaSusp = consultaSusp.gte('sent_at', `${service.last_payment_date}T00:00:00Z`)
          }

          const { data: suspLog } = await consultaSusp

          if (!suspLog || suspLog.length === 0) {
            reminderType = 'suspension_warning'
          }
        }
        // If overdueSentCount > 2: already sent suspension, do nothing
      }
    }

    if (!reminderType) continue

    // Check if already sent
    const { data: logs } = await supabase
      .from('email_logs')
      .select('id')
      .eq('client_service_id', service.id)
      .eq('reminder_type', reminderType)
      .gte('sent_at', todayStartIso)
      .limit(1)

    if (logs && logs.length > 0) continue

    const clientData = Array.isArray(service.clients) ? service.clients[0] : service.clients
    const serviceData = Array.isArray(service.services) ? service.services[0] : service.services

    const clientEmail = clientData?.email?.trim()
    if (!clientEmail) continue

    const tpl = templates[reminderType]
    const vars: Record<string, string> = {
      '{{nombre}}': clientData?.contact_name ?? '',
      '{{marca}}': clientData?.brand_name ?? '',
      '{{servicio}}': serviceData?.name ?? '',
      '{{dominio}}': service.domain_name ?? 'N/A',
      '{{dias}}': String(Math.abs(daysLeft)),
      '{{dias_vencido}}': String(daysLeft < 0 ? Math.abs(daysLeft) : 0),
      '{{monto}}': `${service.currency === 'USD' ? 'USD' : '$'} ${Number(service.price).toLocaleString('es-AR')}`,
    }

    const subject = interpolate(tpl.subject, vars)
    const body = interpolate(tpl.body, vars)
    const htmlContent = buildEmailHtml(body)

    const toEmail = clientEmail.toLowerCase()
    const ccRecipients = reminderType === '24_hours' || reminderType === 'suspension_warning' ? CC_RECIPIENTS_24H : undefined

    const emailResult = await sendEmail({
      to: toEmail,
      name: clientData?.contact_name ?? clientData?.brand_name ?? 'Cliente',
      subject,
      htmlContent,
      cc: ccRecipients,
    })

    if (emailResult.success) {
      await supabase.from('email_logs').insert([{
        client_service_id: service.id,
        reminder_type: reminderType,
      }])

      emailsSent++
      continue
    }

    emailsFailed++
  }

  return NextResponse.json({ success: true, emailsSent, emailsFailed, estadosCorregidos, suspendidos })
}
