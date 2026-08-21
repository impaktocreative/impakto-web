'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowUp, X } from 'lucide-react'
import { abrirSesion, asesorActivo, restaurarSesion } from '@/app/actions/chat'
import { textoConEnlaces } from './textoConEnlaces'

/**
 * El asesor.
 *
 * Panel flotante en todo el sitio público. El visitante escribe, la respuesta
 * llega en streaming. Sin formulario previo, sin cuenta, sin contraseña.
 *
 * En escritorio es una tarjeta anclada abajo a la derecha. En teléfono es una
 * hoja completa, dimensionada contra el viewport visual y no contra el
 * viewport del navegador, que es lo que hace que el compositor no quede debajo
 * del teclado.
 */

const CLAVE_SESION = 'impakto.asesor.sesion'

const SALUDO =
  'Hola. Soy el asesor de Impakto Creative. Contame en qué está tu marca hoy y te digo por dónde lo abordaríamos.'

/**
 * Aperturas ancladas a lo que el sitio sabe responder de verdad, para que
 * ninguna termine en un "no tengo ese dato".
 */
const APERTURAS = [
  'Nuestra web ya no representa el nivel de la empresa',
  '¿Cómo trabajan y en qué etapas?',
  'Necesitamos ordenar la comunicación entre áreas',
]

type Mensaje = { role: 'user' | 'assistant'; content: string }

export default function AsesorFlotante() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ role: 'assistant', content: SALUDO }])
  const [borrador, setBorrador] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activo, setActivo] = useState(false)

  const hiloRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<HTMLTextAreaElement>(null)

  // Sin llave cargada no se dibuja nada. Se consulta al montar porque la
  // llave puede venir del panel de administración, no solo del entorno.
  useEffect(() => {
    let vivo = true
    void asesorActivo()
      .then((r) => vivo && setActivo(r))
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  // ── Hilo guardado ─────────────────────────────────────────────────────────
  // El id vive en el navegador, la conversación en la base. La primera versión
  // guardaba el id y después nunca pedía la transcripción: quien volvía se
  // encontraba un saludo vacío mientras su historial seguía guardado.
  useEffect(() => {
    if (!abierto || sessionId) return

    let cancelado = false

    const arrancar = async () => {
      const guardado = localStorage.getItem(CLAVE_SESION)
      if (guardado) {
        const r = await restaurarSesion(guardado).catch(() => null)
        if (cancelado) return
        if (r?.ok) {
          setSessionId(guardado)
          if (r.messages.length) setMensajes(r.messages)
          return
        }
        localStorage.removeItem(CLAVE_SESION)
      }

      const nueva = await abrirSesion().catch(() => null)
      if (cancelado || !nueva?.ok) return
      localStorage.setItem(CLAVE_SESION, nueva.sessionId)
      setSessionId(nueva.sessionId)
    }

    void arrancar()
    return () => {
      cancelado = true
    }
  }, [abierto, sessionId])

  // ── Teclado del teléfono ──────────────────────────────────────────────────
  // Un elemento fijo dimensionado solo con inset-0 resuelve contra el viewport
  // del navegador, así que al abrir el teclado el compositor queda debajo y el
  // botón de enviar desaparece. El viewport visual sí achica con el teclado.
  //
  // La condición de ancho se relee en cada evento, nunca una sola vez: un
  // chequeo leído al abrir queda obsoleto en cuanto alguien gira el teléfono.
  useEffect(() => {
    if (!abierto) return
    const vv = window.visualViewport
    const panel = panelRef.current
    if (!vv || !panel) return

    const ajustar = () => {
      if (!panelRef.current) return
      const hoja = window.matchMedia('(max-width: 767px)').matches
      if (hoja) {
        panelRef.current.style.height = `${vv.height}px`
        panelRef.current.style.transform = `translateY(${vv.offsetTop}px)`
      } else {
        panelRef.current.style.height = ''
        panelRef.current.style.transform = ''
      }
    }

    ajustar()
    vv.addEventListener('resize', ajustar)
    vv.addEventListener('scroll', ajustar)
    window.addEventListener('orientationchange', ajustar)

    return () => {
      vv.removeEventListener('resize', ajustar)
      vv.removeEventListener('scroll', ajustar)
      window.removeEventListener('orientationchange', ajustar)
    }
  }, [abierto])

  // El bloqueo del fondo va por atributo y el breakpoint lo decide el CSS, no
  // JavaScript: así ensanchar la ventana con el panel abierto no deja la
  // página trabada.
  useEffect(() => {
    const raiz = document.documentElement
    if (abierto) raiz.setAttribute('data-asesor-abierto', '')
    else raiz.removeAttribute('data-asesor-abierto')
    return () => raiz.removeAttribute('data-asesor-abierto')
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto])

  // Scroll instantáneo mientras hay streaming, suave el resto del tiempo. Un
  // scroll suave reemitido en cada token nunca termina, porque cada uno
  // reinicia la animación, y la última línea queda cortada bajo el compositor.
  useEffect(() => {
    const el = hiloRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: enviando ? 'auto' : 'smooth' })
  }, [mensajes, enviando])

  // ── Un solo camino para enviar ────────────────────────────────────────────
  // Venga del campo o de una apertura sugerida. Dos copias divergen y una
  // termina sin limpiar el input.
  const enviar = useCallback(
    async (texto: string) => {
      const limpio = texto.trim()
      if (!limpio || enviando) return

      setBorrador('')
      setEnviando(true)

      const hilo: Mensaje[] = [...mensajes, { role: 'user', content: limpio }]
      setMensajes([...hilo, { role: 'assistant', content: '' }])

      // La sesión se abre al abrir el panel, pero esa llamada puede fallar. Se
      // reintenta acá antes de dar la conversación por perdida.
      let id = sessionId
      if (!id) {
        const nueva = await abrirSesion().catch(() => null)
        if (nueva?.ok) {
          id = nueva.sessionId
          localStorage.setItem(CLAVE_SESION, nueva.sessionId)
          setSessionId(nueva.sessionId)
        }
      }

      const caer = (motivo: string) => {
        setMensajes([...hilo, { role: 'assistant', content: motivo }])
        setEnviando(false)
      }

      if (!id) {
        // El formulario es otra ruta, así que lo más probable es que siga en
        // pie justo cuando el asesor no.
        caer(
          'No pude abrir la conversación en este momento. Escribinos desde /contacto y te respondemos dentro de las 24 horas hábiles.',
        )
        return
      }

      try {
        const r = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: id, messages: hilo }),
        })

        if (!r.ok || !r.body) {
          caer(
            'El asesor no está disponible ahora mismo. Podés escribirnos desde /contacto y te respondemos dentro de las 24 horas hábiles.',
          )
          return
        }

        const lector = r.body.getReader()
        const decoder = new TextDecoder()
        let acumulado = ''

        for (;;) {
          const { done, value } = await lector.read()
          if (done) break
          acumulado += decoder.decode(value, { stream: true })
          setMensajes([...hilo, { role: 'assistant', content: acumulado }])
        }

        if (!acumulado.trim()) {
          caer('No pude responder eso. Probá de otra forma o escribinos desde /contacto.')
          return
        }
      } catch {
        caer('Se cortó la conexión. Probá de nuevo o escribinos desde /contacto.')
        return
      }

      setEnviando(false)
    },
    [enviando, mensajes, sessionId],
  )

  const conversacionEmpezada = mensajes.length > 1

  if (!activo) return null

  return (
    <>
      {/* Velo solo en teléfono: en escritorio el panel convive con la página. */}
      {abierto ? (
        <button
          type="button"
          aria-label="Cerrar el asesor"
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-[78] bg-night/45 backdrop-blur-[2px] md:hidden"
        />
      ) : null}

      {abierto ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Asesor de Impakto Creative"
          className="fixed inset-x-0 top-0 z-[79] flex h-[100dvh] flex-col overflow-hidden bg-surface md:inset-x-auto md:inset-y-auto md:bottom-6 md:right-6 md:h-[min(34rem,calc(100vh-6rem))] md:w-[24.5rem] md:rounded-panel md:border md:border-graphite/12 md:shadow-float"
        >
          {/* Cabecera. Fondo tinta y filete dorado: el mismo par que separa las
              secciones oscuras del sitio. */}
          <header className="relative flex shrink-0 items-center justify-between gap-3 bg-night px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] text-paper md:rounded-t-panel md:py-4">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/75 to-transparent" />
            <span className="flex min-w-0 items-center gap-3">
              <Image
                src="/logos/icono-2.svg"
                alt=""
                aria-hidden="true"
                width={14}
                height={17}
                className="h-4 w-auto"
              />
              <span className="min-w-0">
                <span className="block text-body-sm font-medium text-paper">Asesor</span>
                <span className="block text-eyebrow uppercase text-gold/85">
                  Impakto Creative
                </span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar el asesor"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-paper/80 transition-colors duration-fast hover:border-gold/60 hover:text-gold"
            >
              <X size={16} />
            </button>
          </header>

          <div ref={hiloRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <div className="space-y-4">
              {mensajes.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'ml-auto max-w-[85%] rounded-card bg-night px-4 py-3 text-body-sm text-paper'
                      : 'max-w-[92%] text-body-sm leading-relaxed text-slate'
                  }
                >
                  {m.role === 'assistant' && !m.content ? (
                    <span className="asesor-pensando" aria-label="Escribiendo">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : m.role === 'assistant' ? (
                    <span className="whitespace-pre-wrap">{textoConEnlaces(m.content)}</span>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              ))}
            </div>

            {!conversacionEmpezada ? (
              <div className="mt-6 space-y-2">
                {APERTURAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => void enviar(a)}
                    className="group flex w-full items-center gap-3 border-t border-graphite/12 py-2.5 text-left text-body-sm text-stone transition-colors duration-fast hover:text-ink"
                  >
                    <span className="h-px w-4 shrink-0 bg-gold/55 transition-all duration-base group-hover:w-6 group-hover:bg-gold" />
                    {a}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void enviar(borrador)
            }}
            className="shrink-0 border-t border-graphite/12 bg-surface px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 md:rounded-b-panel md:pb-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={campoRef}
                rows={1}
                value={borrador}
                onChange={(e) => {
                  setBorrador(e.target.value)
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 128)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void enviar(borrador)
                  }
                }}
                placeholder="Escribí tu consulta"
                aria-label="Escribí tu consulta"
                /* text-body es 16px justo. Por debajo de eso iOS hace zoom al
                   enfocar y el panel entero se sale de cuadro. */
                className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-card border border-graphite/14 bg-paper-lift px-3.5 py-2.5 text-body text-ink outline-none transition-colors duration-fast placeholder:text-stone/70 focus:border-gold/60"
              />
              <button
                type="submit"
                disabled={!borrador.trim() || enviando}
                aria-label="Enviar"
                className="btn-asesor-enviar inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowUp size={18} />
              </button>
            </div>
            <p className="mt-2 px-1 text-eyebrow uppercase text-stone/75">
              El alcance se define en el diagnóstico.
            </p>
          </form>
        </div>
      ) : null}

      {/* El disparador. Un emblema solo es un sello, no una invitación: nadie
          sabe que una marca abre una conversación, así que en escritorio lleva
          etiqueta. En teléfono es disco, porque una píldora con texto tapa
          botones de la página. */}
      <div className="fixed bottom-[calc(0.9rem+env(safe-area-inset-bottom))] right-[calc(0.9rem+env(safe-area-inset-right))] z-[70] md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir el asesor de Impakto Creative"
          aria-expanded={abierto}
          className={`btn-asesor inline-flex items-center gap-2.5 rounded-full ${abierto ? 'pointer-events-none opacity-0' : ''} h-12 w-12 justify-center md:h-[3.2rem] md:w-auto md:justify-start md:px-5`}
        >
          <Image
            src="/logos/icono-2.svg"
            alt=""
            aria-hidden="true"
            width={13}
            height={16}
            /* El emblema es dorado. Sobre el propio botón dorado hay que
               llevarlo a tinta o desaparece. */
            className="h-4 w-auto shrink-0 brightness-0 opacity-85"
          />
          <span className="hidden text-body-sm font-medium md:inline">Hablar con el asesor</span>
        </button>
      </div>
    </>
  )
}
