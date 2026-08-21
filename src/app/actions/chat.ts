'use server'

import { headers } from 'next/headers'
import { reclamarSesion } from '@/lib/chat/retention'
import { clienteChat } from '@/lib/chat/supabase'

/**
 * Server actions del asesor.
 *
 * Tres cosas: abrir un hilo, restaurar el que el navegador recuerda y adjuntar
 * los datos de contacto si el visitante los deja.
 *
 * El hilo se abre anónimo. Pedir nombre y correo antes de escribir una palabra
 * convierte el asesor en un formulario de captación disfrazado, y alguien que
 * evalúa un proyecto de este tamaño hace dos preguntas antes de decidir si se
 * identifica.
 */

export type ResultadoApertura = { ok: true; sessionId: string } | { ok: false; error: string }

export async function abrirSesion(): Promise<ResultadoApertura> {
  const supabase = clienteChat()
  if (!supabase) return { ok: false, error: 'El asesor no está configurado.' }

  let referrer: string | null = null
  let userAgent: string | null = null
  try {
    const h = await headers()
    referrer = h.get('referer')
    userAgent = h.get('user-agent')
  } catch {
    // sin cabeceras se sigue igual: son metadatos, no requisitos
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ referrer, user_agent: userAgent })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[chat] abrirSesion', error)
    return { ok: false, error: 'No se pudo abrir la conversación.' }
  }

  return { ok: true, sessionId: data.id }
}

export type MensajeGuardado = { role: 'user' | 'assistant'; content: string }
export type ResultadoRestauracion =
  | { ok: true; messages: MensajeGuardado[] }
  | { ok: false }

/**
 * Devuelve la transcripción de un id que el navegador recuerda.
 *
 * `ok: false` significa que la sesión no existe o venció, y es la señal para
 * que el widget olvide el id y arranque limpio. El dispositivo guarda solo el
 * id: la conversación vive en la base, así que borrar datos del navegador
 * termina el hilo antes de tiempo y eso está bien.
 */
export async function restaurarSesion(sessionId: string): Promise<ResultadoRestauracion> {
  const sesion = await reclamarSesion(sessionId)
  if (!sesion) return { ok: false }

  const supabase = clienteChat()
  if (!supabase) return { ok: false }

  // Con límite: la transcripción vuelve como historial al modelo en el turno
  // siguiente, y sesenta días de conversación pueden ser muy largos.
  const { data } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(40)

  return { ok: true, messages: (data ?? []) as MensajeGuardado[] }
}

export type DatosDeContacto = {
  sessionId: string
  nombre: string
  email: string
  telefono?: string
  empresa?: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function adjuntarContacto(
  datos: DatosDeContacto,
): Promise<{ ok: boolean; error?: string }> {
  const sesion = await reclamarSesion(datos.sessionId)
  if (!sesion) return { ok: false, error: 'La conversación expiró.' }

  const nombre = datos.nombre?.trim()
  const email = datos.email?.trim()
  if (!nombre || !email) return { ok: false, error: 'Nombre y email son requeridos.' }
  if (!EMAIL.test(email)) return { ok: false, error: 'Revisá el formato del email.' }

  const supabase = clienteChat()
  if (!supabase) return { ok: false, error: 'El asesor no está configurado.' }

  const { error } = await supabase
    .from('chat_sessions')
    .update({
      nombre,
      email,
      telefono: datos.telefono?.trim() || null,
      empresa: datos.empresa?.trim() || null,
      handoff: true,
    })
    .eq('id', datos.sessionId)

  if (error) {
    console.error('[chat] adjuntarContacto', error)
    return { ok: false, error: 'No se pudieron guardar los datos.' }
  }

  return { ok: true }
}
