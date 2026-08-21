/**
 * Reglas de facturación recurrente.
 *
 * Vivían duplicadas en payment-actions.ts y en clients/[id]/actions.ts, con
 * dos implementaciones distintas de la misma cuenta. La de clients usaba
 * `new Date(iso)` + `setMonth`, que tiene dos problemas: interpreta el
 * `YYYY-MM-DD` como UTC y lo vuelve a formatear en hora local, así que en
 * Argentina puede correr un día; y desborda los fines de mes, con lo cual
 * un vencimiento el 31 de enero + 1 mes cae el 3 de marzo.
 */

/** Fecha de hoy en `YYYY-MM-DD`, sin depender de la zona horaria del server. */
export function hoyIso(): string {
  const ahora = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${ahora.getFullYear()}-${p(ahora.getMonth() + 1)}-${p(ahora.getDate())}`;
}

/**
 * Suma meses a una fecha `YYYY-MM-DD` recortando al último día del mes
 * destino: 31 de enero + 1 mes es 28 o 29 de febrero, no el 3 de marzo.
 */
export function sumarMeses(isoDate: string, meses: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const indiceDestino = month - 1 + meses;
  const anioDestino = year + Math.floor(indiceDestino / 12);
  const mesDestino = ((indiceDestino % 12) + 12) % 12;
  const ultimoDia = new Date(Date.UTC(anioDestino, mesDestino + 1, 0)).getUTCDate();
  const diaDestino = Math.min(day, ultimoDia);

  const p = (n: number) => String(n).padStart(2, "0");
  return `${anioDestino}-${p(mesDestino + 1)}-${p(diaDestino)}`;
}

/** Días entre dos fechas `YYYY-MM-DD`. Negativo si `hasta` ya pasó. */
export function diasEntre(desde: string, hasta: string): number {
  const a = Date.UTC(...(desde.split("-").map(Number) as [number, number, number]));
  const b = Date.UTC(...(hasta.split("-").map(Number) as [number, number, number]));
  return Math.round((b - a) / 86_400_000);
}

/**
 * Próximo vencimiento después de registrar un cobro.
 *
 * Se cuenta desde el vencimiento anterior, no desde la fecha de pago: el
 * cliente contrató un período y pagarlo tarde no le corre el calendario.
 * Pero si el atraso fue tan largo que el nuevo vencimiento también quedaría
 * en el pasado, se recalcula desde el pago — si no, el servicio queda
 * marcado como al día y vencido a la vez.
 */
export function proximoVencimiento(
  vencimientoActual: string | null,
  fechaPago: string,
  duracionMeses: number,
): string {
  const base = vencimientoActual ?? fechaPago;
  let proximo = sumarMeses(base, duracionMeses);

  if (proximo <= fechaPago) {
    proximo = sumarMeses(fechaPago, duracionMeses);
  }

  return proximo;
}

export type EstadoServicio = "activo" | "inactivo" | "vencido";

/**
 * Estado que corresponde según la fecha, para los servicios que están en
 * circulación. Un servicio dado de baja (`inactivo`) no vuelve solo.
 */
export function estadoPorVencimiento(
  estadoActual: string | null,
  vencimiento: string | null,
  hoy: string = hoyIso(),
): EstadoServicio | null {
  if (estadoActual === "inactivo") return null;
  if (!vencimiento) return null;

  const deberia: EstadoServicio = vencimiento < hoy ? "vencido" : "activo";
  return deberia === estadoActual ? null : deberia;
}

/**
 * Retención bancaria sobre cobros por transferencia.
 * Estaba como 0.965 sin explicación en payment-actions.
 */
export const RETENCION_BANCARIA = 0.035;

export function montoNeto(monto: number, aplicaRetencion: boolean): number | null {
  if (!aplicaRetencion) return null;
  return Math.round(monto * (1 - RETENCION_BANCARIA) * 100) / 100;
}
