import { ReactNode } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '../AdminSidebar'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        <div className="flex-1 p-4 md:p-8 lg:p-10 w-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
