'use client'

import LienzoVivo from './LienzoVivo'

/**
 * Fondo de hero: la escultura, viva.
 *
 * Tres capas. La imagen, que es la materia y se ve siempre, aunque falle el
 * JavaScript o el sistema pida menos movimiento. El lienzo, que la pone en
 * movimiento y responde al cursor. Y el velo, que baja la obra justo detrás
 * del texto para que el titular se lea sin pelear con ella.
 *
 * El velo no es un rectángulo negro encima: es un degradé que empieza opaco
 * del lado donde vive el texto y se abre hacia donde está la pieza, así la
 * obra se ve entera y el texto igual se lee.
 */
export default function FondoHero({
  imagen,
  className = '',
}: {
  /** Nombre base en /public/arte, sin extensión. */
  imagen: string
  className?: string
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden bg-ink ${className}`}>
      <picture>
        <source srcSet={`/arte/${imagen}.avif`} type="image/avif" />
        <img
          src={`/arte/${imagen}.webp`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {/* El canvas usa el webp: es el formato que todos los navegadores saben
          dibujar en canvas sin sorpresas. */}
      <LienzoVivo src={`/arte/${imagen}.webp`} franja={16} desvio={30} />

      {/* Velo del lado del texto. En pantallas anchas se abre en diagonal
          hacia la derecha, que es donde está la pieza. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,9,0.9)_0%,rgba(10,10,9,0.72)_45%,rgba(10,10,9,0.55)_100%)] lg:bg-[linear-gradient(100deg,rgba(10,10,9,0.94)_0%,rgba(10,10,9,0.86)_32%,rgba(10,10,9,0.55)_58%,rgba(10,10,9,0.28)_100%)]" />

      {/* Cierre inferior, para que la sección siguiente no arranque de golpe. */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,var(--color-ink))]" />
    </div>
  )
}
