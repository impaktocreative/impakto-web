import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { solicitarTA, ErrorTicketVigente, type TicketAcceso } from './wsaa'
import type { Credenciales } from './credenciales'
import type { Entorno } from './config'

/**
 * Cache del Ticket de Acceso.
 *
 * ARCA emite un solo ticket por certificado y servicio cada 12 horas. Si dos
 * instancias lo piden a la vez, todas menos la primera reciben
 * `coe.alreadyAuthenticated` y quedan sin poder facturar hasta que el primero
 * expire. Por eso el ticket vive en Postgres y no en memoria.
 *
 * El skill original sostiene un advisory lock durante la llamada a WSAA. Acá
 * se entra por PostgREST, sin conexión directa, así que el lock se reemplaza
 * por una reserva con vencimiento: `arca_ta_tomar` adjudica a una sola
 * instancia el derecho a pedir el ticket, y las demás esperan a que lo deje
 * cacheado.
 */

const ESPERA_MS = 1500
const INTENTOS = 8

type FilaTA = {
  token: string | null
  sign: string | null
  expira: string | null
  reservado: boolean
}

async function tomar(supabase: SupabaseClient, clave: string): Promise<FilaTA> {
  const { data, error } = await supabase.rpc('arca_ta_tomar', { p_clave: clave })
  if (error) throw new Error(`No se pudo leer el cache del ticket: ${error.message}`)
  const fila = (Array.isArray(data) ? data[0] : data) as FilaTA | undefined
  return fila ?? { token: null, sign: null, expira: null, reservado: false }
}

function esperar(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Devuelve un ticket vigente, renovándolo si hace falta. */
export async function getTA(
  supabase: SupabaseClient,
  cred: Credenciales,
  entorno: Entorno,
  servicio = 'wsfe',
): Promise<TicketAcceso> {
  const clave = `${cred.claveCache}:${servicio}`

  for (let intento = 0; intento < INTENTOS; intento++) {
    const fila = await tomar(supabase, clave)

    if (fila.token && fila.sign && fila.expira) {
      return { token: fila.token, sign: fila.sign, expira: fila.expira }
    }

    if (!fila.reservado) {
      // Otra instancia lo está pidiendo. Esperar a que lo deje cacheado.
      await esperar(ESPERA_MS)
      continue
    }

    let ta: TicketAcceso
    try {
      ta = await solicitarTA(cred, entorno, servicio)
    } catch (e) {
      if (e instanceof ErrorTicketVigente) {
        // ARCA tiene un ticket vivo que nosotros no guardamos. Pasa al perder
        // la base o al probar desde dos lugares. No se puede recuperar: hay
        // que esperar a que expire o usar otro certificado con otro alias.
        throw new Error(
          'ARCA tiene un ticket vigente para este certificado que no está en el cache. ' +
            'Esperá a que expire (hasta 12 horas) o usá un segundo certificado. ' +
            `Detalle: ${e.message}`,
        )
      }
      throw e
    }

    const { error } = await supabase.rpc('arca_ta_guardar', {
      p_clave: clave,
      p_token: ta.token,
      p_sign: ta.sign,
      p_expira: ta.expira,
    })
    if (error) throw new Error(`No se pudo guardar el ticket: ${error.message}`)

    return ta
  }

  throw new Error(
    'No se pudo obtener el ticket de acceso: otra instancia lo está pidiendo hace demasiado tiempo.',
  )
}
