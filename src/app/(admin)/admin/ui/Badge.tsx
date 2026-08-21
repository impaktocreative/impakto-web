/**
 * Etiquetas del panel.
 *
 * El estado de un servicio se dibujaba distinto en cada pantalla: la lista de
 * clientes lo capitalizaba y coloreaba `suspendido`, la ficha lo mostraba en
 * minúscula y lo mandaba al gris de "no sé qué es esto". Acá vive la única
 * definición.
 */

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  activo: { texto: 'Activo', clase: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  vencido: { texto: 'Vencido', clase: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
  suspendido: { texto: 'Suspendido', clase: 'bg-red-50 text-red-700 ring-red-600/20' },
  inactivo: { texto: 'Inactivo', clase: 'bg-gray-100 text-gray-600 ring-gray-500/20' },
}

const BASE = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset'

export function EstadoBadge({ estado }: { estado?: string | null }) {
  const e = ESTADOS[estado ?? 'activo'] ?? ESTADOS.activo
  return <span className={`${BASE} ${e.clase}`}>{e.texto}</span>
}

/**
 * Cuenta regresiva al vencimiento. Complementa al estado en vez de repetirlo:
 * el estado dice en qué situación está el servicio, esto dice cuánto falta.
 */
export function VencimientoBadge({ dias }: { dias: number }) {
  const clase =
    dias <= 0
      ? 'bg-red-50 text-red-700 ring-red-600/20'
      : dias <= 10
        ? 'bg-amber-50 text-amber-800 ring-amber-600/20'
        : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'

  const texto =
    dias < 0
      ? `${Math.abs(dias)} días de mora`
      : dias === 0
        ? 'Vence hoy'
        : `Faltan ${dias} días`

  return <span className={`${BASE} ${clase}`}>{texto}</span>
}

/** Quién cobra: sergio o rodrigo. */
export function ReceptorBadge({ receptor }: { receptor: string }) {
  const clase =
    receptor === 'sergio'
      ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
      : 'bg-violet-50 text-violet-700 ring-violet-600/20'
  return <span className={`${BASE} ${clase}`}>{receptor === 'sergio' ? 'Sergio' : 'Rodrigo'}</span>
}
