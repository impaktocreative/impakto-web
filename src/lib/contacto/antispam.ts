import 'server-only'

/**
 * Filtro de bots del formulario de contacto.
 *
 * El formulario recibía decenas de envíos por día con cada campo lleno de
 * letras al azar ("jcwyejkPkOjRSLNO") y un Gmail con puntos. Son bots que
 * mandan el POST directo a la ruta, o que cargan la página y la llenan en
 * medio segundo. Ninguna capa sola los para; juntas, sí:
 *
 *   token     la página pide un token al montar y lo devuelve al enviar.
 *             Un POST sin token nunca cargó la página: es un script.
 *   tiempo    el token lleva cuándo se emitió. Nadie llena seis campos en
 *             menos de cuatro segundos.
 *   honeypot  un campo que la persona no ve y el bot llena porque llena todo.
 *   texto     un campo de "situación actual" sin un solo espacio y con
 *             mayúsculas salpicadas no lo escribió nadie.
 *
 * Al bot se le contesta que salió todo bien. Si se le devuelve un error,
 * aprende y cambia; si cree que pasó, sigue mandando lo mismo y lo seguimos
 * tirando.
 *
 * Lo que no hace: limitar por IP. En serverless la memoria no se comparte
 * entre instancias, así que un contador acá adentro no cuenta. Eso va en el
 * Firewall del proyecto en Vercel.
 */

/** Menos que esto entre pedir el token y enviar, es un bot. */
const SEGUNDOS_MINIMOS = 4

/**
 * Más que esto, el token venció. Es generoso a propósito: alguien puede dejar
 * la pestaña abierta y volver después de almorzar.
 */
const HORAS_DE_VIDA = 24

/** Nombre del campo trampa. Lo que un bot quiere llenar y nosotros no pedimos. */
export const CAMPO_TRAMPA = 'website'

let avisado = false

function clave(): string {
  // Se separa por dominio ("contacto:") para que la misma clave no firme dos
  // cosas distintas de la misma manera.
  const secreto = process.env.CONTACTO_SECRET ?? process.env.CRON_SECRET ?? ''
  if (!secreto && !avisado) {
    // Sin secreto la firma se puede calcular desde afuera y el chequeo de
    // tiempo deja de valer. Las otras capas siguen, así que no se corta el
    // formulario; pero tiene que quedar en los logs.
    console.warn('[contacto] sin CONTACTO_SECRET ni CRON_SECRET: el token de tiempo es forjable')
    avisado = true
  }
  return `contacto:${secreto}`
}

async function firmar(mensaje: string): Promise<string> {
  const k = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(clave()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const firma = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(mensaje))
  return Buffer.from(firma).toString('base64url')
}

/** Token que la página pide al montar el formulario. */
export async function emitirToken(): Promise<string> {
  const emitido = Date.now().toString()
  return `${emitido}.${await firmar(emitido)}`
}

type Veredicto = { spam: false } | { spam: true; motivo: string }

async function verificarToken(token: unknown): Promise<string | null> {
  if (typeof token !== 'string' || !token) return 'sin token'

  const [emitido, firma] = token.split('.')
  if (!emitido || !firma) return 'token malformado'

  const esperada = await firmar(emitido)
  // Comparación de largo fijo: un `!==` corta en el primer byte distinto y
  // filtra por tiempo cuánto acertó el atacante.
  if (esperada.length !== firma.length) return 'firma inválida'
  let distinto = 0
  for (let i = 0; i < esperada.length; i++) {
    distinto |= esperada.charCodeAt(i) ^ firma.charCodeAt(i)
  }
  if (distinto !== 0) return 'firma inválida'

  const transcurrido = (Date.now() - Number(emitido)) / 1000
  if (!Number.isFinite(transcurrido)) return 'token malformado'
  if (transcurrido < SEGUNDOS_MINIMOS) return `enviado en ${transcurrido.toFixed(1)}s`
  if (transcurrido > HORAS_DE_VIDA * 3600) return 'token vencido'

  return null
}

/**
 * Texto que ninguna persona escribió.
 *
 * Diez letras o más, sin un solo espacio, y con mayúsculas donde ningún nombre
 * las pone: dos seguidas en medio de minúsculas ("IVyyd"), o una que no llega
 * a abrir una sílaba antes de que venga otra ("PkOj"). Un nombre real tiene
 * espacio; una sigla es corta; "MercadoLibre" o "GlaxoSmithKline" cambian de
 * caja, pero cada mayúscula abre un tramo entero de minúsculas.
 *
 * Contar saltos de caja no servía: "MercadoLibre" tiene tres, igual que el
 * spam. Lo que el spam no tiene es sílabas.
 */
export function esGalimatias(texto: string): boolean {
  if (texto.length < 10 || /\s/.test(texto)) return false
  const mayusSeguidasEntreMinus = /\p{Ll}\p{Lu}{2}|\p{Lu}{2}\p{Ll}/u.test(texto)
  const mayusQueNoAbreSilaba = /\p{Lu}\p{Ll}?(?=\p{Lu})/u.test(texto.slice(1))
  return mayusSeguidasEntreMinus || mayusQueNoAbreSilaba
}

export async function evaluarEnvio(datos: {
  token: unknown
  trampa: unknown
  textos: string[]
}): Promise<Veredicto> {
  if (typeof datos.trampa === 'string' && datos.trampa.trim()) {
    return { spam: true, motivo: 'campo trampa lleno' }
  }

  const motivoToken = await verificarToken(datos.token)
  if (motivoToken) return { spam: true, motivo: motivoToken }

  // Con uno solo podría ser una contraseña pegada por error en el campo
  // equivocado. Con dos, no.
  const galimatias = datos.textos.filter(esGalimatias).length
  if (galimatias >= 2) return { spam: true, motivo: `${galimatias} campos con letras al azar` }

  return { spam: false }
}
