'use client'

import { useActionState, useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { assignServiceAction, removeClientServiceAction, editClientServiceAction } from './actions'
import { registerPaymentAction } from '../../payment-actions'
import { Plus, X, Trash2, CreditCard, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type Service = { id: string; name: string; duration_months: number; price: number; currency: string }
type ClientService = {
  id: string
  domain_name?: string | null
  price: number
  currency: string
  next_payment_date?: string | null
  last_payment_date?: string | null
  status: string
  duration_months: number
  notes?: string | null
  services?: { name: string } | null
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

function AssignServiceForm({
  clientId,
  services,
  onClose,
  onSuccess,
}: {
  clientId: string
  services: Service[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(assignServiceAction, null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [lastPaymentDate, setLastPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [durationMonths, setDurationMonths] = useState<number>(0)

  const computedNextDate = (() => {
    if (!lastPaymentDate || !durationMonths) return null
    const d = new Date(lastPaymentDate)
    d.setMonth(d.getMonth() + durationMonths)
    return d.toISOString().split('T')[0]
  })()

  useEffect(() => {
    if (state?.success) { onSuccess(); onClose() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="client_id" value={clientId} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Servicio *</label>
        <select
          name="service_id"
          required
        onChange={(e) => {
            const s = services.find(x => x.id === e.target.value) || null
            setSelectedService(s)
            if (s) setDurationMonths(s.duration_months)
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Seleccionar servicio...</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dominio / Identificador</label>
        <input type="text" name="domain_name" placeholder="ej: misitioweb.com"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <div className="w-full border border-gray-100 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500">
            {selectedService ? `${selectedService.currency === 'USD' ? 'USD' : '$'} ${Number(selectedService.price).toLocaleString('es-AR')}` : '-'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
          <div className="w-full border border-gray-100 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500">
            {selectedService ? `${selectedService.duration_months} meses` : '-'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de último pago</label>
          <input type="date" name="last_payment_date"
            value={lastPaymentDate}
            onChange={(e) => setLastPaymentDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Próximo vencimiento</label>
          <input type="text" readOnly
            value={computedNextDate ?? 'Completá fecha y duración'}
            className="w-full border border-gray-100 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
          {computedNextDate && <input type="hidden" name="next_payment_date" value={computedNextDate} />}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select name="status"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea name="notes" rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none" />
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
          {isPending ? 'Guardando...' : 'Asignar Servicio'}
        </button>
      </div>
    </form>
  )
}

function RegisterPaymentForm({
  clientService,
  clientId,
  onClose,
  onSuccess,
}: {
  clientService: ClientService
  clientId: string
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
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="client_service_id" value={clientService.id} />
      <input type="hidden" name="currency" value={clientService.currency} />
      <input type="hidden" name="duration_months" value={clientService.duration_months} />
      <input type="hidden" name="client_id" value={clientId} />

      <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
        <strong>{clientService.services?.name}</strong>
        {clientService.domain_name && ` — ${clientService.domain_name}`}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto ({clientService.currency}) *</label>
          <input type="number" name="amount" required min={0} step={0.01}
            defaultValue={clientService.price}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago *</label>
          <input type="date" name="payment_date" required defaultValue={today}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        El próximo vencimiento se calculará automáticamente sumando <strong>{clientService.duration_months} mes(es)</strong> a la fecha de pago.
      </p>

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
          {isPending ? 'Registrando...' : 'Registrar Pago'}
        </button>
      </div>
    </form>
  )
}

function EditServiceForm({
  clientService,
  clientId,
  onClose,
  onSuccess,
}: {
  clientService: ClientService
  clientId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(editClientServiceAction, null)
  const [lastPaymentDate, setLastPaymentDate] = useState(clientService.last_payment_date ? new Date(clientService.last_payment_date).toISOString().split('T')[0] : '')
  const [durationMonths, setDurationMonths] = useState<number>(clientService.duration_months)

  const computedNextDate = (() => {
    if (!lastPaymentDate || !durationMonths) return null
    const d = new Date(lastPaymentDate)
    d.setMonth(d.getMonth() + durationMonths)
    return d.toISOString().split('T')[0]
  })()

  useEffect(() => {
    if (state?.success) { onSuccess(); onClose() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={clientService.id} />
      <input type="hidden" name="client_id" value={clientId} />

      <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600 mb-2">
        <strong>{clientService.services?.name}</strong>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dominio / Identificador</label>
        <input type="text" name="domain_name" placeholder="ej: misitioweb.com" defaultValue={clientService.domain_name || ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <div className="w-full border border-gray-100 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500">
            {clientService.currency === 'USD' ? 'USD' : '$'} {Number(clientService.price).toLocaleString('es-AR')}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
          <div className="w-full border border-gray-100 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500">
            {clientService.duration_months} meses
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de último pago</label>
          <input type="date" name="last_payment_date"
            value={lastPaymentDate}
            onChange={(e) => setLastPaymentDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Próximo vencimiento</label>
          <input type="text" readOnly
            value={computedNextDate ?? 'Completá fecha y duración'}
            className="w-full border border-gray-100 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
          {computedNextDate && <input type="hidden" name="next_payment_date" value={computedNextDate} />}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select name="status" defaultValue={clientService.status}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea name="notes" rows={2} defaultValue={clientService.notes || ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none" />
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

export function ClientServicesPanel({
  clientId,
  initialServices,
  availableServices,
}: {
  clientId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialServices: any[]
  availableServices: Service[]
}) {
  const router = useRouter()
  const [showAssign, setShowAssign] = useState(false)
  const [payingService, setPayingService] = useState<ClientService | null>(null)
  const [editingService, setEditingService] = useState<ClientService | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [nowMs] = useState(() => Date.now())
  const [isPending, startTransition] = useTransition()

  const handleRemove = (id: string) => {
    if (!confirm('¿Eliminar este servicio del cliente?')) return
    setDeletingId(id)
    startTransition(async () => {
      await removeClientServiceAction(id, clientId)
      setDeletingId(null)
      router.refresh()
    })
  }

  const handleSuccess = () => router.refresh()

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">Servicios Contratados</h2>
          <button
            onClick={() => setShowAssign(true)}
            className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-medium py-2 px-4 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <Plus size={14} />
            Agregar Servicio
          </button>
        </div>

        {initialServices.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {initialServices.map((svc) => {
              const daysLeft = svc.next_payment_date
                ? Math.ceil((new Date(svc.next_payment_date).getTime() - nowMs) / 86400000)
                : null

              let badgeClass = 'bg-green-100 text-green-700'
              if (daysLeft === null) badgeClass = 'bg-gray-100 text-gray-500'
              else if (daysLeft <= 0) badgeClass = 'bg-red-100 text-red-700'
              else if (daysLeft <= 10) badgeClass = 'bg-yellow-100 text-yellow-700'

              return (
                <div key={svc.id} className="px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{svc.services?.name}</p>
                      {svc.domain_name && <p className="text-xs text-gray-500 mt-0.5">{svc.domain_name}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {svc.currency === 'USD' ? 'USD' : '$'} {Number(svc.price).toLocaleString('es-AR')}
                        </span>
                        {svc.next_payment_date && (
                          <span className="text-xs text-gray-400">
                            Vence: {format(new Date(svc.next_payment_date), "dd MMM yyyy", { locale: es })}
                          </span>
                        )}
                        {daysLeft !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                            {daysLeft <= 0 ? 'Vencido' : `${daysLeft} días`}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          svc.status === 'activo' ? 'bg-green-100 text-green-700' :
                          svc.status === 'vencido' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{svc.status}</span>
                      </div>
                      {svc.notes && <p className="text-xs text-gray-400 mt-1 italic">{svc.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 sm:ml-4 flex-shrink-0">
                      <button
                        onClick={() => setPayingService(svc)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-green-200 bg-white text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                        aria-label="Registrar pago"
                        title="Registrar pago"
                      >
                        <CreditCard size={14} />
                        <span className="sr-only">Registrar pago</span>
                      </button>
                      <button
                        onClick={() => setEditingService(svc)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        aria-label="Editar servicio"
                        title="Editar"
                      >
                        <Pencil size={14} />
                        <span className="sr-only">Editar</span>
                      </button>
                      <button
                        onClick={() => handleRemove(svc.id)}
                        disabled={deletingId === svc.id && isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label="Quitar servicio"
                        title="Quitar"
                      >
                        {deletingId === svc.id && isPending ? <span className="text-xs font-medium">...</span> : <Trash2 size={14} />}
                        <span className="sr-only">Quitar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            Este cliente no tiene servicios asignados.{' '}
            <button onClick={() => setShowAssign(true)} className="text-black font-medium hover:underline">
              Agregar uno
            </button>
          </div>
        )}
      </div>

      {showAssign && (
        <Modal title="Asignar Servicio al Cliente" onClose={() => setShowAssign(false)}>
          <AssignServiceForm
            clientId={clientId}
            services={availableServices}
            onClose={() => setShowAssign(false)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}

      {payingService && (
        <Modal title="Registrar Pago" onClose={() => setPayingService(null)}>
          <RegisterPaymentForm
            clientService={payingService}
            clientId={clientId}
            onClose={() => setPayingService(null)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}

      {editingService && (
        <Modal title="Editar Servicio" onClose={() => setEditingService(null)}>
          <EditServiceForm
            clientService={editingService}
            clientId={clientId}
            onClose={() => setEditingService(null)}
            onSuccess={handleSuccess}
          />
        </Modal>
      )}
    </>
  )
}
