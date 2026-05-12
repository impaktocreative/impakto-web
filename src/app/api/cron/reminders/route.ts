import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import { differenceInDays } from 'date-fns'

const UPCOMING_DAYS_MAP = {
  '10_days': 10,
  '5_days': 5,
  '24_hours': 1,
} as const

type UpcomingReminderType = keyof typeof UPCOMING_DAYS_MAP
type ReminderType = UpcomingReminderType | 'overdue_every_3_days'

const TEMPLATE_FALLBACKS: Record<ReminderType, { subject: string; body: string } | null> = {
  '10_days': null,
  '5_days': null,
  '24_hours': null,
  'overdue_every_3_days': {
    subject: 'Servicio vencido hace {{dias_vencido}} días: {{servicio}}',
    body: 'Hola {{nombre}},<br><br>Tu servicio <strong>{{servicio}}</strong> se encuentra vencido desde hace <strong>{{dias_vencido}} días</strong>.<br><br>Dominio: {{dominio}}<br>Monto pendiente: {{monto}}<br><br>Este recordatorio se enviará cada 3 días hasta registrar el pago.',
  },
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  // Load email templates from DB
  const { data: dbTemplates, error: tplError } = await supabase
    .from('email_templates')
    .select('type, subject, body')

  if (tplError || !dbTemplates || dbTemplates.length === 0) {
    return NextResponse.json({ error: 'No se pudieron cargar las plantillas de email.' }, { status: 500 })
  }

  const templates = Object.fromEntries(dbTemplates.map(t => [t.type, t])) as Record<string, { subject: string; body: string }>

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

  for (const service of activeServices as any[]) {
    if (!service.next_payment_date) continue

    const daysLeft = differenceInDays(new Date(service.next_payment_date), new Date())
    let reminderType: ReminderType | null = null

    for (const [type, days] of Object.entries(UPCOMING_DAYS_MAP)) {
      if (daysLeft === days) {
        reminderType = type as UpcomingReminderType
        break
      }
    }

    if (!reminderType && daysLeft < 0) {
      const daysOverdue = Math.abs(daysLeft)
      if (daysOverdue >= 3 && daysOverdue % 3 === 0) {
        reminderType = 'overdue_every_3_days'
      }
    }

    if (!reminderType) continue

    const tpl = templates[reminderType] ?? TEMPLATE_FALLBACKS[reminderType]

    if (!tpl) continue

    // Check if already sent
    const sentSince = reminderType === 'overdue_every_3_days'
      ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: logs } = await supabase
      .from('email_logs')
      .select('id')
      .eq('client_service_id', service.id)
      .eq('reminder_type', reminderType)
      .gte('sent_at', sentSince)

    if (logs && logs.length > 0) continue

    const clientEmail = service.clients?.email
    if (!clientEmail) continue

    const vars: Record<string, string> = {
      '{{nombre}}': service.clients?.contact_name ?? '',
      '{{marca}}': service.clients?.brand_name ?? '',
      '{{servicio}}': service.services?.name ?? '',
      '{{dominio}}': service.domain_name ?? 'N/A',
      '{{dias}}': String(Math.abs(daysLeft)),
      '{{dias_vencido}}': String(daysLeft < 0 ? Math.abs(daysLeft) : 0),
      '{{monto}}': `${service.currency === 'USD' ? 'USD' : '$'} ${Number(service.price).toLocaleString('es-AR')}`,
    }

    const subject = interpolate(tpl.subject, vars)
    const body = interpolate(tpl.body, vars)
    const htmlContent = buildEmailHtml(body)

    const toEmail = clientEmail
    let ccRecipients: { email: string; name: string }[] | undefined = undefined

    if (reminderType === '24_hours') {
      ccRecipients = [{ email: 'impaktoagency@gmail.com', name: 'Impakto Creative' }]
    }

    const emailResult = await sendEmail({
      to: toEmail,
      name: service.clients.contact_name,
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
    }
  }

  return NextResponse.json({ success: true, emailsSent })
}
