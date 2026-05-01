import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/brevo'
import { differenceInDays } from 'date-fns'

export async function GET(request: Request) {
  // Verificación simple de token para proteger el cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  // 1. Obtener servicios activos
  const { data: activeServices, error } = await supabase
    .from('client_services')
    .select(`
      id,
      domain_name,
      price_ars,
      next_payment_date,
      services ( name ),
      clients ( email, contact_name, brand_name )
    `)
    .eq('status', 'activo')

  if (error || !activeServices) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  let emailsSent = 0;

  for (const service of activeServices as any[]) {
    const daysLeft = differenceInDays(new Date(service.next_payment_date), new Date())
    let reminderType = null

    if (daysLeft === 10) reminderType = '10_days'
    else if (daysLeft === 5) reminderType = '5_days'
    else if (daysLeft === 1) reminderType = '24_hours'

    if (reminderType) {
      // Verificar si ya se envió el recordatorio
      const { data: logs } = await supabase
        .from('email_logs')
        .select('id')
        .eq('client_service_id', service.id)
        .eq('reminder_type', reminderType)
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      
      if (!logs || logs.length === 0) {
        // Enviar correo al cliente
        const clientEmail = service.clients.email
        if (clientEmail) {
          const subject = `Recordatorio de vencimiento: ${service.services.name} - ${service.domain_name}`
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hola ${service.clients.contact_name},</h2>
              <p>Le escribimos desde Impakto Creative para recordarle que su servicio de <strong>${service.services.name}</strong> (${service.domain_name || 'N/A'}) vencerá en <strong>${daysLeft} días</strong>.</p>
              <p>Monto a abonar: <strong>$${Number(service.price_ars).toLocaleString('es-AR')}</strong></p>
              <p>Por favor, contáctese con nosotros para gestionar la renovación y evitar la suspensión del servicio.</p>
              <br/>
              <p>Saludos cordiales,</p>
              <p><strong>El equipo de Impakto Creative</strong></p>
            </div>
          `

          const emailResult = await sendEmail({
            to: clientEmail,
            name: service.clients.contact_name,
            subject,
            htmlContent
          })

          if (emailResult.success) {
            // Notificar a Impakto
            await sendEmail({
              to: 'impaktoagency@gmail.com',
              name: 'Impakto Admin',
              subject: `[Aviso Interno] Recordatorio enviado a ${service.clients.brand_name}`,
              htmlContent: `<p>Se ha enviado automáticamente un recordatorio de ${daysLeft} días a ${service.clients.brand_name} por el servicio ${service.services.name}.</p>`
            })

            // Registrar log
            await supabase.from('email_logs').insert([{
              client_service_id: service.id,
              reminder_type: reminderType
            }])

            emailsSent++
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true, emailsSent })
}
