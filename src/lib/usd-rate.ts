/**
 * Cotización del dólar por mes.
 *
 * Parte pura, sin acceso a base: la usa tanto el server component que lee de
 * Supabase como el componente cliente del balance. `settings.ts` no sirve
 * para eso porque lleva `server-only`.
 */

export type UsdRates = {
  /** Cotización cargada por mes, en formato YYYY-MM. */
  porMes: Record<string, number>
  /** Se usa para los meses anteriores a cualquier carga. */
  respaldo: number
}

export const USD_FALLBACK_DEFAULT = 1400

/**
 * Cotización que corresponde a un mes.
 *
 * Si ese mes no tiene una cargada, hereda la última anterior: cargar marzo y
 * no abril deja a abril con la de marzo, en vez de convertirlo al valor de
 * hoy. Si no hay ninguna anterior, cae en el respaldo.
 */
export function cotizacionDe(mes: string, rates: UsdRates): number {
  if (rates.porMes[mes]) return rates.porMes[mes]

  const anteriores = Object.keys(rates.porMes)
    .filter((m) => m < mes)
    .sort()

  const ultima = anteriores[anteriores.length - 1]
  return ultima ? rates.porMes[ultima] : rates.respaldo
}
