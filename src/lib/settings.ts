import 'server-only'
import { createClient } from '@/utils/supabase/server'
import { USD_FALLBACK_DEFAULT, type UsdRates } from '@/lib/usd-rate'

/** Ajustes editables desde el panel, leídos de la base. */

export const USD_FALLBACK_KEY = 'usd_rate_fallback'

export async function getUsdRates(): Promise<UsdRates> {
  const supabase = await createClient()

  const [{ data: filas }, { data: ajuste }] = await Promise.all([
    supabase.from('usd_rates').select('month, rate').order('month'),
    supabase.from('app_settings').select('value').eq('key', USD_FALLBACK_KEY).maybeSingle(),
  ])

  const porMes: Record<string, number> = {}
  for (const f of filas ?? []) {
    const n = Number(f.rate)
    if (Number.isFinite(n) && n > 0) porMes[f.month] = n
  }

  const respaldo = Number(ajuste?.value)

  return {
    porMes,
    respaldo: Number.isFinite(respaldo) && respaldo > 0 ? respaldo : USD_FALLBACK_DEFAULT,
  }
}
