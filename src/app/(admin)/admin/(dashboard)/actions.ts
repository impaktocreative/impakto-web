'use server'

import { sendEmail } from '@/utils/brevo'

export async function sendTestEmailAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { success: false, message: 'El correo electrónico es requerido.' }
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-w-md; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #000;">¡Hola!</h2>
      <p>Este es un correo de prueba enviado desde el <strong>Panel de Administración de Impakto Creative</strong>.</p>
      <p>Si has recibido este mensaje, significa que la integración con la API de Brevo está funcionando correctamente.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">
        Este es un mensaje automático. Por favor, no respondas a este correo.
      </p>
    </div>
  `

  const result = await sendEmail({
    to: email,
    subject: 'Correo de Prueba - Impakto Admin',
    name: 'Administrador',
    htmlContent,
  })

  if (result.success) {
    return { success: true, message: `Correo de prueba enviado con éxito a ${email}` }
  } else {
    return { success: false, message: 'Error al enviar el correo. Por favor, revisa la configuración de Brevo.' }
  }
}
