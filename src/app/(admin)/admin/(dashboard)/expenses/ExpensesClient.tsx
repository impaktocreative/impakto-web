'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createExpenseAction, deleteExpenseAction, updateExpenseAction, registerExpensePaymentAction } from './actions'
import { format } from 'date-fns'
import { CreditCard, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { updateExpensePaymentAction, deleteExpensePaymentAction } from './actions'
import { Modal } from '@/components/ui/Modal'

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

function EditExpensePaymentForm({
  payment,
  onClose,
  onSuccess,
}: {
  payment: ExpensePayment
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(updateExpensePaymentAction, null)

  useEffect(() => {
    if (state?.success) { onSuccess(); onClose() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={payment.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto ({payment.currency}) *</label>
          <input type="number" id="edit-amount" name="amount" required min={0} step={0.01}
            defaultValue={payment.amount}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label htmlFor="edit-payment_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago *</label>
          <input type="date" id="edit-payment_date" name="payment_date" required
            defaultValue={payment.payment_date}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div>
        <label htmlFor="edit-paid_by" className="block text-sm font-medium text-gray-700 mb-1">Pagado por *</label>
        <select id="edit-paid_by" name="paid_by" required defaultValue={payment.paid_by}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="sergio">Sergio</option>
          <option value="rodrigo">Rodrigo</option>
        </select>
      </div>

      <div>
        <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">Notas <span className="text-gray-400 font-normal">(opcional)</span></label>
        <textarea id="edit-notes" name="notes" rows={2} defaultValue={payment.notes ?? ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
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
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
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
}: {
  initialExpenses: Expense[]
  initialPayments: ExpensePayment[]
}) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingPayment, setEditingPayment] = useState<ExpensePayment | null>(null)
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

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

  const handleDeletePayment = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pago?')) return
    setDeletingPaymentId(id)
    startTransition(async () => {
      await deleteExpensePaymentAction(id)
      setDeletingPaymentId(null)
      router.refresh()
    })
  }

  const handleSuccess = () => router.refresh()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gastos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestioná los gastos recurrentes de la empresa.</p>
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
            <thead className="bg-gray-50/50 sticky top-0 z-10">
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
            <thead className="bg-gray-50/50 sticky top-0 z-10">
              <tr>
                <th className="w-[18%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gasto</th>
                <th className="w-[17%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pagado por</th>
                <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="w-[18%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas</th>
                <th className="w-[10%] px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
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
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingPayment(p)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        aria-label="Editar pago"
                        title="Editar"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        disabled={deletingPaymentId === p.id && isPending}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label="Eliminar pago"
                        title="Eliminar"
                      >
                        {deletingPaymentId === p.id && isPending ? <span className="text-xs font-medium">...</span> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No hay pagos de gastos registrados.</td>
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
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => setEditingPayment(p)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  aria-label="Editar pago"
                  title="Editar"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleDeletePayment(p.id)}
                  disabled={deletingPaymentId === p.id && isPending}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="Eliminar pago"
                  title="Eliminar"
                >
                  {deletingPaymentId === p.id && isPending ? <span className="text-xs font-medium">...</span> : <Trash2 size={12} />}
                </button>
              </div>
            </article>
          ))}
          {initialPayments.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-500 text-sm">No hay pagos de gastos registrados.</div>
          )}
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

      {editingPayment && (
        <Modal title="Editar Pago de Gasto" onClose={() => setEditingPayment(null)}>
          <EditExpensePaymentForm
            payment={editingPayment}
            onClose={() => setEditingPayment(null)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}
    </div>
  )
}
