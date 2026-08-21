/**
 * Fechas sin hora.
 *
 * Postgres devuelve `date` como 'YYYY-MM-DD'. `new Date('2026-08-21')` lo
 * interpreta como medianoche UTC, y en Argentina (UTC-3) eso cae el día
 * anterior: un pago del 21 se mostraba como 20. El error afectaba a todas las
 * fechas del panel y también al conteo de días hasta el vencimiento.
 *
 * Estas funciones arman la fecha en la zona local, que es la que el
 * administrador tiene en la cabeza cuando carga un vencimiento.
 */

export function fechaLocal(iso: string): Date {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

/** Hoy a medianoche local, para comparar contra una fecha sin hora. */
export function hoyLocal(): Date {
  const ahora = new Date()
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
}

/**
 * Días enteros desde hoy hasta la fecha. Negativo si ya pasó.
 * Ambos extremos son medianoche local, así que no hay medios días que
 * redondeen para cualquier lado según la hora en que se abra el panel.
 */
export function diasHasta(iso: string): number {
  const MS_POR_DIA = 24 * 60 * 60 * 1000
  return Math.round((fechaLocal(iso).getTime() - hoyLocal().getTime()) / MS_POR_DIA)
}
