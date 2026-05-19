'use client'

import { useActionState, useEffect, useState, useTransition, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X } from 'lucide-react'
import { updatePaymentAction, deletePaymentAction } from '../payment-actions'

type Payment = {
  id: string
  amount: number | string
  payment_date: string
  client_services: { domain_name: string | null } | null
}

function EditPaymentModal({
  payment,
  onClose,
  onSuccess,
}: {
  payment: Payment
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(updatePaymentAction, null)

  useEffect(() => {
    if (state?.success) { onSuccess(); onClose() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Editar Pago</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={payment.id} />

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
            <input type="number" id="amount" name="amount" required min={0} step={0.01}
              defaultValue={Number(payment.amount)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago *</label>
            <input type="date" id="payment_date" name="payment_date" required
              defaultValue={payment.payment_date}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
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
      </div>
    </div>
  )
}

export function IncomePaymentActions({ payment }: { payment: Payment }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de eliminar este pago?')) return
    startTransition(async () => {
      await deletePaymentAction(payment.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={() => setEditing(true)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          aria-label="Editar pago"
          title="Editar"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          aria-label="Eliminar pago"
          title="Eliminar"
        >
          {isPending ? <span className="text-xs font-medium">...</span> : <Trash2 size={12} />}
        </button>
      </div>
      {editing && (
        <EditPaymentModal
          payment={payment}
          onClose={() => setEditing(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
