'use client'

import Link from 'next/link'
import { Loader2, type LucideIcon } from 'lucide-react'

/**
 * Botones de icono del panel.
 *
 * Antes cada tabla los escribía a mano y ninguna coincidía: dos tamaños de
 * botón (h-7 y h-8), ocho tamaños de icono entre 11 y 24, y tres grises
 * distintos para lo mismo. Acá vive la única definición.
 *
 * Todos arrancan neutros y el color aparece al pasar por encima. Una columna
 * de acciones con un botón rojo por fila grita en cada renglón: el rojo tiene
 * que significar "estás por borrar esto", no "hay una tabla".
 */

/** Tamaño del icono dentro de un botón de acción. */
export const ICONO_ACCION = 16

type Tono = 'neutral' | 'peligro' | 'exito' | 'aviso'

const BASE =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 ' +
  'bg-white text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none'

const TONOS: Record<Tono, string> = {
  neutral: 'hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-400',
  peligro: 'hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-400',
  exito: 'hover:border-green-200 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-500',
  aviso: 'hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 focus-visible:ring-amber-500',
}

type Comun = {
  icon: LucideIcon
  /** Sirve de aria-label y de tooltip: una sola fuente, no se desfasan. */
  label: string
  tono?: Tono
}

export function IconButton({
  icon: Icon,
  label,
  tono = 'neutral',
  ocupado = false,
  disabled,
  onClick,
  type = 'button',
}: Comun & {
  ocupado?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || ocupado}
      aria-label={label}
      aria-busy={ocupado || undefined}
      title={label}
      className={`${BASE} ${TONOS[tono]}`}
    >
      {ocupado ? (
        <Loader2 size={ICONO_ACCION} className="animate-spin" />
      ) : (
        <Icon size={ICONO_ACCION} />
      )}
    </button>
  )
}

export function IconLink({ icon: Icon, label, tono = 'neutral', href }: Comun & { href: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className={`${BASE} ${TONOS[tono]}`}>
      <Icon size={ICONO_ACCION} />
    </Link>
  )
}

/** Fila de acciones. Alineada a la derecha en tablas, a la izquierda en tarjetas. */
export function IconButtonGroup({
  children,
  alinear = 'derecha',
}: {
  children: React.ReactNode
  alinear?: 'derecha' | 'izquierda'
}) {
  return (
    <div className={`flex items-center gap-1 ${alinear === 'derecha' ? 'justify-end' : ''}`}>
      {children}
    </div>
  )
}
