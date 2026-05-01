import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const { data: services } = await supabase
    .from('client_services')
    .select(`
      id,
      domain_name,
      price_ars,
      next_payment_date,
      last_payment_date,
      status,
      notes,
      services ( name )
    `)
    .eq('client_id', id)
    .order('next_payment_date', { ascending: true })

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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
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

        {/* Services */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Servicios Contratados</h2>
              <span className="text-sm text-gray-500">{services?.length ?? 0} servicios</span>
            </div>

            {services && services.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {services.map((svc: any) => {
                  const daysLeft = svc.next_payment_date
                    ? Math.ceil((new Date(svc.next_payment_date).getTime() - Date.now()) / 86400000)
                    : null

                  let badgeClass = 'bg-green-100 text-green-700'
                  if (daysLeft === null) badgeClass = 'bg-gray-100 text-gray-500'
                  else if (daysLeft <= 0) badgeClass = 'bg-red-100 text-red-700'
                  else if (daysLeft <= 10) badgeClass = 'bg-yellow-100 text-yellow-700'

                  return (
                    <div key={svc.id} className="px-6 py-4 flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{svc.services?.name}</p>
                        {svc.domain_name && (
                          <p className="text-xs text-gray-500 mt-0.5">{svc.domain_name}</p>
                        )}
                        {svc.next_payment_date && (
                          <p className="text-xs text-gray-400 mt-1">
                            Vence: {format(new Date(svc.next_payment_date), "dd 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          ${Number(svc.price_ars).toLocaleString('es-AR')}
                        </span>
                        {daysLeft !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                            {daysLeft <= 0 ? `Vencido` : `${daysLeft}d`}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-gray-500 text-sm">
                Este cliente no tiene servicios contratados aún.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
