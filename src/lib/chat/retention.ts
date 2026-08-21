import { clienteChat } from './supabase'

/**
 * Vida de una conversación.
 *
 * Se mide desde `last_active_at`, no desde `started_at`: así una conversación
 * activa nunca se corta a mitad de frase el último día de la ventana.
 *
 * La expiración se aplica en lectura, no solo cuando corre una purga. Un id
 * viejo guardado en el navegador de alguien no puede reabrir un hilo fuera de
 * ventana aunque nunca haya pasado un job de limpieza. Y vive en un solo lugar
 * para que la ruta de streaming y la restauración del hilo no puedan discrepar
 * sobre qué significa "vencida".
 */

export const DIAS_DE_VIDA = 60

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type SesionChat = {
  id: string
  handoff: boolean
  last_active_at: string
}

function corte(): Date {
  const d = new Date()
  d.setDate(d.getDate() - DIAS_DE_VIDA)
  return d
}

/**
 * Devuelve la sesión si existe y sigue viva. Si venció, la borra (la cascada
 * se lleva la transcripción) y devuelve null, que es la señal para que el
 * navegador olvide el id y empiece limpio.
 */
export async function reclamarSesion(sessionId: string): Promise<SesionChat | null> {
  // Un id malformado haría que Postgres tire en el cast a uuid en vez de
  // simplemente no encontrar nada. Se rechaza antes de llegar a la consulta.
  if (!UUID.test(sessionId)) return null

  const supabase = clienteChat()
  if (!supabase) return null

  const { data } = await supabase
    .from('chat_sessions')
    .select('id, handoff, last_active_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (!data) return null

  if (new Date(data.last_active_at).getTime() < corte().getTime()) {
    await supabase.from('chat_sessions').delete().eq('id', sessionId)
    return null
  }

  return data as SesionChat
}

/**
 * Recupera espacio. Es seguro llamarla siempre y seguro no llamarla nunca: la
 * corrección la garantiza `reclamarSesion`, esto solo limpia.
 */
export async function purgarSesionesVencidas(): Promise<number> {
  const supabase = clienteChat()
  if (!supabase) return 0

  const { data } = await supabase
    .from('chat_sessions')
    .delete()
    .lt('last_active_at', corte().toISOString())
    .select('id')

  return data?.length ?? 0
}
