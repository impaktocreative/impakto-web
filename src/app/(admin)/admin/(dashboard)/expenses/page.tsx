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
  expenses: { name: string } | Array<{ name: string }> | null
}

type RawIncomePaymentRow = {
  amount: number | string
  net_amount: number | string | null
  receiver: string | null
  currency: string
  payment_date: string
  client_services: {
    receiver: string | null
  } | Array<{
    receiver: string | null
  }> | null
}

export default async function ExpensesPage() {
  const supabase = await createClient()

  const [{ data: expenses }, { data: expensePayments }, { data: incomePayments }] = await Promise.all([
    supabase.from('expenses').select('*').order('name', { ascending: true }),
    supabase
      .from('expense_payments')
      .select('id, expense_id, amount, currency, payment_date, paid_by, notes, expenses ( name )')
      .order('payment_date', { ascending: false }),
    supabase
      .from('payments')
      .select(`
        amount,
        net_amount,
        receiver,
        currency,
        payment_date,
        client_services ( receiver )
      `)
      .gte('payment_date', new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0])
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
    expenses: Array.isArray(p.expenses) ? p.expenses[0] ?? null : p.expenses,
  }))

  const rawIncome = (incomePayments ?? []) as unknown as RawIncomePaymentRow[]
  const normalizedIncome = rawIncome.map((p) => {
    const cs = Array.isArray(p.client_services) ? p.client_services[0] ?? null : p.client_services
    return {
      amount: Number(p.amount),
      net_amount: p.net_amount != null ? Number(p.net_amount) : null,
      currency: p.currency,
      payment_date: p.payment_date,
      receiver: p.receiver ?? cs?.receiver ?? null,
    }
  })

  return (
    <ExpensesClient
      initialExpenses={(expenses ?? []) as any}
      initialPayments={normalizedPayments}
      initialIncome={normalizedIncome}
    />
  )
}
