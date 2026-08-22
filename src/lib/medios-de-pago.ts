/**
 * Medios por los que entra la plata.
 *
 * Importa porque no todos pasan por el mismo circuito. Lo que cambia según el
 * medio son dos cosas distintas, y conviene no mezclarlas:
 *
 *   declarado   si el movimiento queda registrado en el sistema formal y por
 *               lo tanto entra en la base imponible.
 *   retencion   si el banco descuenta algo al acreditar. Hoy solo la
 *               transferencia bancaria, con el mismo 3,5% que ya aplican los
 *               cobros de servicios.
 *
 * Un cobro puede ser declarado y no tener retención (una factura cobrada por
 * MercadoPago), así que las dos banderas van separadas en lugar de deducir una
 * de la otra.
 *
 * Las comisiones de cada plataforma no se modelan acá: varían por cuenta y por
 * plan, y un número inventado en el balance es peor que no tener el dato. Lo
 * que sí se aplica es la retención bancaria, que es la única tasa que este
 * proyecto ya tenía definida y verificada.
 */

export type MedioDePago = {
  valor: string
  etiqueta: string
  /** Entra en el circuito formal y computa para impuestos. */
  declarado: boolean
  /** El banco retiene al acreditar. */
  retencion: boolean
}

export const MEDIOS_DE_PAGO: MedioDePago[] = [
  { valor: 'transferencia', etiqueta: 'Transferencia bancaria', declarado: true, retencion: true },
  { valor: 'mercadopago', etiqueta: 'MercadoPago', declarado: true, retencion: false },
  { valor: 'efectivo', etiqueta: 'Efectivo', declarado: false, retencion: false },
  { valor: 'paypal', etiqueta: 'PayPal', declarado: true, retencion: false },
  { valor: 'wise', etiqueta: 'Wise', declarado: true, retencion: false },
  { valor: 'cripto', etiqueta: 'Cripto', declarado: false, retencion: false },
  { valor: 'otro', etiqueta: 'Otro', declarado: false, retencion: false },
]

export function medioDePago(valor: string | null | undefined): MedioDePago | null {
  if (!valor) return null
  return MEDIOS_DE_PAGO.find((m) => m.valor === valor) ?? null
}

export function etiquetaDeMedio(valor: string | null | undefined): string {
  return medioDePago(valor)?.etiqueta ?? 'Sin especificar'
}

/** Si por ese medio corresponde descontar la retención bancaria. */
export function aplicaRetencion(valor: string | null | undefined): boolean {
  return medioDePago(valor)?.retencion ?? false
}
