import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, FileText } from 'lucide-react'
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
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase
      .from('client_services')
      .select(`id, domain_name, price, currency, next_payment_date, last_payment_date, status, duration_months, notes, services ( name )`)
      .eq('client_id', id)
      .order('next_payment_date', { ascending: true }),
    supabase.from('services').select('id, name, duration_months, price, currency').order('name'),
  ])

  if (!client) notFound()

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
              {client.cuit && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-gray-400 flex-shrink-0 text-xs font-bold w-[15px] text-center">#</span>
                  <span className="font-mono text-sm">CUIT: {client.cuit}</span>
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
