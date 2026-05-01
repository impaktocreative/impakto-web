'use client'

import { useActionState, useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateClientAction, deleteClientAction } from './actions'
import { Eye, Pencil, Trash2, X } from 'lucide-react'
import Link from 'next/link'

type Client = {
  id: string
  brand_name: string
  contact_name: string
  email?: string | null
  phone?: string | null
  website_url?: string | null
  notes?: string | null
}

function EditClientModal({ client, onClose, onSuccess }: { client: Client; onClose: () => void; onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState(updateClientAction, null)

  useEffect(() => {
    if (state?.success) {
      onSuccess()
      onClose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Editar Cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={client.id} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto *</label>
              <input type="text" name="contact_name" required defaultValue={client.contact_name}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca / Empresa *</label>
              <input type="text" name="brand_name" required defaultValue={client.brand_name}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" defaultValue={client.email ?? ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="text" name="phone" defaultValue={client.phone ?? ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
            <input type="text" name="website_url" defaultValue={client.website_url ?? ''}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
            <textarea name="notes" rows={3} defaultValue={client.notes ?? ''}
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
      </div>
    </div>
  )
}

export function ClientsTable({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (client: Client) => {
    if (!confirm(`¿Eliminar a "${client.brand_name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(client.id)
    startTransition(async () => {
      await deleteClientAction(client.id)
      setDeletingId(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sitio Web</th>
              <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.brand_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.contact_name}</div>
                  {client.phone && <div className="text-sm text-gray-500">{client.phone}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.website_url && (
                    <a
                      href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                      target="_blank" rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {client.website_url}
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="inline-flex items-center gap-1 text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    >
                      <Eye size={13} />
                      Ver Ficha
                    </Link>
                    <button
                      onClick={() => setEditingClient(client)}
                      className="inline-flex items-center gap-1 text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      disabled={deletingId === client.id && isPending}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      {deletingId === client.id && isPending ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {initialClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
