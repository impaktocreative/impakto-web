'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Package, DollarSign, LogOut, SlidersHorizontal, Menu, X } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/clients', icon: Users, label: 'Clientes' },
    { href: '/admin/services', icon: Package, label: 'Servicios' },
    { href: '/admin/income', icon: DollarSign, label: 'Ingresos' },
    { href: '/admin/settings', icon: SlidersHorizontal, label: 'Configuración' },
  ]

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-black text-white p-4 sticky top-0 z-50">
        <div>
          <Image src="/logos/logoblanco.svg" alt="Impakto Creative" width={120} height={30} className="h-6 w-auto" />
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-gray-300 hover:text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50
        w-64 bg-black text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block">
          <Image src="/logos/logoblanco.svg" alt="Impakto Creative" width={150} height={40} className="h-8 w-auto mb-2" />
          <p className="text-gray-500 text-xs font-medium tracking-wider uppercase mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 md:py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-white/10 text-white font-medium shadow-sm' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300 transition-colors'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors text-left group">
              <LogOut size={20} className="text-gray-500 group-hover:text-red-400 transition-colors" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
