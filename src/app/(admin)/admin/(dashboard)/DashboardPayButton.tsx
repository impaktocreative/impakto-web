'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HandCoins, X } from 'lucide-react'
import { registerPaymentAction } from './payment-actions'

type DashboardItem = {
  id: string
  price: number
  currency: string
  duration_months: number
  services?: { name: string } | null
  clients?: { brand_name: string; contact_name: string } | null
  domain_name?: string | null
  client_id?: string | null
}

function RegisterPaymentModal({
  item,
  onClose,
  onSuccess,
}: {
  item: DashboardItem
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(registerPaymentAction, null)

  useEffect(() => {
    if (state?.success) { onSuccess(); onClose() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Registrar Pago</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="client_service_id" value={item.id} />
          <input type="hidden" name="currency" value={item.currency} />
          <input type="hidden" name="duration_months" value={item.duration_months} />
          <input type="hidden" name="client_id" value={item.client_id ?? ''} />

          <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
            <strong>{item.clients?.brand_name}</strong> — {item.services?.name}
            {item.domain_name && ` (${item.domain_name})`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto ({item.currency}) *</label>
              <input type="number" name="amount" required min={0} step={0.01}
                defaultValue={item.price}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago *</label>
              <input type="date" name="payment_date" required defaultValue={today}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            El próximo vencimiento se actualizará sumando <strong>{item.duration_months} mes(es)</strong> a la fecha de pago.
          </p>

          {state && !state.success && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{state.message}</p>
          )}

          <div className="flex justify-end gap-3">
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
      </div>
    </div>
  )
}

export function DashboardPayButton({ item }: { item: DashboardItem }) {
  const router = useRouter()
  const [paying, setPaying] = useState(false)

  return (
    <>
      <button
        onClick={() => setPaying(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-colors"
        aria-label="Registrar pago"
        title="Registrar pago"
      >
        <HandCoins size={14} />
        <span className="sr-only">Registrar pago</span>
      </button>
      {paying && (
        <RegisterPaymentModal
          item={item}
          onClose={() => setPaying(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
