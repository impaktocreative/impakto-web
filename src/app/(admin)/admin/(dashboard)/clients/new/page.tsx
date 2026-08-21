import { createClientAction } from './actions'
import Link from 'next/link'
import { CONDICIONES_IVA_RECEPTOR } from '@/lib/arca-receptor'

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
        <Link href="/admin/clients" className="text-gray-500 hover:text-gray-900 font-medium">
          Volver
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form action={createClientAction} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="brand_name">
                Nombre de la Marca *
              </label>
              <input
                type="text"
                id="brand_name"
                name="brand_name"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Impakto Creative"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contact_name">
                Nombre de Contacto *
              </label>
              <input
                type="text"
                id="contact_name"
                name="contact_name"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                Teléfono
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+54 9 11 1234-5678"
              />
            </div>
            <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">Facturación</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Se completa una vez y queda cargado: al emitir una factura se elige el cliente y estos
                datos van solos.
              </p>

              <label className="mt-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  name="facturar"
                  
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
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cuit">
                    CUIT
                  </label>
                  <input
                    type="text"
                    id="cuit"
                    name="cuit"
                    
                    placeholder="20-12345678-9"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">Sin CUIT se factura a consumidor final.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cond_iva_receptor">
                    Condición frente al IVA
                  </label>
                  <select
                    id="cond_iva_receptor"
                    name="cond_iva_receptor"
                    defaultValue={5}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {CONDICIONES_IVA_RECEPTOR.map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="razon_social">
                    Razón social <span className="font-normal text-gray-400">(si difiere de la marca)</span>
                  </label>
                  <input
                    type="text"
                    id="razon_social"
                    name="razon_social"
                    
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">Como figura en ARCA. Vacío usa el nombre de la marca.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="website_url">
                URL del Sitio Web
              </label>
              <input
                type="url"
                id="website_url"
                name="website_url"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.ejemplo.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                Observaciones Internas
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Información adicional sobre el cliente..."
              />
            </div>
          </div>

          {resolvedParams?.error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {resolvedParams.error}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
