'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'
import { saveEmisorAction } from './actions'
import { cuitSinCargar, cuitValido, formatearCuit } from '@/lib/cuit'
import { DiagnosticoArca } from './DiagnosticoArca'

export type Emisor = {
  id: string
  clave: 'sergio' | 'rodrigo'
  cuit: number
  razon_social: string
  condicion_fiscal: string
  pto_vta: number
  domicilio: string | null
  pie_comprobante: string | null
  ingresos_brutos: string | null
  inicio_actividades: string | null
  entorno: string
}

const CONDICIONES = [
  { value: 'monotributo', label: 'Monotributo' },
  { value: 'responsable_inscripto', label: 'Responsable inscripto' },
  { value: 'exento', label: 'Exento' },
]

function FormularioEmisor({ emisor }: { emisor: Emisor }) {
  const [state, formAction, isPending] = useActionState(saveEmisorAction, null)
  const [cuit, setCuit] = useState(cuitSinCargar(emisor.cuit) ? '' : formatearCuit(emisor.cuit))

  // Solo se avisa cuando ya hay algo escrito: un campo vacío todavía no es un
  // error, es un campo vacío.
  const cuitEscrito = cuit.replace(/\D/g, '').length > 0
  const cuitMal = cuitEscrito && !cuitValido(cuit)

  return (
    <form action={formAction} className="px-6 py-5 flex flex-col gap-4 border-t border-gray-100">
      <input type="hidden" name="id" value={emisor.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón social</label>
          <input
            type="text"
            name="razon_social"
            required
            defaultValue={emisor.razon_social}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-400 mt-1">Como figura en ARCA, no el nombre de fantasía.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
          <input
            type="text"
            name="cuit"
            required
            inputMode="numeric"
            placeholder="20-12345678-9"
            value={cuit}
            onChange={e => setCuit(e.target.value)}
            aria-invalid={cuitMal}
            className={`w-full border rounded-md px-3 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 ${
              cuitMal
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-black'
            }`}
          />
          <p className={`text-xs mt-1 ${cuitMal ? 'text-red-600' : 'text-gray-400'}`}>
            {cuitMal
              ? 'Los 11 dígitos no cierran con el verificador. Revisá el número.'
              : 'Con o sin guiones, da igual.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condición fiscal</label>
          <select
            name="condicion_fiscal"
            defaultValue={emisor.condicion_fiscal}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            {CONDICIONES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Punto de venta</label>
          <input
            type="number"
            name="pto_vta"
            required
            min={1}
            defaultValue={emisor.pto_vta}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-400 mt-1">
            Tiene que ser un punto de venta habilitado para <strong>web service</strong>. El que se usa
            desde Comprobantes en Línea no sirve: ARCA lleva la numeración por separado.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio comercial</label>
        <input
          type="text"
          name="domicilio"
          defaultValue={emisor.domicilio ?? ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos Brutos</label>
          <input
            type="text"
            name="ingresos_brutos"
            defaultValue={emisor.ingresos_brutos ?? ''}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-400 mt-1">Vacío si no corresponde.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inicio de actividades</label>
          <input
            type="date"
            name="inicio_actividades"
            defaultValue={emisor.inicio_actividades ?? ''}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-400 mt-1">Se imprime en el encabezado del comprobante.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pie del comprobante</label>
        <textarea
          name="pie_comprobante"
          rows={3}
          placeholder="Alias, CBU, condiciones de pago… Se imprime al pie de la factura."
          defaultValue={emisor.pie_comprobante ?? ''}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Entorno</label>
        <select
          name="entorno"
          defaultValue={emisor.entorno}
          className="w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="homologacion">Homologación (pruebas)</option>
          <option value="produccion">Producción (facturas reales)</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          En homologación los comprobantes no tienen validez fiscal. Pasá a producción recién cuando la
          emisión esté probada.
        </p>
      </div>

      {state && (
        <div className={`flex items-start gap-2 text-sm rounded-md px-3 py-2.5 ${
          state.success
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {state.success ? <CheckCircle size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
          {state.message}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending || cuitMal}
          className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar datos fiscales'}
        </button>
      </div>
    </form>
  )
}

export function EmisoresFacturacion({ emisores }: { emisores: Emisor[] }) {
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({})

  if (emisores.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-sm text-amber-800">
        No hay emisores cargados. Corré <code className="font-mono">supabase_pendientes.sql</code> en el
        editor SQL de Supabase para crearlos.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {emisores.map(e => {
        const abierto = abiertos[e.id] === true
        const montado = e.id in abiertos
        const faltaCuit = cuitSinCargar(e.cuit)

        return (
          <section key={e.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <h3>
              <button
                type="button"
                onClick={() => setAbiertos(prev => ({ ...prev, [e.id]: !prev[e.id] }))}
                aria-expanded={abierto}
                aria-controls={`emisor-${e.clave}`}
                className="w-full flex items-start gap-3 px-4 sm:px-6 py-3.5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
              >
                <ChevronDown
                  size={16}
                  className={`mt-0.5 shrink-0 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-sm text-gray-900">{e.razon_social}</span>
                  <span className="block text-xs text-gray-500 font-mono">
                    {faltaCuit ? 'CUIT sin cargar' : formatearCuit(e.cuit)}
                    {' · '}
                    Punto de venta {e.pto_vta}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-[11px] font-medium rounded-full px-2 py-0.5 ${
                    faltaCuit
                      ? 'bg-amber-100 text-amber-800'
                      : e.entorno === 'produccion'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {faltaCuit ? 'Incompleto' : e.entorno === 'produccion' ? 'Producción' : 'Homologación'}
                </span>
              </button>
            </h3>

            {montado && (
              <div id={`emisor-${e.clave}`} hidden={!abierto}>
                <FormularioEmisor emisor={e} />
                {!faltaCuit && <DiagnosticoArca emisorId={e.id} />}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
