'use client'

import { useActionState, useEffect, useState } from 'react'
import { saveTemplateAction, sendTestEmailAction } from './actions'
import { CheckCircle, AlertCircle, Eye, EyeOff, Code, Type, Send } from 'lucide-react'
import { buildEmailHtml, interpolate } from '@/utils/emailTemplate'
import Editor from 'react-simple-wysiwyg'

type Template = {
  type: string
  subject: string
  body: string
  updated_at: string
}

const LABELS: Record<string, { title: string; desc: string; color: string }> = {
  '10_days': {
    title: '10 días antes del vencimiento',
    desc: 'Primer recordatorio automático.',
    color: 'bg-green-50 border-green-200 text-green-700',
  },
  '5_days': {
    title: '5 días antes del vencimiento',
    desc: 'Segundo recordatorio, tono más urgente.',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  '24_hours': {
    title: '24 horas antes del vencimiento',
    desc: 'Aviso final, máxima urgencia.',
    color: 'bg-red-50 border-red-200 text-red-700',
  },
}

const VARS = ['{{nombre}}', '{{marca}}', '{{servicio}}', '{{dominio}}', '{{dias}}', '{{monto}}']

const PREVIEW_DATA: Record<string, string> = {
  '{{nombre}}': 'Juan García',
  '{{marca}}': 'Mi Empresa S.A.',
  '{{servicio}}': 'Hosting Web Premium',
  '{{dominio}}': 'misitioweb.com',
  '{{dias}}': '10',
  '{{monto}}': '25.000',
}



function TemplateEditor({ template }: { template: Template }) {
  const [state, formAction, isPending] = useActionState(saveTemplateAction, null)
  const [testState, testFormAction, isTestPending] = useActionState(sendTestEmailAction, null)
  const [body, setBody] = useState(template.body)
  const [subject, setSubject] = useState(template.subject)
  const [showPreview, setShowPreview] = useState(false)
  const [mode, setMode] = useState<'visual' | 'html'>('visual')
  const [testEmail, setTestEmail] = useState('')
  const info = LABELS[template.type]

  useEffect(() => {
    if (state?.success || testState?.success) {
      // flash handled by state message
    }
  }, [state, testState])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className={`px-6 py-4 border-b flex items-start justify-between gap-4 ${info.color} border-opacity-60`}>
        <div>
          <h3 className="font-semibold text-base">{info.title}</h3>
          <p className="text-xs mt-0.5 opacity-75">{info.desc}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(p => !p)}
          className="flex items-center gap-1.5 text-xs font-medium bg-white/70 hover:bg-white border border-current/20 rounded-md px-2.5 py-1.5 transition-colors flex-shrink-0"
        >
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPreview ? 'Editar' : 'Previsualizar'}
        </button>
      </div>

      {showPreview ? (
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Vista previa con datos de ejemplo</p>
          <div className="mb-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
            <span className="text-xs text-gray-500">Asunto: </span>
            <span className="text-sm font-medium text-gray-800">{interpolate(subject, PREVIEW_DATA)}</span>
          </div>
          <iframe
            srcDoc={buildEmailHtml(interpolate(body, PREVIEW_DATA))}
            title="Email preview"
            className="w-full rounded-lg border border-gray-200"
            style={{ height: '540px' }}
            sandbox="allow-same-origin"
          />
          <p className="text-xs text-gray-400 mt-2 italic">* Render exacto del email que recibe el cliente. Variables reemplazadas con datos de ejemplo.</p>
        </div>
      ) : (
        <form action={formAction} className="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" name="type" value={template.type} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto del email
            </label>
            <input
              type="text"
              name="subject"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Cuerpo del mensaje
              </label>
              <div className="flex bg-gray-100 rounded p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('visual')}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded transition-colors ${mode === 'visual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Type size={12} />
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setMode('html')}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded transition-colors ${mode === 'html' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Code size={12} />
                  HTML
                </button>
              </div>
            </div>
            
            {mode === 'visual' ? (
              <div className="prose-sm w-full max-w-none">
                <Editor
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  containerProps={{ style: { minHeight: '200px', backgroundColor: '#fff', borderRadius: '0.375rem', borderColor: '#d1d5db' } }}
                />
              </div>
            ) : (
              <textarea
                name="body"
                required
                rows={10}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-y font-mono"
              />
            )}
            {/* hidden input ensures form gets data even in visual mode */}
            {mode === 'visual' && <input type="hidden" name="body" value={body} />}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {VARS.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setBody(b => b + v)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-mono rounded px-2 py-1 transition-colors"
                title={`Insertar ${v}`}
              >
                {v}
              </button>
            ))}
            <span className="text-xs text-gray-400 self-center ml-1">← clic para insertar al final</span>
          </div>

          {state && (
            <div className={`flex items-center gap-2 text-sm rounded-md px-3 py-2.5 ${
              state.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {state.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Última actualización: {new Date(template.updated_at).toLocaleString('es-AR')}
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </form>
      )}

      {/* Test Email Form - Shown at the bottom always when not in preview mode */}
      {!showPreview && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <form action={testFormAction} className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <input type="hidden" name="subject" value={subject} />
            <input type="hidden" name="body" value={body} />
            <div className="flex items-center gap-3 w-full sm:max-w-md">
              <input
                type="email"
                name="test_email"
                placeholder="Email para prueba..."
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                disabled={isTestPending || !testEmail}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 shrink-0"
              >
                <Send size={14} />
                {isTestPending ? 'Enviando...' : 'Probar'}
              </button>
            </div>
          </form>
          {testState && (
            <div className={`mt-3 flex items-center gap-2 text-xs rounded-md px-2.5 py-2 ${
              testState.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testState.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {testState.message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EmailTemplatesEditor({ templates }: { templates: Template[] }) {
  const order = ['10_days', '5_days', '24_hours']
  const sorted = order.map(t => templates.find(x => x.type === t)).filter(Boolean) as Template[]

  return (
    <div className="flex flex-col gap-6">
      {sorted.map(t => (
        <TemplateEditor key={t.type} template={t} />
      ))}
    </div>
  )
}
