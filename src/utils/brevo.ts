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
      sender: { name: 'Impakto Creative', email: 'hola@impaktocreative.com' },
      to: [{ email: to, name: name }],
      bcc: [{ email: 'impaktoagency@gmail.com', name: 'Impakto Creative' }],
      ...(cc && cc.length > 0 ? { cc } : {}),
    })
    return { success: true, result }
  } catch (error: unknown) {
    const err = error as { response?: { body?: unknown }; message?: string }
    const errorBody = err?.response?.body ?? null
    console.error('Error sending email via Brevo:', {
      to,
      subject,
      message: err?.message ?? 'Unknown error',
      responseBody: errorBody,
    })
    return { success: false, error: errorBody ?? error }
  }
}
