'use client'

import { useCanvasEscena, type FabricaEscena, suave, azar, type Contexto } from '@/lib/canvas-escena'
import { trazos, type Tono } from './paleta'

/**
 * Trama.
 *
 * Un tejido de hilos que lejos del puntero está flojo y desordenado, y cerca
 * se tensa hasta formar una cuadrícula limpia. Acompaña a las preguntas
 * frecuentes: donde uno se detiene, las cosas se ordenan.
 *
 * Es la contraparte del campo del hero. Allá los trazos sueltos ganan
 * dirección; acá los hilos ya están entrelazados y lo que ganan es tensión.
 */

type Hilo = {
  vertical: boolean
  pos: number
  amplitud: number
  fase: number
}

const SEPARACION_ESCRITORIO = 34
const SEPARACION_TACTIL = 48

/**
 * La fábrica corre dentro del efecto, no en el render: su clausura es el
 * estado mutable de la escena y así ningún re-render la pisa a mitad de
 * animación.
 */
function crearTrama(tono: Tono): FabricaEscena {
  return () => {
    let hilos: Hilo[] = []
    const paleta = trazos(tono)

    const construir = (c: Contexto) => {
      const sep = (c.tactil ? SEPARACION_TACTIL : SEPARACION_ESCRITORIO) * (c.bajoConsumo ? 1.4 : 1)
      hilos = []

      for (let x = sep * 0.5; x < c.ancho; x += sep) {
        hilos.push({
          vertical: true,
          pos: x,
          amplitud: 9 + azar(x * 0.13) * 13,
          fase: azar(x * 0.31) * Math.PI * 2,
        })
      }
      for (let y = sep * 0.5; y < c.alto; y += sep) {
        hilos.push({
          vertical: false,
          pos: y,
          amplitud: 9 + azar(y * 0.17) * 13,
          fase: azar(y * 0.27) * Math.PI * 2,
        })
      }
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (!hilos.length) return
      const { ancho, alto, tiempo, puntero } = c

      // Sin cursor la tensión recorre sola, para que la pieza no quede muerta.
      const fx = puntero.activo && !c.tactil ? puntero.x : ancho * (0.5 + Math.sin(tiempo * 0.00011) * 0.34)
      const fy = puntero.activo && !c.tactil ? puntero.y : alto * (0.5 + Math.cos(tiempo * 0.00017) * 0.3)
      const radio = Math.min(ancho, alto) * 0.55

      ctx.lineCap = 'round'
      ctx.lineWidth = 1.1

      for (let i = 0; i < hilos.length; i++) {
        const h = hilos[i]
        const pasos = 20

        ctx.beginPath()
        let tensionMedia = 0

        for (let p = 0; p <= pasos; p++) {
          const t = p / pasos
          const largo = h.vertical ? alto : ancho
          const a = t * largo

          const px = h.vertical ? h.pos : a
          const py = h.vertical ? a : h.pos

          // Cuanto más cerca del foco, más tenso: la ondulación se apaga.
          const d = Math.hypot(px - fx, py - fy)
          const tension = suave(1 - d / radio)
          tensionMedia += tension

          const onda =
            Math.sin(t * Math.PI * 2.6 + h.fase + tiempo * 0.00035) * h.amplitud * (1 - tension)

          const x = h.vertical ? px + onda : px
          const y = h.vertical ? py : py + onda

          if (p === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        // El tejido tiene que leerse como pieza, no como marca de agua: sobre
        // papel el trazo fino se pierde, así que acá el rango arranca más
        // alto que en las otras escenas.
        tensionMedia /= pasos + 1
        ctx.strokeStyle = tensionMedia > 0.58 ? paleta.oro : paleta.base
        ctx.globalAlpha =
          tensionMedia > 0.58
            ? 0.3 + (tensionMedia - 0.58) * 1.1
            : 0.2 + tensionMedia * 0.3
        ctx.stroke()
      }

      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}

export default function Trama({
  tono = 'tinta',
  className = '',
}: {
  tono?: Tono
  className?: string
}) {
  const ref = useCanvasEscena(crearTrama(tono), tono)

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
