import { createClient } from '@/utils/supabase/server'
import { EmailTemplatesEditor } from './EmailTemplatesEditor'
import { BulkEmailSender } from './BulkEmailSender'
import { Mail } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: templates } = await supabase
    .from('email_templates')
    .select('type, subject, body, updated_at')
    .order('type')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Configuración</h1>
      <p className="text-sm text-gray-500 mb-8">Administrá las plantillas de los emails automáticos que reciben los clientes.</p>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Mail size={20} className="text-gray-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Plantillas de Email</h2>
          <p className="text-sm text-gray-500">
            Estas plantillas se envían automáticamente a los clientes antes del vencimiento de sus servicios.
            Usá las variables disponibles para personalizar cada mensaje.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-4 mb-6 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-1">Variables disponibles</p>
        <div className="flex flex-wrap gap-3 mt-2">
          {[
            ['{{nombre}}', 'Nombre del contacto'],
            ['{{marca}}', 'Nombre de la marca / empresa'],
            ['{{servicio}}', 'Nombre del servicio'],
            ['{{dominio}}', 'Dominio / identificador'],
            ['{{dias}}', 'Días hasta el vencimiento'],
            ['{{monto}}', 'Monto en ARS'],
          ].map(([v, label]) => (
            <span key={v} className="flex items-center gap-1.5">
              <code className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-mono text-gray-800">{v}</code>
              <span className="text-xs text-gray-500">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <BulkEmailSender />
      <EmailTemplatesEditor templates={templates ?? []} />
    </div>
  )
}
