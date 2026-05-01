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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Link
          href="/admin/clients/new"
          className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ClientsTable initialClients={clients ?? []} />
      </div>
    </div>
  )
}
