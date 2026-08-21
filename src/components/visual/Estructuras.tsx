'use client'

import { useCanvasEscena, suave, azar, type Contexto, type FabricaEscena } from '@/lib/canvas-escena'
import { ORO } from './paleta'

/**
 * Estructuras.
 *
 * Módulos rectangulares que lejos del puntero están corridos y girados, y
 * cerca encajan en una retícula ortogonal perfecta. Es la contraparte del
 * campo de flechas: allá el orden es dirección —todo apunta a un punto—, acá
 * el orden es estructura —todo encuentra su lugar en una grilla.
 *
 * Va en la página de servicios, donde el titular habla de una estructura para
 * captar, convertir y retener. El módulo que termina de encajar recibe un
 * filete dorado, así que el oro sigue siendo consecuencia del orden.
 *
 * Los módulos no son todos iguales: hay de uno, dos y tres pasos de ancho,
 * como en una retícula de maquetación real. Una grilla de cuadrados idénticos
 * se lee como fondo de tabla, no como sistema.
 */

type Modulo = {
  col: number
  fila: number
  ancho: number
  alto: number
  /** Desorden en reposo: desplazamiento y giro propios. */
  dx: number
  dy: number
  giro: number
  fase: number
}

const PASO_ESCRITORIO = 62
const PASO_TACTIL = 84

function crearEstructuras(): FabricaEscena {
  return () => {
    let modulos: Modulo[] = []
    let paso = PASO_ESCRITORIO

    const construir = (c: Contexto) => {
      paso = (c.tactil ? PASO_TACTIL : PASO_ESCRITORIO) * (c.bajoConsumo ? 1.3 : 1)
      const columnas = Math.ceil(c.ancho / paso) + 1
      const filas = Math.ceil(c.alto / paso) + 1

      modulos = []
      for (let f = 0; f < filas; f++) {
        for (let col = 0; col < columnas; col++) {
          const s = f * 31 + col * 7
          const r = azar(s * 1.7)

          // Anchos desiguales: uno, dos o tres pasos. Todos iguales se leería
          // como cuadrícula de fondo en lugar de sistema de maquetación.
          const ancho = r > 0.86 ? 3 : r > 0.62 ? 2 : 1
          const alto = azar(s * 4.3) > 0.78 ? 2 : 1

          // Uno de cada tres huecos queda vacío: el aire también es retícula.
          if (azar(s * 2.9) < 0.34) continue

          modulos.push({
            col,
            fila: f,
            ancho,
            alto,
            dx: (azar(s * 5.1) - 0.5) * paso * 1.5,
            dy: (azar(s * 8.3) - 0.5) * paso * 1.5,
            giro: (azar(s * 6.7) - 0.5) * 0.9,
            fase: azar(s * 3.3) * Math.PI * 2,
          })
        }
      }
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (!modulos.length) return
      const { ancho: W, alto: H, tiempo, puntero } = c

      // Sin cursor el foco recorre solo, para que la pieza no quede muerta.
      const fx = puntero.activo && !c.tactil ? puntero.x : W * (0.5 + Math.sin(tiempo * 0.00012) * 0.32)
      const fy = puntero.activo && !c.tactil ? puntero.y : H * (0.5 + Math.cos(tiempo * 0.00017) * 0.3)
      const radio = Math.min(W, H) * 0.72

      const margen = paso * 0.16

      for (let i = 0; i < modulos.length; i++) {
        const m = modulos[i]

        const x0 = m.col * paso
        const y0 = m.fila * paso
        const w = m.ancho * paso - margen * 2
        const h = m.alto * paso - margen * 2

        // Centro del módulo ya encajado, para medir la distancia al foco.
        const cxOrden = x0 + margen + w / 2
        const cyOrden = y0 + margen + h / 2

        const d = Math.hypot(cxOrden - fx, cyOrden - fy)
        const orden = suave(1 - d / radio)

        // Deriva lenta del desorden: en reposo el módulo respira.
        const respiro = Math.sin(tiempo * 0.00028 + m.fase) * 3

        const dx = m.dx * (1 - orden) + respiro * (1 - orden)
        const dy = m.dy * (1 - orden) - respiro * (1 - orden)
        const giro = m.giro * (1 - orden)

        const cx = cxOrden + dx
        const cy = cyOrden + dy

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(giro)

        const encajado = orden > 0.9

        ctx.lineWidth = encajado ? 1.1 : 0.8
        ctx.strokeStyle = encajado ? ORO : '#161615'
        ctx.globalAlpha = encajado
          ? 0.26 + (orden - 0.9) * 4.2
          : 0.07 + orden * 0.24

        ctx.beginPath()
        ctx.rect(-w / 2, -h / 2, w, h)
        ctx.stroke()

        // El módulo encajado se rellena apenas: pasa de contorno a pieza.
        if (orden > 0.55) {
          ctx.globalAlpha = (orden - 0.55) * 0.2
          ctx.fillStyle = encajado ? ORO : '#161615'
          ctx.fill()
        }

        ctx.restore()
      }

      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}

export default function Estructuras({ className = '' }: { className?: string }) {
  const ref = useCanvasEscena(crearEstructuras())

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
