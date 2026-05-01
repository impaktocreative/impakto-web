/**
 * Generates a premium branded HTML email for Impakto Creative.
 * The `body` is plain text with \n for line breaks.
 */
export function buildEmailHtml(body: string): string {
  const htmlBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')
    .map(line => line.trim() === '' ? '<br/>' : `<p style="margin:0 0 14px 0;line-height:1.6;">${line}</p>`)
    .join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Impakto Creative</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0a0a0a;padding:32px 40px;text-align:left;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">IMPAKTO</span>
                    <span style="font-size:22px;font-weight:300;color:#9ca3af;letter-spacing:-0.5px;"> CREATIVE</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:6px;">
                    <span style="font-size:11px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;">Agencia Digital</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#e5e7eb 0%,#d1d5db 100%);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px 40px;color:#1f2937;font-size:15px;">
              ${htmlBody}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px 40px;background-color:#fafafa;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#111827;letter-spacing:-0.2px;">Impakto Creative</p>
                    <p style="margin:0 0 2px 0;font-size:12px;color:#6b7280;">Agencia de Marketing Digital &amp; Desarrollo Web</p>
                    <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;">Buenos Aires, Argentina</p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <a href="https://www.impaktocreative.com" style="font-size:12px;color:#374151;font-weight:500;text-decoration:none;border-bottom:1px solid #d1d5db;">www.impaktocreative.com</a>
                        </td>
                        <td style="color:#d1d5db;font-size:12px;">|</td>
                        <td style="padding-left:12px;">
                          <a href="mailto:impaktoagency@gmail.com" style="font-size:12px;color:#374151;text-decoration:none;border-bottom:1px solid #d1d5db;">impaktoagency@gmail.com</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0;font-size:11px;color:#9ca3af;">Este es un mensaje automático. Por favor no respondas directamente a este correo.</p>
            </td>
          </tr>

          <!-- Bottom bar -->
          <tr>
            <td style="background-color:#0a0a0a;height:4px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Replace template variables with real values */
export function interpolate(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(k, v), text)
}
