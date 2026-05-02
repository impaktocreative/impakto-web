import { BrevoClient } from '@getbrevo/brevo'

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!
})

export async function sendEmail({
  to,
  subject,
  htmlContent,
  name,
  cc,
}: {
  to: string
  subject: string
  htmlContent: string
  name: string
  cc?: { email: string; name?: string }[]
}) {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: { name: 'Impakto Creative', email: 'impaktoagency@gmail.com' },
      to: [{ email: to, name: name }],
      ...(cc && cc.length > 0 ? { cc } : {}),
    })
    return { success: true, result }
  } catch (error) {
    console.error('Error sending email via Brevo:', error)
    return { success: false, error }
  }
}
