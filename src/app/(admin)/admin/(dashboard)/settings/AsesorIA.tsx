'use client'

import { useActionState, useState } from 'react'
import { Bot, Check, KeyRound } from 'lucide-react'
import { guardarConfigIAAction } from './actions'
import type { EstadoIA } from '@/lib/chat/config'

/**
 * Configuración del asesor.
 *
 * La llave nunca vuelve al navegador: el campo arranca vacío y lo que se
 * muestra son los últimos cuatro caracteres de la que está en uso, que
 * alcanzan para reconocerla sin exponerla.
 */

const estadoInicial = { success: false, message: '' }

export function AsesorIA({ estado }: { estado: EstadoIA }) {
  const [resultado, formAction, pendiente] = useActionState(guardarConfigIAAction, estadoInicial)
  const [modelo, setModelo] = useState(estado.modelo)

  const origen =
    estado.origen === 'panel'
      ? 'cargada desde este panel'
      : estado.origen === 'entorno'
        ? 'tomada de las variables de entorno'
        : 'sin cargar'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Bot size={18} className="text-gray-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Asesor del sitio</h3>
          <p className="text-sm text-gray-500">
            El asistente que atiende a los visitantes de la web pública. Se conecta a OpenRouter.
          </p>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 rounded-md border px-3 py-2 mb-5 text-sm ${
          estado.configurado
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        {estado.configurado ? <Check size={15} /> : <KeyRound size={15} />}
        {estado.configurado ? (
          <span>
            Activo con la llave terminada en <span className="font-mono">{estado.pista}</span>,{' '}
            {origen}. Modelo <span className="font-mono">{estado.modelo}</span>.
          </span>
        ) : (
          <span>Sin llave cargada. El asesor no responde hasta que haya una.</span>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="ia-key" className="block text-sm font-medium text-gray-700 mb-1.5">
            Llave de OpenRouter
          </label>
          <input
            id="ia-key"
            name="apiKey"
            type="password"
            autoComplete="off"
            placeholder={estado.configurado ? 'Dejar vacío para no cambiarla' : 'sk-or-v1-...'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-900 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Se guarda en la base y tiene prioridad sobre la variable de entorno. Se genera en
            openrouter.ai, en Keys.
          </p>
        </div>

        <div>
          <label htmlFor="ia-model" className="block text-sm font-medium text-gray-700 mb-1.5">
            Modelo
          </label>
          <input
            id="ia-model"
            name="model"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            placeholder="anthropic/claude-haiku-4.5"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-900 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Identificador exacto de OpenRouter. Los modelos con sufijo <span className="font-mono">:free</span>{' '}
            fueron retirados y dan error 404.
          </p>
        </div>

        {resultado.message ? (
          <p className={`text-sm ${resultado.success ? 'text-emerald-700' : 'text-red-600'}`}>
            {resultado.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pendiente}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pendiente ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
