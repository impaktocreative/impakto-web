import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function IncomePage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      amount,
      currency,
      payment_date,
      client_services (
        domain_name,
        services ( name ),
        clients ( brand_name )
      )
    `)
    .order('payment_date', { ascending: false })

  const totalIncomeARS = payments?.filter(p => p.currency === 'ARS').reduce((acc: number, p: any) => acc + Number(p.amount), 0) ?? 0
  const totalIncomeUSD = payments?.filter(p => p.currency === 'USD').reduce((acc: number, p: any) => acc + Number(p.amount), 0) ?? 0

  // Group by year-month and currency
  const byMonthARS = payments?.filter(p => p.currency === 'ARS').reduce((acc: Record<string, number>, p: any) => {
    const key = p.payment_date.slice(0, 7) // "2026-04"
    acc[key] = (acc[key] ?? 0) + Number(p.amount)
    return acc
  }, {}) ?? {}
  const byMonthUSD = payments?.filter(p => p.currency === 'USD').reduce((acc: Record<string, number>, p: any) => {
    const key = p.payment_date.slice(0, 7) // "2026-04"
    acc[key] = (acc[key] ?? 0) + Number(p.amount)
    return acc
  }, {}) ?? {}

  const monthlyEntriesARS = Object.entries(byMonthARS).sort(([a], [b]) => b.localeCompare(a))
  const monthlyEntriesUSD = Object.entries(byMonthUSD).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Ingresos</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Acumulado (ARS)</h3>
          <p className="text-3xl font-bold text-gray-900">${totalIncomeARS.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Acumulado (USD)</h3>
          <p className="text-3xl font-bold text-gray-900">USD {totalIncomeUSD.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pagos Registrados</h3>
          <p className="text-3xl font-bold text-gray-900">{payments?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 transition-all hover:shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Mes Actual / Último mes</h3>
          <div className="flex flex-col gap-1.5">
            {monthlyEntriesARS[0] && (
              <p className="text-lg font-bold text-gray-900">
                ${monthlyEntriesARS[0][1].toLocaleString('es-AR')} <span className="text-xs text-gray-400 font-normal">({format(new Date(monthlyEntriesARS[0][0] + '-02'), "MMM yyyy", { locale: es })})</span>
              </p>
            )}
            {monthlyEntriesUSD[0] && (
              <p className="text-lg font-bold text-gray-900">
                USD {monthlyEntriesUSD[0][1].toLocaleString('es-AR')} <span className="text-xs text-gray-400 font-normal">({format(new Date(monthlyEntriesUSD[0][0] + '-02'), "MMM yyyy", { locale: es })})</span>
              </p>
            )}
            {!monthlyEntriesARS[0] && !monthlyEntriesUSD[0] && <p className="text-sm text-gray-500">-</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly breakdown */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Por Mes (ARS)</h3>
            </div>
            {monthlyEntriesARS.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {monthlyEntriesARS.map(([month, amount]) => {
                  const pct = totalIncomeARS > 0 ? (amount / totalIncomeARS) * 100 : 0
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
              <div className="px-6 py-10 text-center text-sm text-gray-500">Sin datos de ingresos en ARS.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Por Mes (USD)</h3>
            </div>
            {monthlyEntriesUSD.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {monthlyEntriesUSD.map(([month, amount]) => {
                  const pct = totalIncomeUSD > 0 ? (amount / totalIncomeUSD) * 100 : 0
                  return (
                    <div key={month} className="px-6 py-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {format(new Date(month + '-02'), "MMMM yyyy", { locale: es })}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          USD {amount.toLocaleString('es-AR')}
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
              <div className="px-6 py-10 text-center text-sm text-gray-500">Sin datos de ingresos en USD.</div>
            )}
          </div>
        </div>

        {/* Payment history */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Historial de Pagos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments?.map((payment: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
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
                        {payment.currency === 'USD' ? 'USD' : '$'} {Number(payment.amount).toLocaleString('es-AR')}
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
