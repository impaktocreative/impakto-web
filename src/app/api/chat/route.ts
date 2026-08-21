import { getConfigIA } from '@/lib/chat/config'
import { getConocimientoDeMarca, verificarConocimiento } from '@/lib/chat/knowledge'
import { reclamarSesion } from '@/lib/chat/retention'
import { clienteChat } from '@/lib/chat/supabase'
import { REGLAS_DEL_CHAT } from '@/lib/chat/system-prompt'
import { siteUrl } from '@/lib/site'

/**
 * El endpoint del asesor.
 *
 * Recibe el hilo, arma el prompt de sistema (reglas + conocimiento derivado) y
 * reenvía la respuesta de OpenRouter al navegador como texto plano. No SSE
 * hacia afuera: el cliente concatena y listo, menos piezas que se puedan
 * romper.
 *
 * En Next 16 no se declara `runtime`: ya es nodejs por defecto y declararlo es
 * incompatible con cacheComponents.
 */

// La guarda corre una vez, al cargar el módulo. Si el contenido del sitio se
// refactorizó por debajo, el asesor seguiría contestando y solo dejaría de
// saber cosas: sin error, sin build roto y sin que nadie se entere. Esto lo
// deja escrito en los logs. No tira, porque un asesor que sabe de menos sigue
// siendo mejor que un 500.
try {
  verificarConocimiento()
} catch (e) {
  console.error('[chat]', e instanceof Error ? e.message : e)
}

const OPENROUTER = 'https://openrouter.ai/api/v1/chat/completions'
const MAX_ENTRADA = 2000
const MAX_HISTORIAL = 14

type MensajeCliente = { role: 'user' | 'assistant'; content: string }

export async function POST(req: Request) {
  const { apiKey, model } = await getConfigIA()
  if (!apiKey) {
    return new Response('El asesor todavía no está configurado.', { status: 503 })
  }

  let cuerpo: { sessionId?: string; messages?: MensajeCliente[] }
  try {
    cuerpo = await req.json()
  } catch {
    return new Response('Petición inválida', { status: 400 })
  }

  const sessionId = cuerpo.sessionId
  if (!sessionId) return new Response('Falta la sesión', { status: 401 })

  // El chequeo de vigencia vive en reclamarSesion para que la ruta y la
  // restauración del hilo no puedan discrepar sobre qué es una sesión vencida.
  const sesion = await reclamarSesion(sessionId)
  if (!sesion) return new Response('Sesión inválida', { status: 401 })

  const mensajes = Array.isArray(cuerpo.messages) ? cuerpo.messages : []
  const ultimoDelUsuario = [...mensajes].reverse().find((m) => m.role === 'user')
  const textoUsuario = ultimoDelUsuario?.content?.trim().slice(0, MAX_ENTRADA)
  if (!textoUsuario) return new Response('Mensaje vacío', { status: 400 })

  const historial = mensajes
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_HISTORIAL)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, MAX_ENTRADA) }))

  const prompt = `${REGLAS_DEL_CHAT}\n\n# Conocimiento de marca\n${getConocimientoDeMarca()}`

  let respuesta: Response
  try {
    respuesta = await fetch(OPENROUTER, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'Impakto Creative',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: prompt }, ...historial],
        stream: true,
        temperature: 0.3,
        max_tokens: 900,
        // Para modelos con razonamiento: que no se extiendan. Lo que se pide
        // es explicar bien algo que ya está delante, no deliberar.
        reasoning: { effort: 'low' },
      }),
    })
  } catch (e) {
    console.error('[chat] red', e)
    return new Response('No se pudo contactar al asesor.', { status: 502 })
  }

  // Errores con nombre. Sin crédito, modelo inexistente y llave rechazada se
  // ven idénticos como "no disponible" y cuestan horas de lectura de código.
  if (!respuesta.ok || !respuesta.body) {
    const detalle = await respuesta.text().catch(() => '')
    const motivo =
      respuesta.status === 402
        ? 'La cuenta de OpenRouter no tiene crédito.'
        : respuesta.status === 404
          ? `El modelo "${model}" no está disponible en esta cuenta.`
          : respuesta.status === 401
            ? 'OpenRouter rechazó la llave.'
            : 'El asesor no está disponible en este momento.'
    console.error('[chat] upstream', respuesta.status, model, detalle.slice(0, 300))
    return new Response(motivo, { status: 502 })
  }

  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let completo = ''

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const lector = respuesta.body!.getReader()
      let buffer = ''

      try {
        for (;;) {
          const { done, value } = await lector.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lineas = buffer.split('\n')
          // La última puede estar cortada al medio: se guarda para la vuelta
          // siguiente en lugar de intentar parsearla.
          buffer = lineas.pop() ?? ''

          for (const linea of lineas) {
            const l = linea.trim()
            if (!l.startsWith('data:')) continue
            const data = l.slice(5).trim()
            if (data === '[DONE]') continue
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content
              if (delta) {
                completo += delta
                controller.enqueue(encoder.encode(delta))
              }
            } catch {
              // keep-alive o fragmento parcial: se ignora
            }
          }
        }
      } catch (e) {
        console.error('[chat] stream', e)
      } finally {
        controller.close()

        // Guardar es best-effort dentro del finally: un fallo de escritura no
        // puede romper una respuesta que el visitante ya leyó.
        try {
          const supabase = clienteChat()
          if (supabase && completo) {
            await supabase.from('chat_messages').insert([
              { session_id: sessionId, role: 'user', content: textoUsuario },
              { session_id: sessionId, role: 'assistant', content: completo },
            ])
            await supabase
              .from('chat_sessions')
              .update({ last_active_at: new Date().toISOString() })
              .eq('id', sessionId)
          }
        } catch (e) {
          console.error('[chat] persistencia', e)
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
