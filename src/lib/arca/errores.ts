import 'server-only'

/**
 * Detalle real de un fallo de red.
 *
 * `fetch` de Node reporta cualquier problema de conexión como "fetch failed"
 * y guarda la causa concreta en `cause`. Sin desenvolverla, un DNS que no
 * resuelve, un timeout, un reset y un certificado rechazado se ven todos
 * iguales, y son cuatro problemas distintos con cuatro soluciones distintas.
 */
export function detalleDeRed(e: unknown): string {
  if (!(e instanceof Error)) return String(e)

  const partes = [e.message]
  let causa: unknown = (e as { cause?: unknown }).cause

  while (causa instanceof Error) {
    const codigo = (causa as { code?: string }).code
    partes.push(codigo ? `${codigo} ${causa.message}` : causa.message)
    causa = (causa as { cause?: unknown }).cause
  }

  if (causa && !(causa instanceof Error)) partes.push(String(causa))

  return partes.join(' → ')
}

/** Reintenta ante fallos de red, que en ARCA son frecuentes y transitorios. */
export async function conReintentos<T>(
  fn: () => Promise<T>,
  intentos = 3,
  esperaMs = 1200,
): Promise<T> {
  let ultimo: unknown
  for (let i = 0; i < intentos; i++) {
    try {
      return await fn()
    } catch (e) {
      ultimo = e
      // Un rechazo de ARCA no se reintenta: la respuesta ya llegó y reintentar
      // solo repetiría el mismo rechazo, o peor, duplicaría un comprobante.
      if (e instanceof Error && !/fetch failed|network|socket|timeout|ECONN|EAI_AGAIN|UND_ERR/i.test(
        detalleDeRed(e),
      )) {
        throw e
      }
      if (i < intentos - 1) await new Promise(r => setTimeout(r, esperaMs * (i + 1)))
    }
  }
  throw ultimo
}
