'use client'

import { useCanvasEscena, type FabricaEscena, suave, azar, type Contexto } from '@/lib/canvas-escena'
import { trazos, type Tono } from './paleta'

/**
 * Secuencia.
 *
 * Cinco nodos unidos por un camino, y un pulso que los recorre en orden. El
 * avance está atado al scroll: la sección de metodología habla de cinco pasos
 * del diagnóstico a la implementación, así que bajar por la página es
 * literalmente avanzar por el proceso.
 *
 * Un nodo se enciende cuando el pulso lo pasa y se queda encendido. Al final
 * del recorrido los cinco están en oro, que es el estado "proceso completo".
 */

type Nodo = { x: number; y: number; fase: number }

const PASOS = 5

/**
 * La fábrica corre dentro del efecto, no en el render: su clausura es el
 * estado mutable de la escena y así ningún re-render la pisa a mitad de
 * animación.
 */
function crearSecuencia(tono: Tono): FabricaEscena {
  return () => {
    let nodos: Nodo[] = []
    const paleta = trazos(tono)

    const construir = (c: Contexto) => {
      // En vertical el camino baja; en horizontal cruza. La pieza se adapta a
      // la forma del hueco en vez de deformarse.
      const vertical = c.alto > c.ancho * 1.15
      const margen = 0.16

      nodos = Array.from({ length: PASOS }, (_, i) => {
        const t = i / (PASOS - 1)
        const avance = margen + t * (1 - margen * 2)
        // El camino asciende paso a paso. El desorden es leve y solo evita que
        // se lea como una escalera perfecta: cinco pasos que suben, no un
        // gráfico que sube y baja al azar.
        const subida = margen + (1 - t) * (1 - margen * 2)
        const ruido = (azar(i * 6.7) - 0.5) * 0.07

        return vertical
          ? {
              x: c.ancho * (subida + ruido),
              y: c.alto * avance,
              fase: azar(i * 3.1) * Math.PI * 2,
            }
          : {
              x: c.ancho * avance,
              y: c.alto * (subida + ruido),
              fase: azar(i * 3.1) * Math.PI * 2,
            }
      })
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (nodos.length < 2) return
      const { tiempo, progreso, puntero } = c

      // El pulso sigue al scroll, con una respiración propia para que no quede
      // congelado cuando la página está quieta.
      const avance = Math.min(1, Math.max(0, progreso * 1.25 - 0.1))
      const respiracion = (Math.sin(tiempo * 0.0006) + 1) * 0.5 * 0.04
      const cabeza = Math.min(1, avance + respiracion)

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Guías: una línea al ras de cada nodo. Encuadran el recorrido y le dan
      // aire de plano técnico en vez de gráfico suelto.
      ctx.strokeStyle = paleta.base
      ctx.lineWidth = 0.6
      for (let i = 0; i < nodos.length; i++) {
        const n = nodos[i]
        ctx.globalAlpha = paleta.alfaBase * 0.5
        ctx.beginPath()
        ctx.moveTo(n.x, 0)
        ctx.lineTo(n.x, c.alto)
        ctx.stroke()
      }

      // El camino completo, tenue: se ve a dónde va antes de llegar.
      ctx.strokeStyle = paleta.base
      ctx.lineWidth = 1
      ctx.globalAlpha = paleta.alfaBase
      ctx.beginPath()
      ctx.moveTo(nodos[0].x, nodos[0].y)
      for (let i = 1; i < nodos.length; i++) ctx.lineTo(nodos[i].x, nodos[i].y)
      ctx.stroke()

      // El tramo recorrido, en oro.
      const totalTramos = nodos.length - 1
      const recorrido = cabeza * totalTramos
      ctx.strokeStyle = paleta.oro
      ctx.lineWidth = 2.2
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.moveTo(nodos[0].x, nodos[0].y)
      for (let i = 1; i < nodos.length; i++) {
        const tramo = recorrido - (i - 1)
        if (tramo <= 0) break
        const k = Math.min(1, tramo)
        const a = nodos[i - 1]
        const b = nodos[i]
        ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)
      }
      ctx.stroke()

      // Los nodos. El que ya pasó el pulso queda encendido.
      for (let i = 0; i < nodos.length; i++) {
        const n = nodos[i]
        const encendido = suave((recorrido - (i - 0.5)) * 1.6)

        let cerca = 0
        if (puntero.activo && !c.tactil) {
          const d = Math.hypot(n.x - puntero.x, n.y - puntero.y)
          cerca = suave(1 - d / 140)
        }

        const radio = 4.5 + encendido * 3.5 + cerca * 3.5
        const pulso = 1 + Math.sin(tiempo * 0.0018 + n.fase) * 0.14 * encendido

        // Halo y anillo del nodo encendido: el anillo es lo que lo vuelve un
        // punto de control y no una mancha.
        if (encendido > 0.02) {
          ctx.globalAlpha = encendido * 0.14
          ctx.fillStyle = paleta.oro
          ctx.beginPath()
          ctx.arc(n.x, n.y, radio * 3.6 * pulso, 0, Math.PI * 2)
          ctx.fill()

          ctx.globalAlpha = encendido * 0.45
          ctx.strokeStyle = paleta.oro
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(n.x, n.y, radio * 2.1 * pulso, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.globalAlpha = 0.25 + encendido * 0.6 + cerca * 0.2
        ctx.fillStyle = encendido > 0.5 ? paleta.oro : paleta.base
        ctx.beginPath()
        ctx.arc(n.x, n.y, radio * pulso, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}

export default function Secuencia({
  tono = 'papel',
  className = '',
}: {
  tono?: Tono
  className?: string
}) {
  const ref = useCanvasEscena(crearSecuencia(tono), tono)

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
