import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente de servicio para el asesor.
 *
 * El chat corre sin sesión de usuario: el visitante es anónimo y las tablas
 * tienen RLS cerrado a `authenticated`. Igual que el cron, necesita la service
 * role key, y por eso todo lo que la toca vive en servidor.
 *
 * Devuelve `null` en lugar de tirar cuando falta la configuración. El sitio
 * público tiene que seguir renderizando aunque el asesor no esté configurado:
 * un visitante que quiere leer la página de servicios no debería ver un 500
 * porque falta una variable de entorno del chat.
 */

let cliente: SupabaseClient | null = null

export function clienteChat(): SupabaseClient | null {
  if (cliente) return cliente

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  cliente = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cliente
}
