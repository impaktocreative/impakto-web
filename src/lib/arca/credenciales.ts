import 'server-only'
import type { Entorno } from './config'

/**
 * Certificado y clave privada de cada emisor.
 *
 * Van en variables de entorno en base64, nunca en el filesystem ni en la base:
 * en Vercel el disco es efímero y de solo lectura fuera de /tmp, y la base se
 * respalda y se replica.
 *
 * Una variable por emisor y por entorno, cuatro pares en total:
 *
 *   ARCA_CERT_SERGIO_HOMO   ARCA_KEY_SERGIO_HOMO
 *   ARCA_CERT_SERGIO_PROD   ARCA_KEY_SERGIO_PROD
 *   ARCA_CERT_RODRIGO_HOMO  ARCA_KEY_RODRIGO_HOMO
 *   ARCA_CERT_RODRIGO_PROD  ARCA_KEY_RODRIGO_PROD
 *
 * Para generarlas:
 *   base64 -i cert.crt | tr -d '\n'
 *   base64 -i private.key | tr -d '\n'
 */

export type ClaveEmisor = 'sergio' | 'rodrigo'

export interface Credenciales {
  cert: string
  key: string
  /** Identifica el par en el cache del ticket: un certificado, un ticket. */
  claveCache: string
}

function decodificar(b64: string, nombre: string): string {
  const pem = Buffer.from(b64, 'base64').toString('utf8').trim()
  if (!pem.startsWith('-----BEGIN')) {
    throw new Error(
      `${nombre} no contiene un PEM válido. El base64 tiene que generarse sin saltos de línea: base64 -i archivo | tr -d '\\n'`,
    )
  }
  return pem
}

function sufijo(entorno: Entorno): 'HOMO' | 'PROD' {
  return entorno === 'produccion' ? 'PROD' : 'HOMO'
}

export function nombresDeVariables(clave: ClaveEmisor, entorno: Entorno) {
  const s = sufijo(entorno)
  const c = clave.toUpperCase()
  return { cert: `ARCA_CERT_${c}_${s}`, key: `ARCA_KEY_${c}_${s}` }
}

export function hayCredenciales(clave: ClaveEmisor, entorno: Entorno): boolean {
  const n = nombresDeVariables(clave, entorno)
  return Boolean(process.env[n.cert]?.trim() && process.env[n.key]?.trim())
}

export function credencialesDe(clave: ClaveEmisor, entorno: Entorno): Credenciales {
  const n = nombresDeVariables(clave, entorno)
  const cert = process.env[n.cert]?.trim()
  const key = process.env[n.key]?.trim()

  if (!cert || !key) {
    throw new Error(
      `Faltan las credenciales de ARCA para ${clave} en ${entorno}. Cargá ${n.cert} y ${n.key}.`,
    )
  }

  return {
    cert: decodificar(cert, n.cert),
    key: decodificar(key, n.key),
    // El entorno entra en la clave porque son dos certificados distintos y
    // cada uno lleva su propio ticket.
    claveCache: `${clave}:${entorno}`,
  }
}
