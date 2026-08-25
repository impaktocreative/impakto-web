import { createClient } from '@/utils/supabase/server'
import { BalanceClient } from './BalanceClient'
import { getUsdRates } from '@/lib/settings'

type RawIncomeRow = {
  amount: number | string
  net_amount: number | string | null
  receiver: string | null
  currency: string
  payment_date: string
  description: string | null
  client_services: {
    receiver: string | null
    services: { name: string } | null
    clients: { brand_name: string } | null
  } | Array<{
    receiver: string | null
    services: { name: string } | null
    clients: { brand_name: string } | null
  }> | null
}

type RawExpenseRow = {
  id: string
  expense_id: string
  amount: number | string
  currency: string
  payment_date: string
  paid_by: 'sergio' | 'rodrigo'
  notes: string | null
  expenses: { name: string } | Array<{ name: string }> | null
}

type RawAdjustmentRow = {
  id: string
  month: string
  favor: 'sergio' | 'rodrigo'
  amount: number | string
  currency: string
  description: string
  created_at: string
}

function normalize<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export default async function BalancePage() {
  const supabase = await createClient()
  const usdRates = await getUsdRates()

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  const startDate = twelveMonthsAgo.toISOString().split('T')[0]

  const [{ data: incomePayments }, { data: expensePayments }, { data: adjustments }] = await Promise.all([
    supabase
      .from('payments')
      .select(`
        amount,
        net_amount,
        receiver,
        currency,
        payment_date,
        description,
        client_services (
          receiver,
          services ( name ),
          clients ( brand_name )
        )
      `)
      .eq('exclude_from_totals', false)
      .gte('payment_date', startDate)
      .order('payment_date', { ascending: false }),
    supabase
      .from('expense_payments')
      .select('id, expense_id, amount, currency, payment_date, paid_by, notes, expenses ( name )')
      .eq('exclude_from_totals', false)
      .gte('payment_date', startDate)
      .order('payment_date', { ascending: false }),
    // Los ajustes se filtran por mes, no por fecha: la clave es 'YYYY-MM' y
    // se compara como texto, que en ese formato ordena igual que la fecha.
    supabase
      .from('balance_adjustments')
      .select('id, month, favor, amount, currency, description, created_at')
      .gte('month', startDate.slice(0, 7))
      .order('created_at', { ascending: true }),
  ])

  const rawIncome = (incomePayments ?? []) as unknown as RawIncomeRow[]
  const normalizedIncome = rawIncome.map((p) => {
    const cs = normalize(p.client_services)
    return {
      amount: Number(p.amount),
      net_amount: p.net_amount != null ? Number(p.net_amount) : null,
      currency: p.currency,
      payment_date: p.payment_date,
      receiver: p.receiver ?? cs?.receiver ?? null,
      service_name: cs?.services?.name ?? p.description ?? '—',
      client_name: cs?.clients?.brand_name ?? 'Ingreso manual',
    }
  })

  const rawExpenses = (expensePayments ?? []) as unknown as RawExpenseRow[]
  const normalizedExpenses = rawExpenses.map((p) => ({
    id: p.id,
    expense_id: p.expense_id,
    amount: Number(p.amount),
    currency: p.currency,
    payment_date: p.payment_date,
    paid_by: p.paid_by,
    notes: p.notes,
    expense_name: normalize(p.expenses)?.name ?? 'Gasto eliminado',
  }))

  const rawAdjustments = (adjustments ?? []) as unknown as RawAdjustmentRow[]
  const normalizedAdjustments = rawAdjustments.map((a) => ({
    id: a.id,
    month: a.month,
    favor: a.favor,
    amount: Number(a.amount),
    currency: a.currency,
    description: a.description,
    created_at: a.created_at,
  }))

  return (
    <BalanceClient
      initialIncome={normalizedIncome}
      initialExpenses={normalizedExpenses}
      initialAdjustments={normalizedAdjustments}
      usdRates={usdRates}
    />
  )
}
