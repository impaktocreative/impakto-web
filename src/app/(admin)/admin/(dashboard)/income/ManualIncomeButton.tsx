'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { registerManualIncomeAction } from '../payment-actions'

/**
 * Ingreso suelto: un cobro que no corresponde a ningún servicio contratado
 * y que antes obligaba a inventar un cliente y un servicio para poder
 * cargarlo.
 */
export function ManualIncomeButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Sin useActionState: llamando la acción desde el submit se decide acá si
  // cerrar o mostrar el error, sin un efecto que haga setState en cascada.
  const enviar = (formData: FormData) => {
    startTransition(async () => {
      const r = await registerManualIncomeAction(null, formData)
      if (r.success) {
        setError(null)
        setOpen(false)
        router.refresh()
      } else {
        setError(r.message ?? 'No se pudo registrar el ingreso.')
      }
    })
  }

  const hoy = new Date().toISOString().slice(0, 10)

  return (
    <>
      <button
        onClick={() => { setError(null); setOpen(true) }}
        className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow"
      >
        <Plus size={20} />
        Ingreso manual
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} title="Registrar ingreso manual">
          <form action={enviar} className="space-y-4">
            <div>
              <label htmlFor="mi-desc" className="mb-1 block text-sm font-medium text-gray-700">
                Concepto
              </label>
              <input
                id="mi-desc"
                name="description"
                required
                placeholder="Diseño de logo, consultoría, venta puntual..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="mt-1 text-xs text-gray-500">
                No hace falta crear el cliente ni el servicio: este ingreso entra al balance por sí solo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mi-amount" className="mb-1 block text-sm font-medium text-gray-700">
                  Monto
                </label>
                <input
                  id="mi-amount"
                  name="amount"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label htmlFor="mi-currency" className="mb-1 block text-sm font-medium text-gray-700">
                  Moneda
                </label>
                <select
                  id="mi-currency"
                  name="currency"
                  defaultValue="ARS"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mi-date" className="mb-1 block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  id="mi-date"
                  name="payment_date"
                  type="date"
                  defaultValue={hoy}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label htmlFor="mi-receiver" className="mb-1 block text-sm font-medium text-gray-700">
                  Lo recibió
                </label>
                <select
                  id="mi-receiver"
                  name="receiver"
                  defaultValue="sergio"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="sergio">Sergio</option>
                  <option value="rodrigo">Rodrigo</option>
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                {isPending ? 'Guardando...' : 'Registrar ingreso'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
