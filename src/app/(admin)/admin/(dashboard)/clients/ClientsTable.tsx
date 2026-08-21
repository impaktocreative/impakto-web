'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Globe, Mail, Pencil, Phone, Search, Trash2, X } from 'lucide-react'
import { deleteClientAction, updateClientAction } from './actions'
import { IconButton, IconButtonGroup, IconLink } from '@/app/(admin)/admin/ui/IconButton'
import { EstadoBadge } from '@/app/(admin)/admin/ui/Badge'
import { CONDICIONES_IVA_RECEPTOR } from '@/lib/arca-receptor'

type ClientServiceRow = {
  id: string
  domain_name?: string | null
  price?: number | string | null
  currency?: string | null
  next_payment_date?: string | null
  status?: string | null
  services?: { name: string } | { name: string }[] | null
}

type Client = {
  id: string
  brand_name: string
  contact_name: string
  email?: string | null
  phone?: string | null
  website_url?: string | null
  notes?: string | null
  cuit?: string | null
  razon_social?: string | null
  cond_iva_receptor?: number | null
  facturar?: boolean | null
  client_services?: ClientServiceRow[] | null
}

/** Supabase devuelve la relación anidada como objeto o como array. */
function nombreServicio(s: ClientServiceRow): string {
  const rel = Array.isArray(s.services) ? s.services[0] : s.services
  return rel?.name ?? 'Servicio'
}

function formatoPrecio(s: ClientServiceRow): string {
  if (s.price == null) return ''
  const n = Number(s.price)
  if (!Number.isFinite(n)) return ''
  return `${s.currency === 'USD' ? 'USD' : '$'} ${n.toLocaleString('es-AR')}`
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={client.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto *</label>
              <input
                type="text"
                name="contact_name"
                required
                defaultValue={client.contact_name}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca / Empresa *</label>
              <input
                type="text"
                name="brand_name"
                required
                defaultValue={client.brand_name}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={client.email ?? ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                name="phone"
                defaultValue={client.phone ?? ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
              <input
                type="text"
                name="website_url"
                defaultValue={client.website_url ?? ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">Facturación</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Se completa una vez y queda cargado: al emitir una factura se elige el cliente y estos
                datos van solos.
              </p>

              <label className="mt-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  name="facturar"
                  defaultChecked={client.facturar ?? false}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-700">
                  Facturar a este cliente
                  <span className="mt-0.5 block text-xs text-gray-500">
                    Sin marcar, el cliente no aparece al emitir. No a todos se les factura.
                  </span>
                </span>
              </label>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-cuit">
                    CUIT
                  </label>
                  <input
                    type="text"
                    id="edit-cuit"
                    name="cuit"
                    defaultValue={client.cuit ?? ''}
                    placeholder="20-12345678-9"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">Sin CUIT se factura a consumidor final.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-cond_iva_receptor">
                    Condición frente al IVA
                  </label>
                  <select
                    id="edit-cond_iva_receptor"
                    name="cond_iva_receptor"
                    defaultValue={client.cond_iva_receptor ?? 5}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {CONDICIONES_IVA_RECEPTOR.map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-razon_social">
                    Razón social <span className="font-normal text-gray-400">(si difiere de la marca)</span>
                  </label>
                  <input
                    type="text"
                    id="edit-razon_social"
                    name="razon_social"
                    defaultValue={client.razon_social ?? ''}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">Como figura en ARCA. Vacío usa el nombre de la marca.</p>
                </div>
              </div>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={client.notes ?? ''}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
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
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RowActions({
  client,
  onEdit,
  onDelete,
  deleting,
}: {
  client: Client
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  deleting: boolean
}) {
  return (
    <IconButtonGroup>
      <IconLink icon={Eye} label={`Ver ficha de ${client.brand_name}`} href={`/admin/clients/${client.id}`} />
      <IconButton icon={Pencil} label={`Editar ${client.brand_name}`} onClick={() => onEdit(client)} />
      <IconButton
        icon={Trash2}
        label={`Eliminar ${client.brand_name}`}
        tono="peligro"
        ocupado={deleting}
        onClick={() => onDelete(client)}
      />
    </IconButtonGroup>
  )
}

export function ClientsTable({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return initialClients

    return initialClients.filter((client) => {
      const delCliente = [
        client.brand_name,
        client.contact_name,
        client.email,
        client.phone,
        client.website_url,
        client.cuit,
      ]

      // Buscar también por servicio contratado, dominio y estado: encontrar
      // "el hosting de tal marca" o "quién tiene tal dominio" era lo que
      // obligaba a abrir ficha por ficha.
      const deSusServicios = (client.client_services ?? []).flatMap((s) => [
        nombreServicio(s),
        s.domain_name,
        s.status,
      ])

      return [...delCliente, ...deSusServicios]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    })
  }, [initialClients, query])

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
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative w-full sm:max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar marca, contacto, servicio, dominio, estado..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </label>
          <p className="text-xs sm:text-sm text-gray-500">
            {filteredClients.length} de {initialClients.length} clientes
          </p>
        </div>
      </div>

      <div className="hidden md:block">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="w-[17%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="w-[19%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="w-[19%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="w-[35%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicios</th>
              <th className="w-[10%] px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4 align-top">
                  <div className="text-sm font-semibold text-gray-900 break-words">{client.brand_name}</div>
                  {client.website_url && (
                    <a
                      href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline break-words"
                    >
                      <Globe size={11} className="shrink-0" />
                      {client.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="text-sm text-gray-900 break-words">{client.contact_name}</div>
                  {client.phone && <div className="mt-1 text-xs text-gray-500">{client.phone}</div>}
                  {client.cuit && <div className="mt-1 text-[11px] text-gray-400 font-mono">CUIT: {client.cuit}</div>}
                </td>
                <td className="px-6 py-4 align-top text-sm text-gray-600 break-words">{client.email || '—'}</td>
                <td className="px-6 py-4 align-top">
                  {(client.client_services ?? []).length === 0 ? (
                    <span className="text-sm text-gray-400">Sin servicios</span>
                  ) : (
                    <ul className="space-y-1.5">
                      {(client.client_services ?? [])
                        .slice()
                        .sort((a, b) => (a.next_payment_date ?? '9999').localeCompare(b.next_payment_date ?? '9999'))
                        .map((sv) => (
                          <li key={sv.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <EstadoBadge estado={sv.status} />
                            <span className="font-medium text-gray-800">{nombreServicio(sv)}</span>
                            {sv.domain_name && <span className="text-gray-400">· {sv.domain_name}</span>}
                            {sv.next_payment_date && (
                              <span className="text-gray-500">· vence {sv.next_payment_date}</span>
                            )}
                            {formatoPrecio(sv) && <span className="text-gray-500">· {formatoPrecio(sv)}</span>}
                          </li>
                        ))}
                    </ul>
                  )}
                </td>
                <td className="px-6 py-4 align-top">
                  <RowActions
                    client={client}
                    onEdit={setEditingClient}
                    onDelete={handleDelete}
                    deleting={deletingId === client.id && isPending}
                  />
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  {query ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-100">
        {filteredClients.map((client) => (
          <article key={client.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 break-words">{client.brand_name}</h3>
                <p className="text-sm text-gray-600 break-words">{client.contact_name}</p>
              </div>
              <RowActions
                client={client}
                onEdit={setEditingClient}
                onDelete={handleDelete}
                deleting={deletingId === client.id && isPending}
              />
            </div>

            {(client.client_services ?? []).length > 0 && (
              <ul className="space-y-1.5 rounded-lg bg-gray-50 p-3">
                {(client.client_services ?? [])
                  .slice()
                  .sort((a, b) => (a.next_payment_date ?? '9999').localeCompare(b.next_payment_date ?? '9999'))
                  .map((sv) => (
                    <li key={sv.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <EstadoBadge estado={sv.status} />
                      <span className="font-medium text-gray-800">{nombreServicio(sv)}</span>
                      {sv.next_payment_date && <span className="text-gray-500">· vence {sv.next_payment_date}</span>}
                      {formatoPrecio(sv) && <span className="text-gray-500">· {formatoPrecio(sv)}</span>}
                    </li>
                  ))}
              </ul>
            )}

            <div className="space-y-1.5 text-sm text-gray-600">
              {client.email && (
                <p className="flex items-center gap-2 break-words">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  {client.email}
                </p>
              )}
              {client.phone && (
                <p className="flex items-center gap-2 break-words">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  {client.phone}
                </p>
              )}
              {client.website_url && (
                <a
                  href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-blue-600 break-words"
                >
                  <Globe size={14} className="shrink-0" />
                  {client.website_url}
                </a>
              )}
              {client.cuit && <p className="text-xs text-gray-500 font-mono">CUIT: {client.cuit}</p>}
            </div>
          </article>
        ))}

        {filteredClients.length === 0 && (
          <div className="px-4 py-10 text-center text-gray-500 text-sm">
            {query ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados.'}
          </div>
        )}
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
