import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// Next 16 renombró la convención `middleware` a `proxy`.
// Solo refresca la sesión de Supabase: no bloquea rutas.
// El guard de auth vive en src/app/(admin)/admin/(dashboard)/layout.tsx.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

// Next 16.1.6 solo reconoce el matcher exportado como `config`.
// Con `proxyConfig` el matcher se ignora, el proxy corre sobre todas las
// rutas y las páginas estáticas responden 308 hacia una URL con slash final
// que después da 404.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
