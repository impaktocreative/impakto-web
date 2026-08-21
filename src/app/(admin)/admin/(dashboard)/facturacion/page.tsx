import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { NuevaFacturaForm, type ClienteOpcion, type EmisorOpcion } from './NuevaFacturaForm'
import { formatearCuit } from '@/lib/cuit'
import { faltantesParaFacturar, FALTANTES } from '@/lib/arca-receptor'
import { fechaLocal } from '@/lib/fecha'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const metadata = { title: 'Facturación' }

type ComprobanteFila = {
  id: string
  numero: number
  pto_vta: number
  cbte_tipo: number
  estado: string
  entorno: string
  cae: string | null
  importe_total: number | string
  receptor_nombre: string | null
  created_at: string
  arca_emisores: { razon_social: string } | { razon_social: string }[] | null
}

function unico<T>(v: T | T[] | null): T | null {
  if (!v) return null
  return Array.isArray(v) ? v[0] ?? null : v
}

const ESTADOS: Record<string, string> = {
  autorizado: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pendiente: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  rechazado: 'bg-red-50 text-red-700 ring-red-600/20',
  anulado: 'bg-gray-100 text-gray-600 ring-gray-500/20',
}

export default async function FacturacionPage() {
  const supabase = await createClient()

  const [{ data: emisores }, { data: clientes }, { data: comprobantes }] = await Promise.all([
    supabase
      .from('arca_emisores')
      .select('id, clave, razon_social, cuit, pto_vta, entorno')
      .gt('cuit', 0)
      .eq('activo', true)
      .order('clave'),
    supabase
      .from('clients')
      .select('id, brand_name, razon_social, cuit, cond_iva_receptor, facturar')
      .order('brand_name'),
    supabase
      .from('arca_comprobantes')
      .select(
        'id, numero, pto_vta, cbte_tipo, estado, entorno, cae, importe_total, receptor_nombre, created_at, arca_emisores ( razon_social )',
      )
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const filas = (comprobantes ?? []) as unknown as ComprobanteFila[]

  // Solo entran a la lista los clientes con todo lo que ARCA pide. Uno a medio
  // cargar fallaría recién al pedir el CAE, cuando ya se consumió un número.
  const todos = (clientes ?? []) as (ClienteOpcion & { facturar: boolean | null })[]
  const listos = todos.filter(c => faltantesParaFacturar(c).length === 0)
  const incompletos = todos
    .filter(c => c.facturar && faltantesParaFacturar(c).length > 0)
    .map(c => ({
      id: c.id,
      nombre: c.razon_social ?? c.brand_name,
      falta: faltantesParaFacturar(c).map(f => FALTANTES[f]).join(', '),
    }))

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Facturación</h1>
      <p className="mt-1 mb-8 text-sm text-gray-500">
        Emisión de comprobantes electrónicos ante ARCA.
      </p>

      <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h2 className="mb-6 text-base font-semibold text-gray-900">Nueva factura</h2>
        <NuevaFacturaForm
          emisores={(emisores ?? []) as EmisorOpcion[]}
          clientes={listos}
        />

        {incompletos.length > 0 && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">
              {incompletos.length === 1
                ? 'Un cliente marcado para facturar no aparece en la lista'
                : `${incompletos.length} clientes marcados para facturar no aparecen en la lista`}
            </p>
            <ul className="mt-1.5 flex flex-col gap-0.5 text-xs">
              {incompletos.map(c => (
                <li key={c.id}>
                  <Link href={`/admin/clients/${c.id}`} className="font-medium underline">
                    {c.nombre}
                  </Link>{' '}
                  — {c.falta}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">Comprobantes emitidos</h2>
        </div>

        {filas.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">
            Todavía no se emitió ningún comprobante.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filas.map(c => {
              const emisor = unico(c.arca_emisores)
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/facturacion/${c.id}`}
                    className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {c.cbte_tipo === 11 ? 'Factura C' : `Comprobante ${c.cbte_tipo}`}{' '}
                        <span className="font-mono text-gray-500">
                          {String(c.pto_vta).padStart(5, '0')}-{String(c.numero).padStart(8, '0')}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 break-words">
                        {c.receptor_nombre ?? 'Sin receptor'} · {emisor?.razon_social ?? ''} ·{' '}
                        {format(fechaLocal(c.created_at), "dd 'de' MMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {c.entorno === 'homologacion' && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
                          Prueba
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                          ESTADOS[c.estado] ?? ESTADOS.anulado
                        }`}
                      >
                        {c.estado}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        $
                        {Number(c.importe_total).toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs text-gray-400">
        Los datos fiscales de cada emisor se cargan en{' '}
        <Link href="/admin/settings" className="underline">
          Configuración
        </Link>
        . Un cliente aparece en la lista solo si está marcado para facturar en su ficha.
        {emisores?.some(e => e.cuit) && (
          <> CUIT en uso: {emisores.map(e => formatearCuit(e.cuit)).join(' · ')}.</>
        )}
      </p>
    </div>
  )
}
