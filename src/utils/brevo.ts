import * as brevo from '@getbrevo/brevo'

const apiInstance = new brevo.TransactionalEmailsApi()

// @ts-ignore - The Brevo SDK types are slightly mismatched for setting the API key, this is the official workaround
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
)

export async function sendEmail({
  to,
  subject,
  htmlContent,
  name,
}: {
  to: string
  subject: string
  htmlContent: string
  name: string
}) {
  const sendSmtpEmail = new brevo.SendSmtpEmail()
  sendSmtpEmail.subject = subject
  sendSmtpEmail.htmlContent = htmlContent
  sendSmtpEmail.sender = { name: 'Impakto Creative', email: 'impaktoagency@gmail.com' }
  sendSmtpEmail.to = [{ email: to, name: name }]

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    return { success: true, result }
  } catch (error) {
    console.error('Error sending email via Brevo:', error)
    return { success: false, error }
  }
}
