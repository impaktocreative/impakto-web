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
 *
 * Dos barridos distintos:
 *
 *   vencidas  pasaron los sesenta días sin actividad.
 *   vacías    se abrió el hilo y nunca entró un mensaje. Con la sesión
 *             creándose recién al enviar no debería pasar, pero queda el caso
 *             de que el envío falle después de crearla. Se espera un día antes
 *             de tocarlas para no pisar una conversación en curso.
 */
export async function purgarSesionesVencidas(): Promise<{ vencidas: number; vacias: number }> {
  const supabase = clienteChat()
  if (!supabase) return { vencidas: 0, vacias: 0 }

  const { data: vencidas } = await supabase
    .from('chat_sessions')
    .delete()
    .lt('last_active_at', corte().toISOString())
    .select('id')

  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)

  // Candidatas: viejas, anónimas y sin derivar. El filtro de "sin mensajes" se
  // aplica después, contra la tabla de mensajes, porque PostgREST no expresa
  // un NOT EXISTS en una sola consulta.
  const { data: candidatas } = await supabase
    .from('chat_sessions')
    .select('id')
    .lt('started_at', ayer.toISOString())
    .is('nombre', null)
    .is('email', null)
    .is('telefono', null)
    .is('empresa', null)
    .eq('handoff', false)

  if (!candidatas?.length) return { vencidas: vencidas?.length ?? 0, vacias: 0 }

  const ids = candidatas.map((c) => c.id)
  const { data: conMensajes } = await supabase
    .from('chat_messages')
    .select('session_id')
    .in('session_id', ids)

  const ocupadas = new Set((conMensajes ?? []).map((m) => m.session_id))
  const aBorrar = ids.filter((id) => !ocupadas.has(id))
  if (!aBorrar.length) return { vencidas: vencidas?.length ?? 0, vacias: 0 }

  const { data: vacias } = await supabase
    .from('chat_sessions')
    .delete()
    .in('id', aBorrar)
    .select('id')

  return { vencidas: vencidas?.length ?? 0, vacias: vacias?.length ?? 0 }
}
