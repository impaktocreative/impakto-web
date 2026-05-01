'use client'

import { useActionState } from 'react'
import { sendTestEmailAction } from './actions'

export function TestEmailForm() {
  const [state, formAction, isPending] = useActionState(sendTestEmailAction, null)

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Prueba de Notificaciones (Email)
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Envía un correo de prueba para verificar que la integración con Brevo funciona correctamente.
        </p>
      </div>
      <div className="px-6 py-5 bg-gray-50/50">
        <form action={formAction} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección de correo
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
              placeholder="tu@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 flex justify-center items-center h-[46px]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar Prueba'
            )}
          </button>
        </form>
        {state && (
          <div className={`mt-4 p-4 rounded-xl text-sm ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {state.message}
          </div>
        )}
      </div>
    </div>
  )
}
