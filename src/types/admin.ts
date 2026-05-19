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
