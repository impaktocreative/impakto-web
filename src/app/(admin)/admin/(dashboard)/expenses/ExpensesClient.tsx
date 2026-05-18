'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createExpenseAction, deleteExpenseAction, updateExpenseAction, registerExpensePaymentAction } from './actions'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard, Pencil, Plus, Search, Trash2, X } from 'lucide-react'

type Expense = {
  id: string
  name: string
  description: string | null
  amount: number
  currency: string
  duration_months: number
  due_date: string
}

type ExpensePayment = {
  id: string
  expense_id: string
  amount: number
  currency: string
  payment_date: string
  paid_by: 'sergio' | 'rodrigo'
  notes: string | null
  expenses?: { name: string } | null
}

type IncomePayment = {
  amount: number
  currency: string
  payment_date: string
  receiver: string | null
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto ring-1 ring-gray-900/5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ExpenseForm({
  expense,
  action,
  onClose,
  onSuccess,
}: {
  expense?: Expense
  action: typeof createExpenseAction
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) { onSuccess(); onClose() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {expense && <input type="hidden" name="id" value={expense.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Gasto</label>
        <input type="text" id="name" name="name" required
          defaultValue={expense?.name}
          placeholder="Ej: Servidor VPS"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
        <textarea id="description" name="description" rows={2}
          defaultValue={expense?.description ?? ''}
          placeholder="Describe el gasto..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <input type="number" id="amount" name="amount" required min={0} step={0.01}
            defaultValue={expense?.amount}
            placeholder="50000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select id="currency" name="currency"
            defaultValue={expense?.currency || 'ARS'}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
        <input type="date" id="due_date" name="due_date" required
          defaultValue={expense?.due_date}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700 mb-1">Período (meses)</label>
        <input type="number" id="duration_months" name="duration_months" required min={1}
          defaultValue={expense?.duration_months || 1}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {state && !state.success && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{state.message}</p>
      )}

      <div className="flex justify-end gap-3 mt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50">
          {isPending ? 'Guardando...' : expense ? 'Guardar Cambios' : 'Crear Gasto'}
        </button>
      </div>
    </form>
  )
}

function RegisterPaymentForm({
  expense,
  onClose,
  onSuccess,
}: {
  expense: Expense
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(registerExpensePaymentAction, null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (state?.success) { onSuccess(); onClose() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="expense_id" value={expense.id} />
      <input type="hidden" name="currency" value={expense.currency} />

      <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
        <strong>{expense.name}</strong>
        {expense.description && <span> — {expense.description}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Monto ({expense.currency}) *</label>
          <input type="number" id="amount" name="amount" required min={0} step={0.01}
            defaultValue={expense.amount}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago *</label>
          <input type="date" id="payment_date" name="payment_date" required defaultValue={today}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div>
        <label htmlFor="paid_by" className="block text-sm font-medium text-gray-700 mb-1">Pagado por *</label>
        <select id="paid_by" name="paid_by" required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Seleccionar...</option>
          <option value="sergio">Sergio</option>
          <option value="rodrigo">Rodrigo</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notas <span className="text-gray-400 font-normal">(opcional)</span></label>
        <textarea id="notes" name="notes" rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
        />
      </div>

      {state && !state.success && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{state.message}</p>
      )}

      {state?.success && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">{state.message}</p>
      )}

      <div className="flex justify-end gap-3 mt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50">
          {isPending ? 'Registrando...' : 'Registrar Pago'}
        </button>
      </div>
    </form>
  )
}

function ExpenseActions({
  expense,
  onEdit,
  onDelete,
  onPay,
  deleting,
}: {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  onPay: (expense: Expense) => void
  deleting: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={() => onPay(expense)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-green-200 bg-white text-green-700 hover:bg-green-600 hover:text-white transition-colors"
        aria-label="Registrar pago"
        title="Registrar pago"
      >
        <CreditCard size={14} />
      </button>
      <button
        onClick={() => onEdit(expense)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        aria-label="Editar gasto"
        title="Editar"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => onDelete(expense.id)}
        disabled={deleting}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        aria-label="Eliminar gasto"
        title="Eliminar"
      >
        {deleting ? <span className="text-xs font-medium">...</span> : <Trash2 size={14} />}
      </button>
    </div>
  )
}

export function ExpensesClient({
  initialExpenses,
  initialPayments,
  initialIncome,
}: {
  initialExpenses: Expense[]
  initialPayments: ExpensePayment[]
  initialIncome: IncomePayment[]
}) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const [balanceMonth, setBalanceMonth] = useState(() => format(new Date(), 'yyyy-MM'))
  const [usdRate, setUsdRate] = useState('1400')

  const filteredExpenses = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return initialExpenses
    return initialExpenses.filter((e) =>
      [e.name, e.description].filter(Boolean).some((v) => v!.toLowerCase().includes(normalized))
    )
  }, [initialExpenses, query])

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return
    setDeletingId(id)
    startTransition(async () => {
      await deleteExpenseAction(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  const handleSuccess = () => router.refresh()

  const balanceData = useMemo(() => {
    const [year, month] = balanceMonth.split('-').map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)
    const monthStart = format(startOfMonth(start), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(start), 'yyyy-MM-dd')
    const rate = parseFloat(usdRate) || 1

    const incomeInMonth = initialIncome.filter((p) => p.payment_date >= monthStart && p.payment_date <= monthEnd)

    let sergioIncomeARS = 0
    let rodrigoIncomeARS = 0
    let sergioIncomeUSD = 0
    let rodrigoIncomeUSD = 0

    for (const p of incomeInMonth) {
      if (p.receiver === 'sergio') {
        if (p.currency === 'ARS') sergioIncomeARS += Number(p.amount)
        else sergioIncomeUSD += Number(p.amount)
      } else if (p.receiver === 'rodrigo') {
        if (p.currency === 'ARS') rodrigoIncomeARS += Number(p.amount)
        else rodrigoIncomeUSD += Number(p.amount)
      }
    }

    const paymentsInMonth = initialPayments.filter((p) => p.payment_date >= monthStart && p.payment_date <= monthEnd)

    let sergioExpensesARS = 0
    let rodrigoExpensesARS = 0
    let sergioExpensesUSD = 0
    let rodrigoExpensesUSD = 0

    for (const p of paymentsInMonth) {
      if (p.paid_by === 'sergio') {
        if (p.currency === 'ARS') sergioExpensesARS += Number(p.amount)
        else sergioExpensesUSD += Number(p.amount)
      } else {
        if (p.currency === 'ARS') rodrigoExpensesARS += Number(p.amount)
        else rodrigoExpensesUSD += Number(p.amount)
      }
    }

    const sergioIncomeTotal = sergioIncomeARS + sergioIncomeUSD * rate
    const rodrigoIncomeTotal = rodrigoIncomeARS + rodrigoIncomeUSD * rate
    const sergioExpensesTotal = sergioExpensesARS + sergioExpensesUSD * rate
    const rodrigoExpensesTotal = rodrigoExpensesARS + rodrigoExpensesUSD * rate

    const sergioNeto = sergioIncomeTotal - sergioExpensesTotal
    const rodrigoNeto = rodrigoIncomeTotal - rodrigoExpensesTotal
    const netoTotal = sergioNeto + rodrigoNeto
    const mitad = netoTotal / 2
    const liquidacion = mitad - sergioNeto

    return {
      monthStart,
      monthEnd,
      rate,
      sergioIncomeARS,
      rodrigoIncomeARS,
      sergioIncomeUSD,
      rodrigoIncomeUSD,
      sergioIncomeTotal,
      rodrigoIncomeTotal,
      sergioExpensesARS,
      rodrigoExpensesARS,
      sergioExpensesUSD,
      rodrigoExpensesUSD,
      sergioExpensesTotal,
      rodrigoExpensesTotal,
      sergioNeto,
      rodrigoNeto,
      netoTotal,
      mitad,
      liquidacion,
    }
  }, [initialIncome, initialPayments, balanceMonth, usdRate])

  const paidExpenseIds = new Set(initialPayments.map(p => p.expense_id))

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gastos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestioná los gastos de la empresa y el balance mensual.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Gasto
        </button>
      </div>

      {/* Expense Catalog */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden mb-8">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative w-full sm:max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar gasto..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </label>
            <p className="text-xs sm:text-sm text-gray-500">
              {filteredExpenses.length} de {initialExpenses.length} gastos
            </p>
          </div>
        </div>

        <div className="hidden md:block">
          <table className="w-full table-fixed divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="w-[22%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="w-[13%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vence</th>
                <th className="w-[12%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Período</th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="w-[18%] px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-semibold text-gray-900 break-words">{expense.name}</div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-gray-600 break-words">{expense.description || '—'}</td>
                  <td className="px-6 py-4 align-top text-sm text-gray-900">{format(new Date(expense.due_date), 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4 align-top text-sm text-gray-900">{expense.duration_months} mes(es)</td>
                  <td className="px-6 py-4 align-top text-sm text-gray-900">
                    {expense.currency === 'USD' ? 'USD' : '$'} {Number(expense.amount).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <ExpenseActions
                      expense={expense}
                      onEdit={setEditingExpense}
                      onDelete={handleDelete}
                      onPay={setPayingExpense}
                      deleting={deletingId === expense.id && isPending}
                    />
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    {query ? 'No se encontraron gastos con ese criterio.' : 'No hay gastos registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {filteredExpenses.map((expense) => (
            <article key={expense.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 break-words">{expense.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 break-words">{expense.description || 'Sin descripción'}</p>
                </div>
                <ExpenseActions
                  expense={expense}
                  onEdit={setEditingExpense}
                  onDelete={handleDelete}
                  onPay={setPayingExpense}
                  deleting={deletingId === expense.id && isPending}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Vence: {format(new Date(expense.due_date), 'dd/MM/yyyy')}</span>
                <span className="font-semibold text-gray-900">
                  {expense.currency === 'USD' ? 'USD' : '$'} {Number(expense.amount).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Cada {expense.duration_months} mes(es)
              </div>
            </article>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-500 text-sm">
              {query ? 'No se encontraron gastos.' : 'No hay gastos registrados.'}
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Historial de Pagos de Gastos</h2>
        </div>
        <div className="hidden md:block">
          <table className="w-full table-fixed divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[18%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gasto</th>
                <th className="w-[17%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pagado por</th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 align-top text-sm text-gray-900">
                    {format(new Date(p.payment_date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">
                    {p.expenses?.name ?? 'Gasto eliminado'}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.paid_by === 'sergio'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.paid_by === 'sergio' ? 'Sergio' : 'Rodrigo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-sm font-semibold text-red-600">
                    {p.currency === 'USD' ? 'USD' : '$'} {Number(p.amount).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-gray-500 break-words">{p.notes || '—'}</td>
                </tr>
              ))}
              {initialPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No hay pagos de gastos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {initialPayments.map((p) => (
            <article key={p.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-600">{format(new Date(p.payment_date), 'dd/MM/yyyy')}</span>
                <span className="text-sm font-semibold text-red-600">
                  {p.currency === 'USD' ? 'USD' : '$'} {Number(p.amount).toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{p.expenses?.name ?? 'Gasto eliminado'}</p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.paid_by === 'sergio' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.paid_by === 'sergio' ? 'Sergio' : 'Rodrigo'}
                </span>
                {p.notes && <span className="text-xs text-gray-500">{p.notes}</span>}
              </div>
            </article>
          ))}
          {initialPayments.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-500 text-sm">No hay pagos de gastos registrados.</div>
          )}
        </div>
      </div>

      {/* Monthly Balance */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Balance Mensual</h2>
            <p className="mt-1 text-sm text-gray-500">Resumen de ingresos y gastos del mes con liquidación sugerida.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div>
              <label htmlFor="balanceMonth" className="block text-xs font-medium text-gray-500 mb-1">Mes</label>
              <input
                type="month"
                id="balanceMonth"
                value={balanceMonth}
                onChange={(e) => setBalanceMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label htmlFor="usdRate" className="block text-xs font-medium text-gray-500 mb-1">Cotización USD</label>
              <input
                type="number"
                id="usdRate"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
                min={1}
                className="w-28 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ingresos Sergio</h4>
              <p className="text-xl font-bold text-green-600">
                ${balanceData.sergioIncomeTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ARS: ${balanceData.sergioIncomeARS.toLocaleString('es-AR')}
                {balanceData.sergioIncomeUSD > 0 && (
                  <span> / USD: {balanceData.sergioIncomeUSD.toLocaleString('es-AR')}</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Ingresos Rodrigo</h4>
              <p className="text-xl font-bold text-green-600">
                ${balanceData.rodrigoIncomeTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ARS: ${balanceData.rodrigoIncomeARS.toLocaleString('es-AR')}
                {balanceData.rodrigoIncomeUSD > 0 && (
                  <span> / USD: {balanceData.rodrigoIncomeUSD.toLocaleString('es-AR')}</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gastos Sergio</h4>
              <p className="text-xl font-bold text-red-600">
                ${balanceData.sergioExpensesTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ARS: ${balanceData.sergioExpensesARS.toLocaleString('es-AR')}
                {balanceData.sergioExpensesUSD > 0 && (
                  <span> / USD: {balanceData.sergioExpensesUSD.toLocaleString('es-AR')}</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gastos Rodrigo</h4>
              <p className="text-xl font-bold text-red-600">
                ${balanceData.rodrigoExpensesTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ARS: ${balanceData.rodrigoExpensesARS.toLocaleString('es-AR')}
                {balanceData.rodrigoExpensesUSD > 0 && (
                  <span> / USD: {balanceData.rodrigoExpensesUSD.toLocaleString('es-AR')}</span>
                )}
              </p>
            </div>
          </div>

          {/* Balance Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Concepto</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Sergio</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Rodrigo</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-600">Ingresos (ARS)</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${balanceData.sergioIncomeARS.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${balanceData.rodrigoIncomeARS.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${(balanceData.sergioIncomeARS + balanceData.rodrigoIncomeARS).toLocaleString('es-AR')}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Ingresos (USD {balanceData.rate > 0 ? `@ $${balanceData.rate}` : ''})</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${(balanceData.sergioIncomeUSD * balanceData.rate).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${(balanceData.rodrigoIncomeUSD * balanceData.rate).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${((balanceData.sergioIncomeUSD + balanceData.rodrigoIncomeUSD) * balanceData.rate).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-green-50/50">
                  <td className="px-4 py-3 font-medium text-green-700">Total Ingresos</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    ${balanceData.sergioIncomeTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    ${balanceData.rodrigoIncomeTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    ${(balanceData.sergioIncomeTotal + balanceData.rodrigoIncomeTotal).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Gastos (ARS)</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">- ${balanceData.sergioExpensesARS.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">- ${balanceData.rodrigoExpensesARS.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">- ${(balanceData.sergioExpensesARS + balanceData.rodrigoExpensesARS).toLocaleString('es-AR')}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">Gastos (USD {balanceData.rate > 0 ? `@ $${balanceData.rate}` : ''})</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    - ${(balanceData.sergioExpensesUSD * balanceData.rate).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    - ${(balanceData.rodrigoExpensesUSD * balanceData.rate).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    - ${((balanceData.sergioExpensesUSD + balanceData.rodrigoExpensesUSD) * balanceData.rate).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-red-50/50">
                  <td className="px-4 py-3 font-medium text-red-700">Total Gastos</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-700">
                    - ${balanceData.sergioExpensesTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-red-700">
                    - ${balanceData.rodrigoExpensesTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-red-700">
                    - ${(balanceData.sergioExpensesTotal + balanceData.rodrigoExpensesTotal).toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-gray-100/80 font-semibold">
                  <td className="px-4 py-3 text-gray-800">Neto</td>
                  <td className={`px-4 py-3 text-right ${balanceData.sergioNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${balanceData.sergioNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 text-right ${balanceData.rodrigoNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${balanceData.rodrigoNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 text-right ${balanceData.netoTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${balanceData.netoTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Settlement */}
          <div className="bg-black rounded-xl p-6 text-white">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Liquidación Sugerida</h3>
            {balanceData.liquidacion > 0 ? (
              <p className="text-2xl font-bold">
                Rodrigo debe pagar <span className="text-green-400">${balanceData.liquidacion.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span> a Sergio
              </p>
            ) : balanceData.liquidacion < 0 ? (
              <p className="text-2xl font-bold">
                Sergio debe pagar <span className="text-green-400">${Math.abs(balanceData.liquidacion).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span> a Rodrigo
              </p>
            ) : (
              <p className="text-xl font-semibold text-green-400">Todo está balanceado, no hay deudas entre ambos.</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Cada uno debería quedarse con la mitad del neto total (${balanceData.mitad.toLocaleString('es-AR', { maximumFractionDigits: 2 })}).
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <Modal title="Nuevo Gasto" onClose={() => setShowCreate(false)}>
          <ExpenseForm action={createExpenseAction} onClose={() => setShowCreate(false)} onSuccess={handleSuccess} />
        </Modal>
      )}

      {editingExpense && (
        <Modal title="Editar Gasto" onClose={() => setEditingExpense(null)}>
          <ExpenseForm
            expense={editingExpense}
            action={updateExpenseAction}
            onClose={() => setEditingExpense(null)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}

      {payingExpense && (
        <Modal title="Registrar Pago de Gasto" onClose={() => setPayingExpense(null)}>
          <RegisterPaymentForm
            expense={payingExpense}
            onClose={() => setPayingExpense(null)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}
    </div>
  )
}
