import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, FileText, Receipt } from 'lucide-react'
import { formatearCuit } from '@/lib/cuit'
import { etiquetaCondicionIva, faltantesParaFacturar, FALTANTES } from '@/lib/arca-receptor'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ClientServicesPanel } from './ClientServicesPanel'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: services }, { data: availableServices }] = await Promise.all([
    supabase.from('clients').select('id, brand_name, contact_name, email, phone, cuit, razon_social, cond_iva_receptor, facturar, website_url, notes, created_at').eq('id', id).single(),
    supabase
      .from('client_services')
      .select(`id, domain_name, price, currency, next_payment_date, last_payment_date, status, duration_months, notes, receiver, deduct_bank_fee, services ( name )`)
      .eq('client_id', id)
      .order('next_payment_date', { ascending: true }),
    supabase.from('services').select('id, name, duration_months, price, currency').order('name'),
  ])

  if (!client) notFound()

  // Lo que le falta para aparecer en la lista de facturación. Se calcula acá
  // para que el administrador lo vea en la ficha y no al momento de emitir.
  const faltaParaFacturar = faltantesParaFacturar(client)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a Clientes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                {client.brand_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{client.brand_name}</h1>
                <p className="text-sm text-gray-500">{client.contact_name}</p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {client.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={15} className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:text-black transition-colors truncate">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={15} className="text-gray-400 flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.facturar && (
                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                  <Receipt size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium text-gray-800">Se factura</p>
                    {client.razon_social && (
                      <p className="text-xs text-gray-500 break-words">{client.razon_social}</p>
                    )}
                    <p className="font-mono text-xs text-gray-500 mt-0.5">
                      {client.cuit ? formatearCuit(client.cuit) : 'Sin CUIT'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {etiquetaCondicionIva(client.cond_iva_receptor)}
                    </p>

                    {faltaParaFacturar.length > 0 ? (
                      <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800 ring-1 ring-inset ring-amber-600/20">
                        No aparece al emitir: {faltaParaFacturar.map(f => FALTANTES[f]).join(', ').toLowerCase()}.
                      </p>
                    ) : (
                      <Link
                        href="/admin/facturacion"
                        className="mt-2 inline-block text-xs font-medium text-gray-700 underline"
                      >
                        Emitir una factura
                      </Link>
                    )}
                  </div>
                </div>
              )}
              {!client.facturar && client.cuit && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Receipt size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="font-mono text-sm">{formatearCuit(client.cuit)}</span>
                </div>
              )}
              {client.website_url && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Globe size={15} className="text-gray-400 flex-shrink-0" />
                  <a
                    href={client.website_url.startsWith('http') ? client.website_url : `https://${client.website_url}`}
                    target="_blank" rel="noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {client.website_url}
                  </a>
                </div>
              )}
              {client.notes && (
                <div className="flex items-start gap-3 text-sm text-gray-600 pt-2 border-t border-gray-100">
                  <FileText size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-500">{client.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Cliente desde {format(new Date(client.created_at), "MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Services Panel */}
        <div className="lg:col-span-2">
          <ClientServicesPanel
            clientId={id}
            initialServices={services ?? []}
            availableServices={availableServices ?? []}
          />
        </div>
      </div>
    </div>
  )
}
