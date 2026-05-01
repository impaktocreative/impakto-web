import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ClientsTable } from './ClientsTable'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Clientes</h1>
        <Link
          href="/admin/clients/new"
          className="bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <ClientsTable initialClients={clients ?? []} />
      </div>
    </div>
  )
}
