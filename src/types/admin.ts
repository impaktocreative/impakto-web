export type PaymentRow = {
  id: string
  amount: number | string
  net_amount: number | string | null
  receiver: string | null
  currency: string
  payment_date: string
  client_services: {
    domain_name: string | null
    services: { name: string } | null
    clients: { brand_name: string } | null
  } | null
}

export type RawPaymentRow = {
  id: string
  amount: number | string
  net_amount: number | string | null
  receiver: string | null
  currency: string
  payment_date: string
  client_services:
    | {
        domain_name: string | null
        services: { name: string } | Array<{ name: string }> | null
        clients: { brand_name: string } | Array<{ brand_name: string }> | null
      }
    | Array<{
        domain_name: string | null
        services: { name: string } | Array<{ name: string }> | null
        clients: { brand_name: string } | Array<{ brand_name: string }> | null
      }>
    | null
}

export type ExpenseRow = {
  id: string
  name: string
  description: string | null
  amount: number
  currency: string
  duration_months: number
  due_date: string
}

export type ExpensePaymentRow = {
  id: string
  expense_id: string
  amount: number
  currency: string
  payment_date: string
  paid_by: 'sergio' | 'rodrigo'
  notes: string | null
  expenses: { name: string } | null
}

export function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

/**
 * Retorno uniforme de todas las server actions del panel.
 *
 * Ninguna acción lanza al cliente: los errores viajan en `message`.
 * `warning` es para lo que conviene avisar sin frenar la operación, como
 * un cobro que se parece a uno reciente.
 */
export type ActionState = {
  success: boolean
  message?: string
  warning?: string
}

/**
 * Los call sites arrancan con `null`, así que la firma de las acciones
 * acepta `ActionState | null`.
 */
export type ActionStateInit = ActionState | null
