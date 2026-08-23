/**
 * Las direcciones del estudio, en un solo lugar.
 *
 * Antes vivían repartidas en cinco archivos y ya habían divergido: el
 * formulario de contacto iba a una casilla, los avisos de suspensión a otras
 * dos, y la copia oculta de los recordatorios a una tercera. Nadie había
 * decidido eso; se fue apilando.
 *
 * Regla: todo lo que el estudio tiene que leer llega a EQUIPO con copia a
 * COPIA. Nada más.
 *
 * La distinción entre copia visible y copia oculta importa y no es estética:
 * en un correo que va a un cliente, las casillas internas van en `bcc` para
 * que el cliente no las vea ni pueda responder a ellas por error. En un correo
 * que va al equipo, van en `cc` porque no hay nada que esconder.
 */

/** Casilla principal del estudio. Todo llega acá. */
export const EQUIPO = 'impaktoagency@gmail.com'

/**
 * La dirección que se muestra en el sitio: pie, contacto, privacidad y datos
 * estructurados. Es la misma que recibe, para que nadie escriba a una casilla
 * que no se lee.
 *
 * No confundir con el remitente. Esta se publica y recibe; aquella sale y no
 * puede cambiarse a una casilla de Gmail sin romper la entrega.
 */
export const CORREO_PUBLICO = EQUIPO

/** Copia de todo lo anterior. */
export const COPIA = 'studio.impakto@gmail.com'

/**
 * Desde dónde sale cada correo. Debe estar verificado en Brevo, y por eso sigue
 * siendo la dirección del dominio: mandar "desde" gmail.com a través de Brevo
 * falla SPF y DMARC y termina en correo no deseado.
 *
 * Es una función y no una constante a propósito: leer process.env al cargar el
 * módulo lo haría inservible desde un componente de cliente, y la dirección
 * pública de acá abajo sí se usa en el pie y en contacto.
 */
export function remitente(): { email: string; name: string } {
  return {
    email: process.env.BREVO_SENDER_EMAIL || 'hola@impaktocreative.com',
    name: process.env.BREVO_SENDER_NAME || 'Impakto Creative',
  }
}

const NOMBRE = 'Impakto Creative'

/**
 * Destinatarios de un correo dirigido al estudio: el formulario público, las
 * alertas del cron. Se lee, no se esconde.
 *
 * `CONTACT_TO_EMAIL` sigue pudiendo redirigirlo sin desplegar, pero si está
 * cargada con otro valor, ese valor gana. Es la única forma de que esto llegue
 * a otro lado.
 */
export function paraElEquipo(): { to: { email: string; name: string }[]; cc: { email: string; name: string }[] } {
  const principal = (process.env.CONTACT_TO_EMAIL || EQUIPO).trim()
  return {
    to: [{ email: principal, name: 'Equipo Impakto' }],
    // Sin copia a sí mismo si alguien redirigió el principal a la casilla de copia.
    cc: principal === COPIA ? [] : [{ email: COPIA, name: NOMBRE }],
  }
}

/**
 * A dónde vuelve la respuesta de un correo que va a un cliente.
 *
 * Sin esto, responder un recordatorio manda el mensaje a la dirección
 * remitente, que es la del dominio y no la casilla que el estudio lee. El
 * remitente no se puede cambiar a una casilla de Gmail: mandar "desde"
 * gmail.com a través de Brevo falla SPF y DMARC y termina en correo no
 * deseado. Así que el remitente queda como está y la conversación se redirige.
 */
export function respuestasA(): { email: string; name: string } {
  return { email: EQUIPO, name: NOMBRE }
}

/**
 * Copia oculta de un correo que va a un cliente. El cliente ve solo su propia
 * dirección; el estudio recibe el mismo mensaje sin aparecer en la cabecera.
 */
export function copiaOculta(): { email: string; name: string }[] {
  return [
    { email: EQUIPO, name: NOMBRE },
    { email: COPIA, name: NOMBRE },
  ]
}

/**
 * Direcciones de las alertas internas del cron (servicios suspendidos).
 * `ADMIN_ALERT_EMAILS` las sobrescribe, separadas por coma.
 */
export function avisosInternos(): string[] {
  return (process.env.ADMIN_ALERT_EMAILS || `${EQUIPO},${COPIA}`)
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)
}
