import { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Home, Users, Package, DollarSign, LogOut, SlidersHorizontal } from 'lucide-react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col shadow-xl z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Impakto</h1>
          <p className="text-gray-400 text-sm">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
            <Home size={20} />
            Dashboard
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
            <Users size={20} />
            Clientes
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
            <Package size={20} />
            Servicios
          </Link>
          <Link href="/admin/income" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
            <DollarSign size={20} />
            Ingresos
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
            <SlidersHorizontal size={20} />
            Configuración
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md hover:bg-gray-800 transition-colors text-left">
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
