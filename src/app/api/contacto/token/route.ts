import { NextResponse } from 'next/server'
import { emitirToken } from '@/lib/contacto/antispam'

/**
 * El formulario pide esto al montar. La página de contacto es estática, así
 * que el token no puede hornearse en el HTML: sería el mismo para todos y de
 * hace días, y el chequeo de tiempo no diría nada.
 */
export async function GET() {
  return NextResponse.json(
    { token: await emitirToken() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
