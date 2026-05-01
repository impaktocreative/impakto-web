import { createClient } from '@/utils/supabase/server'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { TestEmailForm } from './TestEmailForm'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get upcoming payments
  const { data: upcomingServices, error } = await supabase
    .from('client_services')
    .select(`
      id,
      domain_name,
      price_ars,
      next_payment_date,
      status,
      services ( name ),
      clients ( contact_name, brand_name )
    `)
    .eq('status', 'activo')
    .order('next_payment_date', { ascending: true })
    .limit(10)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Próximos Cobros
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Servicios activos ordenados por fecha de vencimiento.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Marca</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingServices?.map((item: any) => {
                const daysLeft = differenceInDays(new Date(item.next_payment_date), new Date())
                let badgeClass = "bg-green-100 text-green-800"
                if (daysLeft <= 0) badgeClass = "bg-red-100 text-red-800"
                else if (daysLeft <= 10) badgeClass = "bg-yellow-100 text-yellow-800"

                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.clients?.brand_name}</div>
                      <div className="text-sm text-gray-500">{item.clients?.contact_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.services?.name}</div>
                      <div className="text-sm text-gray-500">{item.domain_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 mb-1">
                        {format(new Date(item.next_payment_date), "dd 'de' MMMM, yyyy", { locale: es })}
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                        {daysLeft < 0 ? `Vencido hace ${Math.abs(daysLeft)} días` : daysLeft === 0 ? 'Vence hoy' : `Faltan ${daysLeft} días`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${Number(item.price_ars).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold">Registrar Pago</button>
                    </td>
                  </tr>
                )
              })}
              {(!upcomingServices || upcomingServices.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No hay cobros próximos registrados.
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
