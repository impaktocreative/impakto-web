/**
 * Los colores de las piezas generativas.
 *
 * Son los mismos tokens del sitio, escritos acá en hexadecimal porque canvas
 * no lee variables CSS. Si cambian en `globals.css`, cambian también acá.
 */

export const TINTA = '#161615'
export const PAPEL = '#f7f6f2'

/**
 * El oro es una rampa, no un color.
 *
 * Un dorado plano se lee amarillo mostaza. El oro de verdad se reconoce por
 * el reflejo: una banda clara que recorre la superficie, con bronce a los
 * costados. Por eso acá hay cuatro valores y una función que arma el degradé,
 * en vez de un hexadecimal suelto.
 */
export const ORO_HONDO = '#7d6335'
export const ORO = '#b99a5b'
export const ORO_CLARO = '#d9c48c'
export const ORO_PALIDO = '#f2e8cd'

export type Tono = 'tinta' | 'papel'

/** Trazo base y trazo dorado según el fondo sobre el que se dibuja. */
export function trazos(tono: Tono) {
  return tono === 'papel'
    ? { base: PAPEL, oro: ORO, alfaBase: 0.13, alfaMax: 0.4 }
    : { base: TINTA, oro: ORO, alfaBase: 0.14, alfaMax: 0.44 }
}

/**
 * Degradé de oro con reflejo móvil.
 *
 * `fase` va de 0 a 1 y mueve la banda clara a lo largo del eje. Alimentarla
 * con el tiempo hace que el brillo recorra la pieza; alimentarla con el
 * scroll hace que el brillo dependa de dónde está el lector.
 *
 * La banda es angosta a propósito. Un reflejo ancho deja de leerse como
 * reflejo y se convierte en un degradé amarillo.
 */
export function oroEspecular(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  fase: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  // El reflejo entra y sale por los bordes, así que la fase recorre algo más
  // que el largo del eje y nunca se ve aparecer de la nada.
  const centro = ((fase % 1) + 1) % 1

  const parada = (p: number, color: string) => {
    if (p > 0 && p < 1) g.addColorStop(p, color)
  }

  g.addColorStop(0, ORO_HONDO)
  parada(centro - 0.22, ORO)
  parada(centro - 0.08, ORO_CLARO)
  parada(centro, ORO_PALIDO)
  parada(centro + 0.08, ORO_CLARO)
  parada(centro + 0.22, ORO)
  g.addColorStop(1, ORO_HONDO)

  return g
}
