'use client'

import { useActionState, useMemo, useState } from 'react'
import Editor from 'react-simple-wysiwyg'
import { AlertCircle, CheckCircle, ChevronDown, Code, Eye, EyeOff, Send, Type, Users } from 'lucide-react'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import { sendMassEmailAction, sendMassEmailTestAction } from './actions'

const PREVIEW_DATA: Record<string, string> = {
  '{{nombre}}': 'María López',
  '{{marca}}': 'Marca Demo',
  '{{servicio}}': '',
  '{{dominio}}': '',
  '{{dias}}': '',
  '{{monto}}': '',
}

type ActionState = {
  success: boolean
  message: string
  sent?: number
  failed?: number
  total?: number
  failedEmails?: string[]
} | null

export function BulkEmailSender() {
  // Arranca cerrado: es un envío a toda la lista de clientes y no tiene por qué
  // estar abierto de entrada. `montado` deja el formulario en el DOM una vez
  // abierto, para no perder el borrador al plegarlo.
  const [abierto, setAbierto] = useState(false)
  const [montado, setMontado] = useState(false)
  const [mode, setMode] = useState<'visual' | 'html'>('visual')
  const [showPreview, setShowPreview] = useState(false)
  const [subject, setSubject] = useState('Novedades de Impakto Creative')
  const [body, setBody] = useState('<p>Hola {{nombre}},</p><p>Queremos contarte novedades importantes para {{marca}}.</p>')
  const [testEmail, setTestEmail] = useState('')

  const [testState, testFormAction, testPending] = useActionState<ActionState, FormData>(sendMassEmailTestAction, null)
  const [bulkState, bulkFormAction, bulkPending] = useActionState<ActionState, FormData>(sendMassEmailAction, null)

  const previewSubject = useMemo(() => interpolate(subject, PREVIEW_DATA), [subject])
  const previewHtml = useMemo(() => buildEmailHtml(interpolate(body, PREVIEW_DATA)), [body])

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden mb-8">
      <h2>
        <button
          type="button"
          onClick={() => { setAbierto(v => !v); setMontado(true) }}
          aria-expanded={abierto}
          aria-controls="email-masivo"
          className="w-full flex items-start gap-3 px-6 py-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
        >
          <ChevronDown
            size={16}
            className={`mt-0.5 shrink-0 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-gray-900">Email Masivo a Clientes</span>
            <span className="block text-sm text-gray-500 mt-0.5">
              Envío a todos los clientes con email cargado, tengan o no servicios activos.
            </span>
          </span>
        </button>
      </h2>

      {montado && (
      <div id="email-masivo" hidden={!abierto} className="border-t border-gray-100">
      <div className="px-6 pt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowPreview((value) => !value)}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-3 py-1.5 transition-colors"
        >
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPreview ? 'Editar' : 'Vista previa'}
        </button>
      </div>

      {showPreview ? (
        <div className="px-6 py-5">
          <p className="text-xs text-gray-500 mb-2">Asunto de ejemplo</p>
          <div className="mb-4 px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-800">{previewSubject}</div>
          <iframe
            srcDoc={previewHtml}
            title="Preview email masivo"
            className="w-full rounded-lg border border-gray-200"
            style={{ height: '520px' }}
            sandbox="allow-same-origin"
          />
        </div>
      ) : (
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Asunto del email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Contenido (HTML permitido)</label>
              <div className="flex bg-gray-100 rounded p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('visual')}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded transition-colors ${
                    mode === 'visual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Type size={12} />
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setMode('html')}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded transition-colors ${
                    mode === 'html' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Code size={12} />
                  HTML
                </button>
              </div>
            </div>

            {mode === 'visual' ? (
              <Editor
                value={body}
                onChange={(event) => setBody(event.target.value)}
                containerProps={{
                  style: { minHeight: '220px', backgroundColor: '#fff', borderRadius: '0.375rem', borderColor: '#d1d5db' },
                }}
              />
            ) : (
              <textarea
                rows={10}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-y font-mono"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-gray-500">Variables útiles:</span>
            <button type="button" onClick={() => setBody((text) => text + '{{nombre}}')} className="font-mono px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
              {'{{nombre}}'}
            </button>
            <button type="button" onClick={() => setBody((text) => text + '{{marca}}')} className="font-mono px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
              {'{{marca}}'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <form action={testFormAction} className="space-y-2">
              <input type="hidden" name="subject" value={subject} />
              <input type="hidden" name="body" value={body} />
              <label className="block text-sm font-medium text-gray-700">Enviar prueba</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="test_email"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={testPending || !testEmail || !subject || !body}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                  {testPending ? 'Enviando...' : 'Probar'}
                </button>
              </div>
            </form>

            <form action={bulkFormAction} className="space-y-2">
              <input type="hidden" name="subject" value={subject} />
              <input type="hidden" name="body" value={body} />
              <label className="block text-sm font-medium text-gray-700">Enviar a todos</label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" name="confirmed" value="yes" className="rounded border-gray-300" required />
                Confirmo envío a todos los clientes con email.
              </label>
              <button
                type="submit"
                disabled={bulkPending || !subject || !body}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
              >
                <Users size={14} />
                {bulkPending ? 'Enviando campaña...' : 'Enviar Campaña'}
              </button>
            </form>
          </div>

          {testState && (
            <div
              className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 border ${
                testState.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {testState.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {testState.message}
            </div>
          )}

          {bulkState && (
            <div
              className={`space-y-1 text-sm rounded-md px-3 py-2 border ${
                bulkState.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {bulkState.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {bulkState.message}
              </div>
              {(typeof bulkState.sent === 'number' || typeof bulkState.failed === 'number') && (
                <p className="text-xs">
                  Enviados: {bulkState.sent ?? 0} | Fallidos: {bulkState.failed ?? 0} | Total: {bulkState.total ?? 0}
                </p>
              )}
              {bulkState.failedEmails && bulkState.failedEmails.length > 0 && (
                <p className="text-xs">Errores en: {bulkState.failedEmails.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}
      </div>
      )}
    </div>
  )
}
