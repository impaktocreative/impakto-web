'use client'

import { useCanvasEscena, type FabricaEscena, suave, azar, type Contexto } from '@/lib/canvas-escena'
import { trazos, type Tono } from './paleta'

/**
 * Estratos.
 *
 * Capas horizontales apiladas que se separan y se vuelven a juntar según el
 * scroll, como un corte de terreno. Cada capa es un área de trabajo: se leen
 * distintas pero pertenecen al mismo cuerpo, que es exactamente lo que dice
 * la sección de áreas principales.
 *
 * El desplazamiento por scroll es el parallax: las capas de arriba se mueven
 * más que las de abajo, así que la pieza tiene profundidad sin usar sombras.
 */

type Estrato = {
  y: number
  amplitud: number
  frecuencia: number
  fase: number
  profundidad: number
  dorado: boolean
}

const CAPAS_ESCRITORIO = 22
const CAPAS_TACTIL = 13

/**
 * La fábrica corre dentro del efecto, no en el render: su clausura es el
 * estado mutable de la escena y así ningún re-render la pisa a mitad de
 * animación.
 */
function crearEstratos(tono: Tono): FabricaEscena {
  return () => {
    let capas: Estrato[] = []
    const paleta = trazos(tono)

    const construir = (c: Contexto) => {
      // La cantidad sale del alto disponible: en una banda baja, veintidós
      // capas se pisan entre sí y el corte deja de leerse.
      const techo = c.tactil || c.bajoConsumo ? CAPAS_TACTIL : CAPAS_ESCRITORIO
      const cantidad = Math.max(6, Math.min(techo, Math.round(c.alto / 26)))
      capas = Array.from({ length: cantidad }, (_, i) => {
        const t = i / (cantidad - 1)
        return {
          y: c.alto * (0.08 + t * 0.84),
          amplitud: c.alto * (0.02 + azar(i * 4.3) * 0.05),
          frecuencia: 1.1 + azar(i * 8.7) * 1.9,
          fase: azar(i * 2.9) * Math.PI * 2,
          // Las de arriba viajan más: es lo que produce la profundidad.
          profundidad: 1 - t,
          // Dos capas doradas, no más: el oro marca, no decora.
          dorado: i === Math.floor(cantidad * 0.32) || i === Math.floor(cantidad * 0.71),
        }
      })
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (!capas.length) return
      const { ancho, alto, tiempo, puntero, progreso } = c

      // El scroll separa las capas y las vuelve a juntar: 0 al entrar, máximo
      // en el centro de la pantalla, 0 al salir.
      const apertura = Math.sin(progreso * Math.PI) * alto * 0.1

      ctx.lineCap = 'round'

      for (let i = 0; i < capas.length; i++) {
        const e = capas[i]

        // El puntero levanta la capa que tiene debajo, como pasar la mano.
        let alzado = 0
        if (puntero.activo && !c.tactil) {
          const dy = Math.abs(e.y - puntero.y)
          alzado = suave(1 - dy / (alto * 0.3)) * 22
        }

        const desplazamiento = (e.profundidad - 0.5) * apertura * 2
        const y0 = e.y + desplazamiento - alzado

        ctx.strokeStyle = e.dorado ? paleta.oro : paleta.base
        ctx.lineWidth = e.dorado ? 1.4 : 0.9
        ctx.globalAlpha = e.dorado
          ? 0.22 + alzado * 0.012
          : paleta.alfaBase + e.profundidad * 0.1 + alzado * 0.006

        ctx.beginPath()
        const pasos = 42
        for (let p = 0; p <= pasos; p++) {
          const t = p / pasos
          const x = t * ancho
          const y =
            y0 +
            Math.sin(t * Math.PI * e.frecuencia + e.fase + tiempo * 0.00016) * e.amplitud +
            Math.sin(t * Math.PI * e.frecuencia * 2.7 + e.fase) * e.amplitud * 0.25
          if (p === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}

export default function Estratos({
  tono = 'papel',
  className = '',
}: {
  tono?: Tono
  className?: string
}) {
  const ref = useCanvasEscena(crearEstratos(tono), tono)

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
