'use client'

import { useState, useTransition } from 'react'
import { AlertCircle, CheckCircle, PlugZap, RefreshCw } from 'lucide-react'
import { probarConexionArcaAction, sincronizarContadorAction } from './arca-actions'
import type { ResultadoVerificacion } from '@/lib/arca/verificar'

/**
 * Prueba la conexión con ARCA paso a paso.
 *
 * Los errores de ARCA son poco descriptivos: el mismo mensaje puede querer
 * decir que falta el certificado, que falta la delegación del servicio o que
 * el punto de venta no está habilitado. Mostrar dónde se corta la cadena dice
 * cuál de los tres es.
 */
export function DiagnosticoArca({ emisorId }: { emisorId: string }) {
  const [resultado, setResultado] = useState<ResultadoVerificacion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [probando, probar] = useTransition()
  const [sincronizando, sincronizar] = useTransition()

  const correr = () =>
    probar(async () => {
      setAviso(null)
      const r = await probarConexionArcaAction(emisorId)
      if (r.success) {
        setResultado(r.resultado)
        setError(null)
      } else {
        setResultado(null)
        setError(r.message)
      }
    })

  const alinear = () =>
    sincronizar(async () => {
      const r = await sincronizarContadorAction(emisorId)
      setAviso({ ok: r.success, texto: r.message })
    })

  const todoOk = resultado?.pasos.every(p => p.ok) ?? false

  return (
    <div className="border-t border-gray-100 px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={correr}
          disabled={probando}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <PlugZap size={15} />
          {probando ? 'Probando...' : 'Probar conexión con ARCA'}
        </button>

        {todoOk && (
          <button
            type="button"
            onClick={alinear}
            disabled={sincronizando}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={sincronizando ? 'animate-spin' : ''} />
            {sincronizando ? 'Sincronizando...' : 'Sincronizar numeración'}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {aviso && (
        <p
          className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm ${
            aviso.ok
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {aviso.ok ? (
            <CheckCircle size={15} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
          )}
          {aviso.texto}
        </p>
      )}

      {resultado && (
        <ol className="mt-4 flex flex-col gap-2">
          {resultado.pasos.map(p => (
            <li key={p.paso} className="flex items-start gap-2.5 text-sm">
              {p.ok ? (
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              )}
              <span className="min-w-0">
                <span className="font-medium text-gray-900">{p.paso}</span>
                <span className="block text-gray-600">{p.detalle}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {resultado && resultado.puntosDeVentaDisponibles.length > 0 && (
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Puntos de venta que ARCA reconoce
          </p>
          <ul className="mt-1.5 flex flex-col gap-0.5 text-sm text-gray-700">
            {resultado.puntosDeVentaDisponibles.map(p => (
              <li key={p.nro} className="font-mono text-xs">
                {p.nro} — {p.tipo}
                {p.bloqueado && <span className="ml-2 font-sans text-red-600">bloqueado</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Para facturar desde acá hace falta uno de tipo web service. El de Comprobantes en Línea
            lleva su propia numeración y no sirve.
          </p>
        </div>
      )}
    </div>
  )
}
