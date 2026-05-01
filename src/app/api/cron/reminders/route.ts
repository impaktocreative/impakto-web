import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/brevo'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import { differenceInDays } from 'date-fns'

const REMINDER_TYPES = ['10_days', '5_days', '24_hours'] as const
type ReminderType = typeof REMINDER_TYPES[number]

const DAYS_MAP: Record<ReminderType, number> = {
  '10_days': 10,
  '5_days': 5,
  '24_hours': 1,
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
    .eq('status', 'activo')

  if (error || !activeServices) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  let emailsSent = 0

  for (const service of activeServices as any[]) {
    if (!service.next_payment_date) continue

    const daysLeft = differenceInDays(new Date(service.next_payment_date), new Date())
    let reminderType: ReminderType | null = null

    for (const [type, days] of Object.entries(DAYS_MAP)) {
      if (daysLeft === days) { reminderType = type as ReminderType; break }
    }

    if (!reminderType) continue

    const tpl = templates[reminderType]
    if (!tpl) continue

    // Check if already sent
    const { data: logs } = await supabase
      .from('email_logs')
      .select('id')
      .eq('client_service_id', service.id)
      .eq('reminder_type', reminderType)
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (logs && logs.length > 0) continue

    const clientEmail = service.clients?.email
    if (!clientEmail) continue

    const vars: Record<string, string> = {
      '{{nombre}}': service.clients?.contact_name ?? '',
      '{{marca}}': service.clients?.brand_name ?? '',
      '{{servicio}}': service.services?.name ?? '',
      '{{dominio}}': service.domain_name ?? 'N/A',
      '{{dias}}': String(daysLeft),
      '{{monto}}': `${service.currency === 'USD' ? 'USD' : '$'} ${Number(service.price).toLocaleString('es-AR')}`,
    }

    const subject = interpolate(tpl.subject, vars)
    const body = interpolate(tpl.body, vars)
    const htmlContent = buildEmailHtml(body)

    const emailResult = await sendEmail({
      to: clientEmail,
      name: service.clients.contact_name,
      subject,
      htmlContent,
    })

    if (emailResult.success) {
      // Internal notification (plain, no fancy template needed)
      await sendEmail({
        to: 'impaktoagency@gmail.com',
        name: 'Impakto Admin',
        subject: `[Interno] Recordatorio enviado a ${service.clients.brand_name}`,
        htmlContent: buildEmailHtml(
          `Se envió automáticamente un recordatorio de ${daysLeft} día(s) a ${service.clients.brand_name} por el servicio ${service.services?.name ?? ''}.`
        ),
      })

      await supabase.from('email_logs').insert([{
        client_service_id: service.id,
        reminder_type: reminderType,
      }])

      emailsSent++
    }
  }

  return NextResponse.json({ success: true, emailsSent })
}
