'use client'

import { useActionState, useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createServiceAction, updateServiceAction, deleteServiceAction } from './actions'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'

type Service = {
  id: string
  name: string
  duration_months: number
  price_ars: number
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

      <div>
        <label htmlFor="price_ars" className="block text-sm font-medium text-gray-700 mb-1">
          Precio Base (ARS)
        </label>
        <input
          type="number"
          id="price_ars"
          name="price_ars"
          required
          min={0}
          step={0.01}
          defaultValue={service?.price_ars}
          placeholder="50000"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
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
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {state.message}
        </p>
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ServicesClient({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return
    setDeletingId(id)
    startTransition(async () => {
      await deleteServiceAction(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  const handleMutationSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Catálogo de Servicios</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Servicio Base
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Servicios Base</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tipos de servicios que se pueden asignar a los clientes.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre del Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración (Meses)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Base (ARS)
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-500 truncate">{service.description || <span className="italic text-gray-300">—</span>}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{service.duration_months} meses</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(service.price_ars).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingService(service)}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id && isPending}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {deletingId === service.id && isPending ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No hay servicios registrados en el catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear */}
      {showCreate && (
        <Modal title="Nuevo Servicio Base" onClose={() => setShowCreate(false)}>
          <ServiceForm
            action={createServiceAction}
            onClose={() => setShowCreate(false)}
            onSuccess={handleMutationSuccess}
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {editingService && (
        <Modal title="Editar Servicio" onClose={() => setEditingService(null)}>
          <ServiceForm
            service={editingService}
            action={updateServiceAction}
            onClose={() => setEditingService(null)}
            onSuccess={handleMutationSuccess}
          />
        </Modal>
      )}
    </>
  )
}
