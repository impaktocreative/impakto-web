'use client'

import { Printer } from 'lucide-react'

/**
 * El PDF lo genera el navegador al imprimir. Es la vía más corta a un archivo
 * fiel: lo que se ve en pantalla es lo que sale, sin una segunda maqueta que
 * mantener sincronizada con esta.
 */
export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
    >
      <Printer size={15} />
      Imprimir o guardar como PDF
    </button>
  )
}
