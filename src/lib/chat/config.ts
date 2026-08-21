import { clienteChat } from './supabase'

/**
 * Llave y modelo del asesor.
 *
 * La base de datos gana sobre la variable de entorno. Ese orden no es un
 * detalle: si ganara el entorno, cambiar la llave desde /admin/settings no
 * tendría ningún efecto visible y parecería que el panel está roto.
 */

export const CLAVES_IA = {
  apiKey: 'openrouter.api_key',
  model: 'openrouter.model',
} as const

/**
 * El trabajo del asesor no es razonar: es explicar con precisión cosas que ya
 * tiene delante, en el idioma del visitante, sosteniendo un límite. Haiku hace
 * eso rápido y barato, que en una página pública importa.
 */
export const MODELO_POR_DEFECTO = 'anthropic/claude-haiku-4.5'

type ConfigIA = { apiKey: string | null; model: string }

function limpiar(valor: string | null | undefined): string | null {
  const s = (valor ?? '').trim()
  return s.length ? s : null
}

export async function getConfigIA(): Promise<ConfigIA> {
  let guardado: Record<string, string | null> = {}

  const supabase = clienteChat()
  if (supabase) {
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', [CLAVES_IA.apiKey, CLAVES_IA.model])
    if (data) guardado = Object.fromEntries(data.map((f) => [f.key, f.value]))
  }

  return {
    apiKey: limpiar(guardado[CLAVES_IA.apiKey]) ?? limpiar(process.env.OPENROUTER_API_KEY),
    model:
      limpiar(guardado[CLAVES_IA.model]) ??
      limpiar(process.env.OPENROUTER_MODEL) ??
      MODELO_POR_DEFECTO,
  }
}

/**
 * Lo que el panel puede mostrar. Nunca lleva la llave: solo si hay una, de
 * dónde sale y sus últimos cuatro caracteres, que alcanzan para reconocerla.
 */
export type EstadoIA = {
  configurado: boolean
  origen: 'panel' | 'entorno' | 'ninguno'
  pista: string | null
  modelo: string
}

export async function getEstadoIA(): Promise<EstadoIA> {
  let guardado: Record<string, string | null> = {}

  const supabase = clienteChat()
  if (supabase) {
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', [CLAVES_IA.apiKey, CLAVES_IA.model])
    if (data) guardado = Object.fromEntries(data.map((f) => [f.key, f.value]))
  }

  const dePanel = limpiar(guardado[CLAVES_IA.apiKey])
  const deEntorno = limpiar(process.env.OPENROUTER_API_KEY)
  const clave = dePanel ?? deEntorno

  return {
    configurado: Boolean(clave),
    origen: dePanel ? 'panel' : deEntorno ? 'entorno' : 'ninguno',
    pista: clave ? clave.slice(-4) : null,
    modelo:
      limpiar(guardado[CLAVES_IA.model]) ??
      limpiar(process.env.OPENROUTER_MODEL) ??
      MODELO_POR_DEFECTO,
  }
}
