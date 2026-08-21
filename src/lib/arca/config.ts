/**
 * Endpoints de ARCA por entorno.
 *
 * El entorno no sale de una variable global: cada emisor tiene el suyo en
 * `arca_emisores.entorno`. Sergio puede estar en producción mientras Rodrigo
 * todavía prueba en homologación, y una variable de proceso no puede
 * representar las dos cosas a la vez.
 *
 * Mezclar entornos es una de las causas más frecuentes de fallos: un
 * certificado de homologación contra el endpoint de producción no autentica,
 * y al revés tampoco.
 */

export type Entorno = 'homologacion' | 'produccion'

const ENDPOINTS = {
  homologacion: {
    wsaa: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
    wsfe: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  },
  produccion: {
    wsaa: 'https://wsaa.afip.gov.ar/ws/services/LoginCms',
    wsfe: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
  },
} as const

export const NS_WSFE = 'http://ar.gov.afip.dif.FEV1/'
export const TIMEOUT_MS = 45_000

export function endpoints(entorno: Entorno) {
  const e = ENDPOINTS[entorno]
  if (!e) throw new Error(`Entorno inválido: ${entorno}`)
  return e
}

export function esEntorno(v: string): v is Entorno {
  return v === 'homologacion' || v === 'produccion'
}
