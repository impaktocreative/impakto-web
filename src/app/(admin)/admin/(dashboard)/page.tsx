import { differenceInDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/utils/supabase/server'
import { DashboardPayButton } from './DashboardPayButton'
import { TestEmailForm } from './TestEmailForm'

type RecentPayment = {
  amount: number | string
  payment_date: string
}

type UpcomingService = {
  id: string
  domain_name: string | null
  duration_months: number
  price: number | string
  currency: string
  next_payment_date: string | null
  services: { name: string } | null
  clients: { id: string; contact_name: string; brand_name: string } | null
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ data: upcomingServices }, { count: totalClients }, { count: activeServices }, { data: recentPayments }] = await Promise.all([
    supabase
      .from('client_services')
      .select(`
        id, domain_name, duration_months, price, currency, last_payment_date, next_payment_date, status, client_id,
        services ( name ),
        clients ( id, contact_name, brand_name )
      `)
      .eq('status', 'activo')
      .order('next_payment_date', { ascending: true })
      .limit(10),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('client_services').select('id', { count: 'exact', head: true }).eq('status', 'activo'),
    supabase.from('payments').select('amount, payment_date').order('payment_date', { ascending: false }).limit(30),
  ])

  const paymentRows = (recentPayments ?? []) as RecentPayment[]
  const items = (upcomingServices ?? []) as UpcomingService[]
  const totalIncome = paymentRows.reduce((sum, payment) => sum + Number(payment.amount), 0)

  const expiringSoon = items.filter((service) => {
    if (!service.next_payment_date) return false
    const days = differenceInDays(new Date(service.next_payment_date), new Date())
    return days <= 10
  }).length

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Vista rápida de clientes, vencimientos y pagos para tomar acción en segundos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Clientes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalClients ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Servicios Activos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activeServices ?? 0}</p>
        </div>
        <div
          className={`rounded-2xl shadow-sm ring-1 p-6 transition-all hover:shadow-md ${
            expiringSoon > 0 ? 'bg-orange-50 ring-orange-500/20' : 'bg-white ring-gray-900/5'
          }`}
        >
          <p className={`text-sm font-medium ${expiringSoon > 0 ? 'text-orange-800' : 'text-gray-500'}`}>Por Vencer (10 días)</p>
          <p className={`text-3xl font-bold mt-2 ${expiringSoon > 0 ? 'text-orange-900' : 'text-gray-900'}`}>{expiringSoon}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Ingresos Registrados</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${totalIncome.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Próximos Cobros</h3>
          <p className="mt-1 text-sm text-gray-500">Servicios activos ordenados por fecha de vencimiento.</p>
        </div>

        <div className="hidden md:block">
          <table className="w-full table-fixed divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente / Marca</th>
                <th className="w-[28%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicio</th>
                <th className="w-[21%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                <th className="w-[14%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="w-[12%] px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const daysLeft = item.next_payment_date ? differenceInDays(new Date(item.next_payment_date), new Date()) : null
                let badgeClass = 'bg-green-50 text-green-700 ring-green-600/20'

                if (daysLeft === null) badgeClass = 'bg-gray-50 text-gray-600 ring-gray-500/10'
                else if (daysLeft <= 0) badgeClass = 'bg-red-50 text-red-700 ring-red-600/10'
                else if (daysLeft <= 10) badgeClass = 'bg-orange-50 text-orange-700 ring-orange-600/20'

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-semibold text-gray-900 break-words">{item.clients?.brand_name}</div>
                      <div className="text-sm text-gray-500 break-words">{item.clients?.contact_name}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-900 break-words">{item.services?.name}</div>
                      {item.domain_name && <div className="text-sm text-gray-500 break-all">{item.domain_name}</div>}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {item.next_payment_date ? (
                        <>
                          <div className="text-sm font-medium text-gray-900 mb-1.5">
                            {format(new Date(item.next_payment_date), "dd 'de' MMMM, yyyy", { locale: es })}
                          </div>
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badgeClass}`}>
                            {daysLeft! < 0 ? `Vencido hace ${Math.abs(daysLeft!)} días` : daysLeft === 0 ? 'Vence hoy' : `Faltan ${daysLeft} días`}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin fecha</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-sm font-semibold text-gray-900">
                      {item.currency === 'USD' ? 'USD' : '$'} {Number(item.price).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex justify-end">
                        <DashboardPayButton
                          item={{
                            id: item.id,
                            price: item.price,
                            currency: item.currency,
                            duration_months: item.duration_months,
                            services: item.services,
                            clients: item.clients,
                            domain_name: item.domain_name,
                            client_id: item.clients?.id ?? null,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}

              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No hay cobros próximos. Asigná servicios a tus clientes desde su ficha.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {items.map((item) => {
            const daysLeft = item.next_payment_date ? differenceInDays(new Date(item.next_payment_date), new Date()) : null
            let badgeClass = 'bg-green-50 text-green-700 ring-green-600/20'

            if (daysLeft === null) badgeClass = 'bg-gray-50 text-gray-600 ring-gray-500/10'
            else if (daysLeft <= 0) badgeClass = 'bg-red-50 text-red-700 ring-red-600/10'
            else if (daysLeft <= 10) badgeClass = 'bg-orange-50 text-orange-700 ring-orange-600/20'

            return (
              <article key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 break-words">{item.clients?.brand_name}</h4>
                    <p className="text-sm text-gray-500 break-words">{item.services?.name}</p>
                    {item.domain_name && <p className="text-xs text-gray-400 break-all">{item.domain_name}</p>}
                  </div>
                  <DashboardPayButton
                    item={{
                      id: item.id,
                      price: item.price,
                      currency: item.currency,
                      duration_months: item.duration_months,
                      services: item.services,
                      clients: item.clients,
                      domain_name: item.domain_name,
                      client_id: item.clients?.id ?? null,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-gray-900">
                    {item.currency === 'USD' ? 'USD' : '$'} {Number(item.price).toLocaleString('es-AR')}
                  </span>
                  {item.next_payment_date ? (
                    <span className="text-gray-600">{format(new Date(item.next_payment_date), 'dd/MM/yyyy', { locale: es })}</span>
                  ) : (
                    <span className="text-gray-400 italic">Sin fecha</span>
                  )}
                </div>

                {daysLeft !== null && (
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badgeClass}`}>
                    {daysLeft! < 0 ? `Vencido hace ${Math.abs(daysLeft!)} días` : daysLeft === 0 ? 'Vence hoy' : `Faltan ${daysLeft} días`}
                  </span>
                )}
              </article>
            )
          })}

          {items.length === 0 && <div className="px-6 py-10 text-center text-gray-500 text-sm">No hay cobros próximos.</div>}
        </div>
      </div>

      <TestEmailForm />
    </div>
  )
}
