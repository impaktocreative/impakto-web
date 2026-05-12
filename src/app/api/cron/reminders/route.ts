import { NextResponse } from 'next/server'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'

const UPCOMING_DAYS_MAP = {
  '10_days': 10,
  '5_days': 5,
  '24_hours': 1,
} as const

type UpcomingReminderType = keyof typeof UPCOMING_DAYS_MAP
type ReminderType = UpcomingReminderType | 'overdue_every_3_days'

type ReminderServiceRow = {
  id: string
  domain_name: string | null
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
}

const CC_RECIPIENTS_24H = [{ email: 'impaktoagency@gmail.com', name: 'Impakto Creative' }]

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
      id, domain_name, price, currency, next_payment_date,
      services ( name ),
      clients ( email, contact_name, brand_name )
    `)
    .in('status', ['activo', 'vencido'])

  if (error || !activeServices) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  let emailsSent = 0
  let emailsFailed = 0
  const todayStartIso = startOfDay(new Date()).toISOString()

  for (const service of activeServices as ReminderServiceRow[]) {
    if (!service.next_payment_date) continue

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
        reminderType = 'overdue_every_3_days'
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
    const ccRecipients = reminderType === '24_hours' ? CC_RECIPIENTS_24H : undefined

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

  return NextResponse.json({ success: true, emailsSent, emailsFailed })
}
