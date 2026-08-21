'use client'

import { useCanvasEscena, type FabricaEscena, suave, azar, type Contexto } from '@/lib/canvas-escena'
import { trazos, type Tono } from './paleta'

/**
 * Convergencia.
 *
 * Trayectorias que entran por la izquierda cada una con su rumbo y se van
 * enderezando hacia una misma línea a medida que avanzan. Al final del
 * recorrido corren paralelas. Es la sección de con quién trabajamos mejor
 * dicha en dibujo: proyectos dispersos que encuentran una dirección común.
 *
 * El oro aparece solo en el tramo ya convergido, así que es resultado del
 * recorrido y no un adorno encima. El puntero adelanta la convergencia de las
 * líneas que tiene cerca: acercarse ordena.
 */

type Linea = {
  y0: number
  desvio: number
  fase: number
  grosor: number
}

const CANTIDAD_ESCRITORIO = 46
const CANTIDAD_TACTIL = 26
const PASOS = 26

/**
 * La fábrica corre dentro del efecto, no en el render: su clausura es el
 * estado mutable de la escena y así ningún re-render la pisa a mitad de
 * animación.
 */
function crearConvergencia(tono: Tono): FabricaEscena {
  return () => {
    let lineas: Linea[] = []
    const paleta = trazos(tono)

    const construir = (c: Contexto) => {
      const cantidad = c.tactil || c.bajoConsumo ? CANTIDAD_TACTIL : CANTIDAD_ESCRITORIO
      lineas = Array.from({ length: cantidad }, (_, i) => ({
        // Repartidas en alto con algo de desorden, para que no se lea como pauta.
        y0: ((i + 0.5) / cantidad) * c.alto + (azar(i * 3.7) - 0.5) * (c.alto / cantidad) * 1.6,
        // Cuánto se aparta cada una antes de enderezarse.
        desvio: (azar(i * 7.1) - 0.5) * c.alto * 0.55,
        fase: azar(i * 11.3) * Math.PI * 2,
        grosor: 0.6 + azar(i * 5.9) * 0.7,
      }))
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (!lineas.length) return

      const { ancho, alto, tiempo, puntero } = c
      // El punto de fuga sube y baja apenas, para que el campo respire.
      const fuga = alto * (0.5 + Math.sin(tiempo * 0.00009) * 0.04)

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < lineas.length; i++) {
        const l = lineas[i]

        // Cerca del puntero la línea converge antes: el orden se adelanta.
        let empuje = 0
        if (puntero.activo && !c.tactil) {
          const dy = Math.abs(l.y0 - puntero.y)
          empuje = suave(1 - dy / (alto * 0.42)) * 0.45
        }

        const puntos: [number, number][] = []
        for (let p = 0; p <= PASOS; p++) {
          const t = p / PASOS
          // La convergencia arranca lenta y termina pegada a la línea de fuga.
          const k = suave(Math.min(1, t * (1.15 + empuje)))
          const ondulacion = Math.sin(tiempo * 0.0004 + l.fase + t * 3.4) * (1 - k) * 14
          const y = l.y0 + l.desvio * (1 - k) + (fuga - l.y0) * k * 0.9 + ondulacion
          puntos.push([t * ancho, y])
        }

        // Tinta: toda la trayectoria, más tenue donde todavía está dispersa.
        ctx.strokeStyle = paleta.base
        ctx.lineWidth = l.grosor
        for (let p = 0; p < PASOS; p++) {
          const t = p / PASOS
          ctx.globalAlpha = paleta.alfaBase + suave(t) * (paleta.alfaMax - paleta.alfaBase) * 0.7
          ctx.beginPath()
          ctx.moveTo(puntos[p][0], puntos[p][1])
          ctx.lineTo(puntos[p + 1][0], puntos[p + 1][1])
          ctx.stroke()
        }

        // Oro: solo el tramo final, el que ya convergió.
        const desde = Math.floor(PASOS * 0.76)
        ctx.strokeStyle = paleta.oro
        ctx.lineWidth = l.grosor * 1.15
        ctx.beginPath()
        ctx.globalAlpha = (0.1 + empuje * 0.5) * 0.9
        ctx.moveTo(puntos[desde][0], puntos[desde][1])
        for (let p = desde + 1; p <= PASOS; p++) ctx.lineTo(puntos[p][0], puntos[p][1])
        ctx.stroke()
      }

      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}

export default function Convergencia({
  tono = 'tinta',
  className = '',
}: {
  tono?: Tono
  className?: string
}) {
  const ref = useCanvasEscena(crearConvergencia(tono), tono)

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
