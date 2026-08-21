import { createClient } from '@/utils/supabase/server'
import { ExpensesClient } from './ExpensesClient'

type RawExpensePaymentRow = {
  id: string
  expense_id: string
  amount: number | string
  currency: string
  payment_date: string
  paid_by: 'sergio' | 'rodrigo'
  notes: string | null
  exclude_from_totals: boolean
  expenses: { name: string } | Array<{ name: string }> | null
}

export default async function ExpensesPage() {
  const supabase = await createClient()

  const [{ data: expenses }, { data: expensePayments }] = await Promise.all([
    supabase.from('expenses').select('*').order('name', { ascending: true }),
    supabase
      .from('expense_payments')
      .select('id, expense_id, amount, currency, payment_date, paid_by, notes, exclude_from_totals, expenses ( name )')
      .order('payment_date', { ascending: false }),
  ])

  const rawPayments = (expensePayments ?? []) as unknown as RawExpensePaymentRow[]
  const normalizedPayments = rawPayments.map((p) => ({
    id: p.id,
    expense_id: p.expense_id,
    amount: Number(p.amount),
    currency: p.currency,
    payment_date: p.payment_date,
    paid_by: p.paid_by,
    notes: p.notes,
    exclude_from_totals: p.exclude_from_totals ?? false,
    expenses: Array.isArray(p.expenses) ? p.expenses[0] ?? null : p.expenses,
  }))

  return (
    <ExpensesClient
      initialExpenses={(expenses ?? []).map((e) => ({
        ...e,
        amount: Number(e.amount),
        duration_months: Number(e.duration_months),
      }))}
      initialPayments={normalizedPayments}
    />
  )
}
