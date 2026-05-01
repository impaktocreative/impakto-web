import { createClient } from '@/utils/supabase/server'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

type PaymentRow = {
  amount: number | string
  currency: string
  payment_date: string
  client_services:
    | {
        domain_name: string | null
        services: { name: string } | null
        clients: { brand_name: string } | null
      }
    | null
}

type RawPaymentRow = {
  amount: number | string
  currency: string
  payment_date: string
  client_services:
    | Array<{
        domain_name: string | null
        services: Array<{ name: string }>
        clients: Array<{ brand_name: string }>
      }>
    | null
}

type ExpectedServiceRow = {
  id: string
  next_payment_date: string | null
  price: number | string
  currency: string
  domain_name: string | null
  clients: { brand_name: string; contact_name: string } | null
  services: { name: string } | null
}

type RawExpectedServiceRow = {
  id: string
  next_payment_date: string | null
  price: number | string
  currency: string
  domain_name: string | null
  clients: Array<{ brand_name: string; contact_name: string }>
  services: Array<{ name: string }>
}

export default async function IncomePage() {
  const supabase = await createClient()
  const now = new Date()
  const monthKey = format(now, 'yyyy-MM')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const [{ data: payments }, { data: expectedServices }] = await Promise.all([
    supabase
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
      .order('payment_date', { ascending: false }),
    supabase
      .from('client_services')
      .select(`
        id,
        next_payment_date,
        price,
        currency,
        domain_name,
        clients ( brand_name, contact_name ),
        services ( name )
      `)
      .eq('status', 'activo')
      .gte('next_payment_date', monthStart)
      .lte('next_payment_date', monthEnd)
      .order('next_payment_date', { ascending: true }),
  ])

  const rawPaymentRows = (payments ?? []) as unknown as RawPaymentRow[]
  const paymentRows: PaymentRow[] = rawPaymentRows.map((payment) => {
    const service = payment.client_services?.[0] ?? null

    return {
      amount: payment.amount,
      currency: payment.currency,
      payment_date: payment.payment_date,
      client_services: service
        ? {
            domain_name: service.domain_name,
            services: service.services?.[0] ?? null,
            clients: service.clients?.[0] ?? null,
          }
        : null,
      }
  })

  const rawExpectedRows = (expectedServices ?? []) as unknown as RawExpectedServiceRow[]
  const expectedRows: ExpectedServiceRow[] = rawExpectedRows.map((service) => ({
    id: service.id,
    next_payment_date: service.next_payment_date,
    price: service.price,
    currency: service.currency,
    domain_name: service.domain_name,
    clients: service.clients?.[0] ?? null,
    services: service.services?.[0] ?? null,
  }))

  const totalIncomeARS = paymentRows.filter((payment) => payment.currency === 'ARS').reduce((acc, payment) => acc + Number(payment.amount), 0)
  const totalIncomeUSD = paymentRows.filter((payment) => payment.currency === 'USD').reduce((acc, payment) => acc + Number(payment.amount), 0)
  const expectedIncomeARS = expectedRows.filter((service) => service.currency === 'ARS').reduce((acc, service) => acc + Number(service.price), 0)
  const expectedIncomeUSD = expectedRows.filter((service) => service.currency === 'USD').reduce((acc, service) => acc + Number(service.price), 0)
  const collectedThisMonthARS = paymentRows
    .filter((payment) => payment.currency === 'ARS' && payment.payment_date.startsWith(monthKey))
    .reduce((acc, payment) => acc + Number(payment.amount), 0)
  const collectedThisMonthUSD = paymentRows
    .filter((payment) => payment.currency === 'USD' && payment.payment_date.startsWith(monthKey))
    .reduce((acc, payment) => acc + Number(payment.amount), 0)

  // Group by year-month and currency
  const byMonthARS = paymentRows.filter((payment) => payment.currency === 'ARS').reduce((acc: Record<string, number>, payment) => {
    const key = payment.payment_date.slice(0, 7)
    acc[key] = (acc[key] ?? 0) + Number(payment.amount)
    return acc
  }, {})
  const byMonthUSD = paymentRows.filter((payment) => payment.currency === 'USD').reduce((acc: Record<string, number>, payment) => {
    const key = payment.payment_date.slice(0, 7)
    acc[key] = (acc[key] ?? 0) + Number(payment.amount)
    return acc
  }, {})

  const monthlyEntriesARS = Object.entries(byMonthARS).sort(([a], [b]) => b.localeCompare(a))
  const monthlyEntriesUSD = Object.entries(byMonthUSD).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ingresos</h1>
        <p className="mt-1 text-sm text-gray-500">Seguimiento de facturación y pagos registrados por cliente y moneda.</p>
      </div>

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
          <p className="text-3xl font-bold text-gray-900">{paymentRows.length}</p>
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

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Ingresos Estimados del Mes</h2>
            <p className="mt-1 text-sm text-gray-500">
              Proyección de cobros del mes actual asumiendo que todos los clientes pagan en fecha.
            </p>
          </div>
          <p className="text-xs text-gray-400">{format(now, "MMMM yyyy", { locale: es })}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 p-6 border-b border-gray-100">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Estimado ARS</p>
            <p className="text-2xl font-bold text-gray-900">${expectedIncomeARS.toLocaleString('es-AR')}</p>
            <p className="text-sm text-gray-500">
              Cobrado este mes: <span className="font-semibold text-gray-800">${collectedThisMonthARS.toLocaleString('es-AR')}</span>
            </p>
          </div>
          <div className="space-y-2 mt-5 md:mt-0">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Estimado USD</p>
            <p className="text-2xl font-bold text-gray-900">USD {expectedIncomeUSD.toLocaleString('es-AR')}</p>
            <p className="text-sm text-gray-500">
              Cobrado este mes: <span className="font-semibold text-gray-800">USD {collectedThisMonthUSD.toLocaleString('es-AR')}</span>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 text-sm text-gray-600 bg-gray-50/60 border-b border-gray-100">
          {expectedRows.length > 0
            ? `${expectedRows.length} cobro(s) esperado(s) en el mes.`
            : 'No hay vencimientos activos programados para este mes.'}
        </div>

        {expectedRows.length > 0 && (
          <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
            {expectedRows.map((service) => (
              <div key={service.id} className="px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900 break-words">{service.clients?.brand_name ?? 'Cliente sin marca'}</p>
                  <p className="text-xs text-gray-500 break-words">
                    {service.services?.name ?? 'Servicio'}
                    {service.domain_name ? ` - ${service.domain_name}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {service.currency === 'USD' ? 'USD' : '$'} {Number(service.price).toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {service.next_payment_date
                      ? format(new Date(service.next_payment_date), "dd 'de' MMM", { locale: es })
                      : 'Sin fecha'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <div className="hidden md:block">
              <table className="w-full table-fixed divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="w-[24%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="w-[36%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentRows.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top text-sm text-gray-900">
                        {format(new Date(payment.payment_date), "dd 'de' MMM, yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm font-medium text-gray-900 break-words">{payment.client_services?.clients?.brand_name}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-gray-900 break-words">{payment.client_services?.services?.name}</div>
                        {payment.client_services?.domain_name && (
                          <div className="text-sm text-gray-500 break-all">{payment.client_services.domain_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-sm font-semibold text-green-600">
                        {payment.currency === 'USD' ? 'USD' : '$'} {Number(payment.amount).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                  {paymentRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No hay pagos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {paymentRows.map((payment, index) => (
                <article key={index} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-600">
                      {format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: es })}
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      {payment.currency === 'USD' ? 'USD' : '$'} {Number(payment.amount).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 break-words">{payment.client_services?.clients?.brand_name}</p>
                  <p className="text-sm text-gray-600 break-words">{payment.client_services?.services?.name}</p>
                  {payment.client_services?.domain_name && (
                    <p className="text-xs text-gray-500 break-all">{payment.client_services.domain_name}</p>
                  )}
                </article>
              ))}

              {paymentRows.length === 0 && (
                <div className="px-6 py-10 text-center text-gray-500 text-sm">No hay pagos registrados.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
