/**
 * Endpoints y configuración por entorno.
 * Nunca hardcodear URLs en los llamados: mezclar homologación y producción
 * es una de las causas más frecuentes de errores de certificado.
 */

export type Entorno = 'homologacion' | 'produccion';

const ENDPOINTS = {
  homologacion: {
    wsaa: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
    wsfe: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  },
  produccion: {
    wsaa: 'https://wsaa.afip.gov.ar/ws/services/LoginCms',
    wsfe: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
  },
} as const;

export const NS_WSFE = 'http://ar.gov.afip.dif.FEV1/';
export const TIMEOUT_MS = 45_000;

export function getEntorno(): Entorno {
  const env = process.env.ARCA_ENV;
  if (env !== 'homologacion' && env !== 'produccion') {
    throw new Error(
      `ARCA_ENV debe ser "homologacion" o "produccion". Valor recibido: ${env ?? 'undefined'}`
    );
  }
  return env;
}

export function getEndpoints() {
  return ENDPOINTS[getEntorno()];
}

export function esProduccion(): boolean {
  return getEntorno() === 'produccion';
}
