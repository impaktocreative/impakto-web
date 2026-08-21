/**
 * Datos del receptor de un comprobante.
 *
 * La condición del receptor frente al IVA es obligatoria en todo comprobante
 * desde la RG 5616. Los códigos salen de FEParamGetCondicionIvaReceptor y no
 * son inventables: ARCA rechaza cualquier otro.
 */

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
