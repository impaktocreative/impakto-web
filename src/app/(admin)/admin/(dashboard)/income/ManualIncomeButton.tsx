'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { registerManualIncomeAction } from '../payment-actions'
import { MEDIOS_DE_PAGO, medioDePago } from '@/lib/medios-de-pago'
import { RETENCION_BANCARIA } from '@/lib/billing'

export type ClienteBreve = { id: string; brand_name: string | null; contact_name: string | null }

/**
 * Ingreso suelto: un cobro que no corresponde a ningún servicio contratado
 * y que antes obligaba a inventar un cliente y un servicio para poder
 * cargarlo.
 */
export function ManualIncomeButton({ clientes = [] }: { clientes?: ClienteBreve[] }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [medio, setMedio] = useState('transferencia')
  const [monto, setMonto] = useState('')
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

  // El neto se muestra antes de guardar. Ver el descuento en el momento evita
  // la sorpresa de que el balance no coincida con lo que se tipeó.
  const info = medioDePago(medio)
  const numero = parseFloat(monto)
  const neto =
    info?.retencion && !Number.isNaN(numero) && numero > 0
      ? Math.round(numero * (1 - RETENCION_BANCARIA) * 100) / 100
      : null

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
                No hace falta que corresponda a un servicio contratado: este ingreso entra al balance por sí solo.
              </p>
            </div>

            <div>
              <label htmlFor="mi-client" className="mb-1 block text-sm font-medium text-gray-700">
                Cliente <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <select
                id="mi-client"
                name="client_id"
                defaultValue=""
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Sin cliente asociado</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand_name ?? c.contact_name ?? 'Sin nombre'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Atarlo a un cliente existente sirve para ver su historial completo en la ficha,
                aunque el cobro no corresponda a ningún servicio del catálogo.
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
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
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

            <div>
              <label htmlFor="mi-method" className="mb-1 block text-sm font-medium text-gray-700">
                Medio de pago
              </label>
              <select
                id="mi-method"
                name="payment_method"
                value={medio}
                onChange={(e) => setMedio(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                {MEDIOS_DE_PAGO.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.etiqueta}
                  </option>
                ))}
              </select>
              {info && (
                <div className="mt-2 space-y-1 rounded-md bg-gray-50 px-3 py-2 text-xs">
                  <p className={info.declarado ? 'text-gray-700' : 'text-gray-500'}>
                    {info.declarado
                      ? 'Entra al circuito declarado: computa para impuestos.'
                      : 'Fuera del circuito declarado: no computa para impuestos.'}
                  </p>
                  {neto !== null && (
                    <p className="text-gray-700">
                      Retención bancaria del {(RETENCION_BANCARIA * 100).toFixed(1).replace('.', ',')}%.
                      Neto acreditado:{' '}
                      <strong>{neto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
              <input
                type="checkbox"
                name="exclude_from_totals"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">
                No computar en los totales
                <span className="mt-0.5 block text-xs text-gray-500">
                  Queda registrado y visible, pero no suma al mes ni al balance. Para devoluciones,
                  movimientos entre cuentas propias o plata que solo pasa.
                </span>
              </span>
            </label>

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
