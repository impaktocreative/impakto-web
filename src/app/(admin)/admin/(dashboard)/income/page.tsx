import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function IncomePage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      payment_date,
      client_services (
        domain_name,
        services ( name ),
        clients ( brand_name )
      )
    `)
    .order('payment_date', { ascending: false })

  const totalIncome = payments?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) ?? 0

  // Group by year-month
  const byMonth = payments?.reduce((acc: Record<string, number>, p: any) => {
    const key = p.payment_date.slice(0, 7) // "2026-04"
    acc[key] = (acc[key] ?? 0) + Number(p.amount)
    return acc
  }, {}) ?? {}

  const monthlyEntries = Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ingresos</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Acumulado</h3>
          <p className="text-3xl font-bold text-gray-900">${totalIncome.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pagos Registrados</h3>
          <p className="text-3xl font-bold text-gray-900">{payments?.length ?? 0}</p>
        </div>
        {monthlyEntries[0] && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Mes Actual / Último mes</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${monthlyEntries[0][1].toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {format(new Date(monthlyEntries[0][0] + '-02'), "MMMM yyyy", { locale: es })}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Por Mes</h3>
            </div>
            {monthlyEntries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {monthlyEntries.map(([month, amount]) => {
                  const pct = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
                  return (
                    <div key={month} className="px-6 py-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {format(new Date(month + '-02'), "MMMM yyyy", { locale: es })}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${amount.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-black h-1.5 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-6 py-10 text-center text-sm text-gray-500">Sin datos de ingresos.</div>
            )}
          </div>
        </div>

        {/* Payment history */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Historial de Pagos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments?.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(payment.payment_date), "dd 'de' MMM, yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.client_services?.clients?.brand_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.client_services?.services?.name}</div>
                        {payment.client_services?.domain_name && (
                          <div className="text-sm text-gray-500">{payment.client_services.domain_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${Number(payment.amount).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                  {(!payments || payments.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No hay pagos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
