/**
 * Los tres colores que usan las piezas generativas.
 *
 * Son los mismos tokens del sitio, escritos acá en hexadecimal porque canvas
 * no lee variables CSS. Si cambian en `globals.css`, cambian también acá.
 */

export const TINTA = '#161615'
export const PAPEL = '#f7f6f2'
export const ORO = '#b99a5b'

export type Tono = 'tinta' | 'papel'

/** Trazo base y trazo dorado según el fondo sobre el que se dibuja. */
export function trazos(tono: Tono) {
  return tono === 'papel'
    ? { base: PAPEL, oro: ORO, alfaBase: 0.13, alfaMax: 0.4 }
    : { base: TINTA, oro: ORO, alfaBase: 0.14, alfaMax: 0.44 }
}
