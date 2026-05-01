import { createClient } from '@/utils/supabase/server'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { TestEmailForm } from './TestEmailForm'
import { DashboardPayButton } from './DashboardPayButton'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { data: upcomingServices },
    { count: totalClients },
    { count: activeServices },
    { data: recentPayments },
  ] = await Promise.all([
    supabase
      .from('client_services')
      .select(`
        id, domain_name, price_ars, next_payment_date, status, duration_months,
        services ( name ),
        clients ( id, contact_name, brand_name )
      `)
      .eq('status', 'activo')
      .order('next_payment_date', { ascending: true })
      .limit(10),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('client_services').select('*', { count: 'exact', head: true }).eq('status', 'activo'),
    supabase
      .from('payments')
      .select('amount, payment_date')
      .order('payment_date', { ascending: false })
      .limit(30),
  ])

  const totalIncome = recentPayments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0

  const expiringSoon = upcomingServices?.filter((s: any) => {
    if (!s.next_payment_date) return false
    const days = differenceInDays(new Date(s.next_payment_date), new Date())
    return days <= 10
  }).length ?? 0

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Clientes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalClients ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Servicios Activos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{activeServices ?? 0}</p>
        </div>
        <div className={`rounded-lg shadow-sm border p-5 ${expiringSoon > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <p className="text-sm font-medium text-gray-500">Por Vencer (10 días)</p>
          <p className={`text-3xl font-bold mt-1 ${expiringSoon > 0 ? 'text-yellow-700' : 'text-gray-900'}`}>{expiringSoon}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Ingresos Registrados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${totalIncome.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Upcoming payments table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Próximos Cobros</h3>
          <p className="mt-1 text-sm text-gray-500">Servicios activos ordenados por fecha de vencimiento.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingServices?.map((item: any) => {
                const daysLeft = item.next_payment_date
                  ? differenceInDays(new Date(item.next_payment_date), new Date())
                  : null
                let badgeClass = 'bg-green-100 text-green-800'
                if (daysLeft === null) badgeClass = 'bg-gray-100 text-gray-500'
                else if (daysLeft <= 0) badgeClass = 'bg-red-100 text-red-800'
                else if (daysLeft <= 10) badgeClass = 'bg-yellow-100 text-yellow-800'

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.clients?.brand_name}</div>
                      <div className="text-sm text-gray-500">{item.clients?.contact_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.services?.name}</div>
                      {item.domain_name && <div className="text-sm text-gray-500">{item.domain_name}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.next_payment_date ? (
                        <>
                          <div className="text-sm text-gray-900 mb-1">
                            {format(new Date(item.next_payment_date), "dd 'de' MMMM, yyyy", { locale: es })}
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                            {daysLeft! < 0 ? `Vencido hace ${Math.abs(daysLeft!)} días` : daysLeft === 0 ? 'Vence hoy' : `Faltan ${daysLeft} días`}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin fecha</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${Number(item.price_ars).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DashboardPayButton item={{
                        id: item.id,
                        price_ars: item.price_ars,
                        duration_months: item.duration_months,
                        services: item.services,
                        clients: item.clients,
                        domain_name: item.domain_name,
                        client_id: item.clients?.id ?? null,
                      }} />
                    </td>
                  </tr>
                )
              })}
              {(!upcomingServices || upcomingServices.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No hay cobros próximos. Asigná servicios a tus clientes desde su ficha.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TestEmailForm />
    </div>
  )
}
