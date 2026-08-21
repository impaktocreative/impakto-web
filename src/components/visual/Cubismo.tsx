'use client'

import { useCanvasEscena, suave, azar, type Contexto, type FabricaEscena } from '@/lib/canvas-escena'
import { trazos, oroEspecular, type Tono } from './paleta'

/**
 * Cubismo.
 *
 * Una figura hecha de planos que se separan y vuelven a componerse, recorrida
 * por una sola línea continua que se dibuja sin levantar el trazo.
 *
 * Son las dos ideas que la pintura moderna dejó y que acá sirven: Picasso
 * rompiendo un cuerpo en planos que se ven a la vez desde varios lados, y el
 * dibujo de un solo trazo que resuelve una figura entera sin cortar. Traducido
 * a lo que hace el estudio: fragmentos dispersos que, mirados juntos, forman
 * algo, y una sola línea que los recorre a todos.
 *
 * Los planos no son al azar. Los puntos se colocan sobre una composición
 * decidida —tercios, no centro— y se triangulan por vecindad, que es lo que
 * evita que quede confeti.
 */

type Punto = { x: number; y: number; dx: number; dy: number; fase: number }
type Plano = { a: number; b: number; c: number; deriva: number; dorado: boolean }

/**
 * Composición base en coordenadas relativas.
 *
 * Está dibujada a mano, no generada: un macizo hacia la izquierda que se
 * abre en abanico hacia la derecha y arriba. Al azar puro los planos quedan
 * parejos y la pieza pierde el peso que hace que se lea como una figura.
 */
const COMPOSICION: [number, number][] = [
  [0.08, 0.18], [0.26, 0.06], [0.46, 0.16], [0.62, 0.05],
  [0.05, 0.44], [0.23, 0.36], [0.41, 0.47], [0.60, 0.33], [0.80, 0.22],
  [0.12, 0.70], [0.31, 0.62], [0.50, 0.74], [0.69, 0.58], [0.88, 0.46],
  [0.22, 0.94], [0.44, 0.90], [0.66, 0.96], [0.86, 0.76],
]

/**
 * Orden del trazo continuo: recorre los puntos en zigzag por bandas, así la
 * línea cruza la composición entera sin volver sobre sí misma.
 */
const RECORRIDO = [0, 1, 2, 3, 8, 7, 6, 5, 4, 9, 10, 11, 12, 13, 17, 16, 15, 14]

const PLANOS: [number, number, number][] = [
  [0, 1, 5], [1, 2, 6], [2, 3, 7], [3, 7, 8],
  [4, 5, 9], [5, 6, 10], [6, 7, 11], [7, 8, 12], [8, 12, 13],
  [9, 10, 14], [10, 11, 15], [11, 12, 16], [12, 13, 17],
  [1, 5, 6], [2, 6, 7], [10, 15, 11], [11, 16, 12],
]

function crearCubismo(tono: Tono): FabricaEscena {
  return () => {
    let puntos: Punto[] = []
    let planos: Plano[] = []
    const paleta = trazos(tono)

    const construir = (c: Contexto) => {
      puntos = COMPOSICION.map(([rx, ry], i) => {
        // Cada punto tiene su propio rumbo de fuga: es lo que separa los planos.
        const angulo = azar(i * 9.7) * Math.PI * 2
        return {
          x: rx * c.ancho,
          y: ry * c.alto,
          dx: Math.cos(angulo),
          dy: Math.sin(angulo),
          fase: azar(i * 4.1) * Math.PI * 2,
        }
      })

      planos = PLANOS.map(([a, b, cc], i) => ({
        a,
        b,
        c: cc,
        deriva: 0.35 + azar(i * 6.3) * 0.65,
        // Dos planos en oro. El resto es tinta: el oro señala, no llena.
        dorado: i === 3 || i === 10,
      }))
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (!puntos.length) return
      const { ancho, alto, tiempo, puntero, progreso } = c

      // La figura se arma y se desarma con el scroll: dispersa al entrar,
      // compuesta en el centro de la pantalla, dispersa otra vez al salir.
      const dispersion = Math.abs(Math.cos(progreso * Math.PI)) * Math.min(ancho, alto) * 0.13

      const posicion = (i: number): [number, number] => {
        const p = puntos[i]
        let empuje = 0
        if (puntero.activo && !c.tactil) {
          const d = Math.hypot(p.x - puntero.x, p.y - puntero.y)
          // Cerca del cursor los planos se abren: la mano separa la figura.
          empuje = suave(1 - d / (Math.min(ancho, alto) * 0.5)) * 26
        }
        const respiro = Math.sin(tiempo * 0.00035 + p.fase) * 4
        const k = dispersion + empuje + respiro
        return [p.x + p.dx * k, p.y + p.dy * k]
      }

      // 1. Los planos, apenas insinuados. Son masa, no dibujo.
      for (let i = 0; i < planos.length; i++) {
        const pl = planos[i]
        const [ax, ay] = posicion(pl.a)
        const [bx, by] = posicion(pl.b)
        const [cx, cy] = posicion(pl.c)

        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.lineTo(cx, cy)
        ctx.closePath()

        if (pl.dorado) {
          // El reflejo recorre el plano: es lo que separa el oro del amarillo.
          const brillo = oroEspecular(ctx, ax, ay, cx, cy, tiempo * 0.00013 + i * 0.4)
          ctx.fillStyle = brillo
          ctx.globalAlpha = 0.12 * pl.deriva
          ctx.fill()

          ctx.strokeStyle = brillo
          ctx.lineWidth = 1.2
          ctx.globalAlpha = 0.55
          ctx.stroke()
        } else {
          ctx.fillStyle = paleta.base
          ctx.globalAlpha = 0.035 * pl.deriva
          ctx.fill()

          ctx.strokeStyle = paleta.base
          ctx.lineWidth = 0.5
          ctx.globalAlpha = paleta.alfaBase * 0.45
          ctx.stroke()
        }
      }

      // 2. La línea continua, dibujándose sin levantar el trazo.
      //    Avanza con el scroll y da una vuelta lenta por su cuenta, para que
      //    la pieza siga viva con la página quieta.
      const vueltas = (progreso * 1.1 + tiempo * 0.00004) % 1
      const largo = RECORRIDO.length - 1
      const cabeza = vueltas * largo

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = paleta.base
      ctx.lineWidth = 2.4
      ctx.globalAlpha = 0.85

      ctx.beginPath()
      const [x0, y0] = posicion(RECORRIDO[0])
      ctx.moveTo(x0, y0)
      for (let i = 1; i <= largo; i++) {
        const avance = cabeza - (i - 1)
        if (avance <= 0) break
        const k = Math.min(1, avance)
        const [ax, ay] = posicion(RECORRIDO[i - 1])
        const [bx, by] = posicion(RECORRIDO[i])
        ctx.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k)
      }
      ctx.stroke()

      // 3. La punta del trazo, en oro: dónde está la mano ahora mismo.
      const idx = Math.min(largo, Math.floor(cabeza))
      const resto = cabeza - idx
      if (idx < largo) {
        const [ax, ay] = posicion(RECORRIDO[idx])
        const [bx, by] = posicion(RECORRIDO[idx + 1])
        const px = ax + (bx - ax) * resto
        const py = ay + (by - ay) * resto

        ctx.strokeStyle = oroEspecular(ctx, ax, ay, bx, by, tiempo * 0.0004)
        ctx.lineWidth = 2.2
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(px, py)
        ctx.stroke()

        // Destello en la punta: un halo suave y el punto encima.
        const halo = ctx.createRadialGradient(px, py, 0, px, py, 22)
        halo.addColorStop(0, 'rgba(242, 232, 205, 0.55)')
        halo.addColorStop(0.4, 'rgba(185, 154, 91, 0.18)')
        halo.addColorStop(1, 'rgba(185, 154, 91, 0)')
        ctx.fillStyle = halo
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(px, py, 22, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#f2e8cd'
        ctx.globalAlpha = 0.85
        ctx.beginPath()
        ctx.arc(px, py, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // 4. Los vértices. Marcas mínimas, como los puntos de construcción que
      //    quedan a la vista en un dibujo.
      ctx.fillStyle = paleta.base
      for (let i = 0; i < puntos.length; i++) {
        const [x, y] = posicion(i)
        ctx.globalAlpha = paleta.alfaBase * 1.2
        ctx.beginPath()
        ctx.arc(x, y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}

export default function Cubismo({
  tono = 'tinta',
  className = '',
}: {
  tono?: Tono
  className?: string
}) {
  const ref = useCanvasEscena(crearCubismo(tono), tono)

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
