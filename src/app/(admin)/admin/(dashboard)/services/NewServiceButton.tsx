'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { createServiceAction, deleteServiceAction, updateServiceAction } from './actions'

type Service = {
  id: string
  name: string
  duration_months: number
  price: number
  currency: string
  description?: string | null
}

function ServiceForm({
  service,
  action,
  onClose,
  onSuccess,
}: {
  service?: Service
  action: typeof createServiceAction
  onClose: () => void
  onSuccess: () => void
}) {
  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      onSuccess()
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {service && <input type="hidden" name="id" value={service.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Servicio
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={service?.name}
          placeholder="Ej: Hosting Web Anual"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700 mb-1">
          Duración (meses)
        </label>
        <input
          type="number"
          id="duration_months"
          name="duration_months"
          required
          min={1}
          defaultValue={service?.duration_months}
          placeholder="12"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio Base
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min={0}
            step={0.01}
            defaultValue={service?.price}
            placeholder="50000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Moneda
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={service?.currency || 'ARS'}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción / Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={service?.description ?? ''}
          placeholder="Describe el servicio, incluye observaciones o detalles técnicos..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
        />
      </div>

      {state && !state.success && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{state.message}</p>
      )}

      <div className="flex justify-end gap-3 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : service ? 'Guardar Cambios' : 'Crear Servicio'}
        </button>
      </div>
    </form>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ServiceActions({
  service,
  onEdit,
  onDelete,
  deleting,
}: {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
  deleting: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={() => onEdit(service)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        aria-label={`Editar ${service.name}`}
        title="Editar"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => onDelete(service.id)}
        disabled={deleting}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        aria-label={`Eliminar ${service.name}`}
        title="Eliminar"
      >
        {deleting ? <span className="text-xs font-medium">...</span> : <Trash2 size={14} />}
      </button>
    </div>
  )
}

export function ServicesClient({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return initialServices

    return initialServices.filter((service) =>
      [service.name, service.description].filter(Boolean).some((value) => value!.toLowerCase().includes(normalized)),
    )
  }, [initialServices, query])

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return
    setDeletingId(id)
    startTransition(async () => {
      await deleteServiceAction(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Catálogo de Servicios</h1>
            <p className="mt-1 text-sm text-gray-500">Gestioná los servicios base que luego se asignan a cada cliente.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Servicio Base
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative w-full sm:max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar servicio por nombre o descripción..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </label>
              <p className="text-xs sm:text-sm text-gray-500">
                {filteredServices.length} de {initialServices.length} servicios
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <table className="w-full table-fixed divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="w-[28%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="w-[32%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duración</th>
                  <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="w-[10%] px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-semibold text-gray-900 break-words">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-gray-600 break-words">{service.description || '—'}</td>
                    <td className="px-6 py-4 align-top text-sm text-gray-900">{service.duration_months} meses</td>
                    <td className="px-6 py-4 align-top text-sm text-gray-900">
                      {service.currency === 'USD' ? 'USD' : '$'} {Number(service.price).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <ServiceActions
                        service={service}
                        onEdit={setEditingService}
                        onDelete={handleDelete}
                        deleting={deletingId === service.id && isPending}
                      />
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      {query ? 'No se encontraron servicios con ese criterio.' : 'No hay servicios registrados en el catálogo.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-100">
            {filteredServices.map((service) => (
              <article key={service.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 break-words">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 break-words">{service.description || 'Sin descripción'}</p>
                  </div>
                  <ServiceActions
                    service={service}
                    onEdit={setEditingService}
                    onDelete={handleDelete}
                    deleting={deletingId === service.id && isPending}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duración: {service.duration_months} meses</span>
                  <span className="font-semibold text-gray-900">
                    {service.currency === 'USD' ? 'USD' : '$'} {Number(service.price).toLocaleString('es-AR')}
                  </span>
                </div>
              </article>
            ))}

            {filteredServices.length === 0 && (
              <div className="px-4 py-10 text-center text-gray-500 text-sm">
                {query ? 'No se encontraron servicios con ese criterio.' : 'No hay servicios registrados en el catálogo.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <Modal title="Nuevo Servicio Base" onClose={() => setShowCreate(false)}>
          <ServiceForm action={createServiceAction} onClose={() => setShowCreate(false)} onSuccess={() => router.refresh()} />
        </Modal>
      )}

      {editingService && (
        <Modal title="Editar Servicio" onClose={() => setEditingService(null)}>
          <ServiceForm
            service={editingService}
            action={updateServiceAction}
            onClose={() => setEditingService(null)}
            onSuccess={() => router.refresh()}
          />
        </Modal>
      )}
    </>
  )
}
