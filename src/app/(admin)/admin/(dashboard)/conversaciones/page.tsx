import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { MessageSquare, UserCheck } from 'lucide-react'

/**
 * Conversaciones del asesor.
 *
 * Lista y detalle en la misma pantalla: la conversación seleccionada viaja por
 * query string, así que un enlace a un hilo concreto se puede compartir. Sin
 * JSON y sin ids a la vista, porque quien lee esto no es técnico.
 */

type FilaSesion = {
  id: string
  nombre: string | null
  email: string | null
  telefono: string | null
  empresa: string | null
  handoff: boolean
  started_at: string
  last_active_at: string
}

type FilaMensaje = {
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

/**
 * `started_at` y `last_active_at` son timestamptz, así que `new Date()` directo
 * es correcto acá. `fechaLocal()` es para las columnas `date`, que sin ella
 * caen un día antes en Argentina.
 */
function cuando(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function ConversacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const supabase = await createClient()

  const { data: sesiones } = await supabase
    .from('chat_sessions')
    .select('id, nombre, email, telefono, empresa, handoff, started_at, last_active_at')
    .order('last_active_at', { ascending: false })
    .limit(80)

  const lista = (sesiones ?? []) as FilaSesion[]
  const activa = lista.find((s) => s.id === id) ?? lista[0] ?? null

  let mensajes: FilaMensaje[] = []
  if (activa) {
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', activa.id)
      .order('created_at', { ascending: true })
    mensajes = (data ?? []) as FilaMensaje[]
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Conversaciones</h1>
      <p className="text-sm text-gray-500 mb-8">
        Lo que el asesor conversó con visitantes del sitio. Las marcadas con contacto son las que
        dejaron sus datos.
      </p>

      {!lista.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 px-6 py-16 text-center">
          <MessageSquare size={22} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500">Todavía no hay conversaciones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
          <div className="space-y-1.5">
            {lista.map((s) => {
              const seleccionada = activa?.id === s.id
              return (
                <Link
                  key={s.id}
                  href={`/admin/conversaciones?id=${s.id}`}
                  className={`block rounded-md border px-3.5 py-3 transition-colors ${
                    seleccionada
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-sm font-medium ${
                        seleccionada ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {s.nombre ?? s.empresa ?? 'Visitante anónimo'}
                    </span>
                    {s.handoff ? (
                      <UserCheck
                        size={14}
                        className={seleccionada ? 'text-emerald-300' : 'text-emerald-600'}
                      />
                    ) : null}
                  </div>
                  <p
                    className={`mt-0.5 truncate text-xs ${
                      seleccionada ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {s.email ?? cuando(s.last_active_at)}
                  </p>
                </Link>
              )
            })}
          </div>

          {activa ? (
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  {activa.nombre ?? 'Visitante anónimo'}
                  {activa.empresa ? ` · ${activa.empresa}` : ''}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {[activa.email, activa.telefono].filter(Boolean).join(' · ') ||
                    'Sin datos de contacto'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Empezó el {cuando(activa.started_at)}. Último mensaje el{' '}
                  {cuando(activa.last_active_at)}.
                </p>
              </div>

              <div className="space-y-4 px-5 py-5">
                {!mensajes.length ? (
                  <p className="text-sm text-gray-500">
                    La conversación se abrió pero el visitante no llegó a escribir.
                  </p>
                ) : (
                  mensajes.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === 'user'
                          ? 'ml-auto max-w-[80%] rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white'
                          : 'max-w-[85%] text-sm leading-relaxed text-gray-700'
                      }
                    >
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
