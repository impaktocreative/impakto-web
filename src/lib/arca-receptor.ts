/**
 * Datos del receptor de un comprobante.
 *
 * La condición del receptor frente al IVA es obligatoria en todo comprobante
 * desde la RG 5616. Los códigos salen de FEParamGetCondicionIvaReceptor y no
 * son inventables: ARCA rechaza cualquier otro.
 */

import { cuitValido } from '@/lib/cuit'

export const CONDICIONES_IVA_RECEPTOR = [
  { codigo: 5, label: 'Consumidor final' },
  { codigo: 1, label: 'Responsable inscripto' },
  { codigo: 6, label: 'Monotributo' },
  { codigo: 4, label: 'Exento' },
  { codigo: 13, label: 'Monotributista social' },
  { codigo: 15, label: 'No alcanzado' },
  { codigo: 9, label: 'Cliente del exterior' },
] as const

const CODIGOS = new Set<number>(CONDICIONES_IVA_RECEPTOR.map(c => c.codigo))

export function condicionIvaValida(codigo: number): boolean {
  return CODIGOS.has(codigo)
}

export function etiquetaCondicionIva(codigo: number | null | undefined): string {
  return CONDICIONES_IVA_RECEPTOR.find(c => c.codigo === codigo)?.label ?? 'Sin definir'
}

/**
 * Tipo y número de documento tal como los espera WSFEv1.
 *
 * 80 = CUIT, 99 = consumidor final sin identificar. Con 99 el número va en 0,
 * y ARCA lo acepta solo por debajo del tope de facturación a consumidor final.
 */
export function documentoReceptor(cuit: string | null | undefined): { docTipo: number; docNro: number } {
  const digitos = (cuit ?? '').replace(/\D/g, '')
  if (digitos.length === 11) return { docTipo: 80, docNro: Number(digitos) }
  return { docTipo: 99, docNro: 0 }
}

/**
 * Qué le falta a un cliente para poder facturarle.
 *
 * El administrador elige el cliente al emitir y los datos van solos, así que
 * un cliente a medio cargar no debe aparecer en esa lista: el error saldría
 * recién al pedir el CAE, cuando ya se consumió un número de la serie.
 */


export type ClienteFiscal = {
  razon_social?: string | null
  cuit?: string | null
  cond_iva_receptor?: number | null
  facturar?: boolean | null
}

export const FALTANTES: Record<string, string> = {
  facturar: 'No está marcado para facturar',
  razon_social: 'Falta la razón social',
  cuit: 'Falta el CUIT',
  cuit_invalido: 'El CUIT no es válido',
  cond_iva: 'Falta la condición frente al IVA',
}

export function faltantesParaFacturar(c: ClienteFiscal): string[] {
  const faltan: string[] = []

  if (!c.facturar) faltan.push('facturar')
  if (!c.razon_social?.trim()) faltan.push('razon_social')

  const cond = Number(c.cond_iva_receptor)
  if (!condicionIvaValida(cond)) faltan.push('cond_iva')

  // Consumidor final es el único caso que puede ir sin identificar.
  const necesitaCuit = cond !== 5
  const cuit = (c.cuit ?? '').trim()

  if (necesitaCuit && !cuit) faltan.push('cuit')
  else if (cuit && !cuitValido(cuit)) faltan.push('cuit_invalido')

  return faltan
}

export function puedeFacturarse(c: ClienteFiscal): boolean {
  return faltantesParaFacturar(c).length === 0
}
