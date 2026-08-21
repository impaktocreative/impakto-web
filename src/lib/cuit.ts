/**
 * CUIT: validación y formato.
 *
 * El último dígito es un verificador módulo 11 sobre los diez anteriores. Sirve
 * para atajar el error de tipeo antes de mandarlo a ARCA, que rechaza el
 * comprobante entero y obliga a rehacerlo.
 */

const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

/** Deja solo los dígitos: acepta 20-12345678-9, 20 12345678 9 o pegado. */
export function soloDigitos(valor: string): string {
  return (valor ?? '').replace(/\D/g, '')
}

export function cuitValido(valor: string): boolean {
  const d = soloDigitos(valor)
  if (d.length !== 11) return false

  // Once dígitos iguales pasan el módulo 11 pero no son un CUIT real.
  if (/^(\d)\1{10}$/.test(d)) return false

  const suma = PESOS.reduce((acc, peso, i) => acc + peso * Number(d[i]), 0)
  const resto = 11 - (suma % 11)
  const verificador = resto === 11 ? 0 : resto === 10 ? 9 : resto

  return verificador === Number(d[10])
}

/** 20123456789 → 20-12345678-9. Devuelve el original si no son 11 dígitos. */
export function formatearCuit(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return ''
  const d = soloDigitos(String(valor))
  if (d.length !== 11) return String(valor)
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

/**
 * Los emisores nacen con un CUIT negativo de arranque para que un CUIT sin
 * cargar no pueda pasar por válido en ningún lado.
 */
export function cuitSinCargar(valor: number | null | undefined): boolean {
  return valor === null || valor === undefined || valor <= 0
}
