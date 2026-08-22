'use client'

import { useCanvasEscena, suave, type Contexto, type FabricaEscena } from '@/lib/canvas-escena'
import { ORO, ORO_CLARO, ORO_PALIDO } from './paleta'

/**
 * Campo armónico.
 *
 * El fondo del hero. Dos matemáticas reales trabajando juntas, que es de donde
 * sale la sensación de complejidad ordenada: se ve intrincado y sin embargo
 * nada está puesto al azar.
 *
 * 1. La retícula es una filotaxis: el punto i va en el ángulo i · 137,507°, el
 *    ángulo áureo, a distancia proporcional a la raíz de i. Es cómo se ordenan
 *    las semillas de un girasol, y produce el único empaquetado que no deja
 *    huecos ni filas. De ahí salen solas las espirales, que no se dibujan: son
 *    consecuencia de vecindades de Fibonacci (13, 21, 34 posiciones de
 *    distancia). Por eso el oro tiene motivo para estar acá y no es un adorno:
 *    la proporción que ordena el dibujo es la misma que le da nombre al color.
 *
 * 2. El brillo lo decide una figura de Chladni, la ecuación de una placa que
 *    vibra: s(u,v) = sin(nπu)·sin(mπv) − sin(mπu)·sin(nπv). Donde s se acerca a
 *    cero la placa está quieta, y ahí es donde la arena se junta en un
 *    experimento real. Los nodos de la retícula que caen sobre esas líneas se
 *    encienden en oro; el resto queda apenas insinuado en tinta.
 *
 * Los modos (n, m) se interpolan entre pares enteros, así que el patrón se
 * reorganiza solo, cada vez en una figura distinta y siempre simétrica. El
 * puntero destempla la placa: mueve el centro de la vibración, y con él todas
 * las líneas de resonancia.
 */

/** 2π / φ². El ángulo que ordena girasoles, piñas y este fondo. */
const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5))

/** Vecindades de Fibonacci: los brazos de espiral que ya están en la retícula. */
const PARASTIQUIAS = [13, 21, 34]

/**
 * Modos de vibración. Pares altos y coprimos: dan figuras densas y sin
 * simetría trivial. Con n y m cercanos el patrón se vuelve una parrilla y se
 * pierde justo lo que hace mirar.
 */
const MODOS: Array<[number, number]> = [
  [3, 7],
  [5, 8],
  [4, 11],
  [7, 12],
  [5, 13],
  [8, 11],
]

/** Cuánto dura cada figura antes de empezar a transformarse en la siguiente. */
const MS_POR_MODO = 9000

type Nodo = {
  x: number
  y: number
  /** Coordenadas normalizadas para evaluar la placa. */
  u: number
  v: number
  /** Distancia al centro, 0 a 1. Sirve para apagar los bordes. */
  radio: number
  fase: number
}

/** s(u,v) de la placa vibrante. Cero sobre las líneas nodales. */
function placa(u: number, v: number, n: number, m: number): number {
  return (
    Math.sin(n * Math.PI * u) * Math.sin(m * Math.PI * v) -
    Math.sin(m * Math.PI * u) * Math.sin(n * Math.PI * v)
  )
}

function crearCampoArmonico(): FabricaEscena {
  return () => {
    let nodos: Nodo[] = []
    let paso = 1
    // Separación típica entre vecinos. En una filotaxis es casi constante en
    // todo el disco, y es la vara para descartar uniones falsas.
    let escala = 1

    const construir = (c: Contexto) => {
      const { ancho, alto, tactil, bajoConsumo } = c

      // La cantidad sigue al área, no a un número fijo: en una pantalla ancha
      // un conteo pensado para portátil deja la retícula rala y se ve pobre.
      const area = ancho * alto
      // Píxeles cuadrados por nodo. Estaba en 3400, que sobre una pantalla de
      // escritorio daba menos de 400 nodos: con la retícula tan rala, dos
      // vecinos de Fibonacci quedaban a 140 px y los brazos se leían como
      // cuerdas rectas en vez de espirales.
      const areaPorNodo = bajoConsumo ? 1400 : tactil ? 900 : 340
      const total = Math.round(Math.min(4400, Math.max(900, area / areaPorNodo)))

      // La espiral se dimensiona contra la diagonal para que llegue a las
      // esquinas en cualquier proporción de pantalla.
      const alcance = Math.hypot(ancho, alto) * 0.58
      escala = alcance / Math.sqrt(total)

      const cx = ancho * 0.5
      const cy = alto * 0.5

      nodos = new Array(total)
      for (let i = 0; i < total; i++) {
        const angulo = i * ANGULO_AUREO
        const r = escala * Math.sqrt(i)
        const x = cx + r * Math.cos(angulo)
        const y = cy + r * Math.sin(angulo)
        nodos[i] = {
          x,
          y,
          u: x / ancho,
          v: y / alto,
          radio: Math.min(1, r / alcance),
          fase: (i % 97) / 97,
        }
      }

      // Un brazo cada tantos nodos: dibujar los tres completos sería una malla
      // sólida. Se elige el paso para que queden unas pocas espirales legibles.
      paso = total > 3000 ? 2 : 1
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (!nodos.length) return
      const { ancho, alto, tiempo, puntero, progreso, tactil } = c

      // Interpolación entre dos modos enteros. La curva suave en el tramo
      // final hace que cada figura se sostenga y recién después se deshaga,
      // en vez de estar transformándose todo el tiempo.
      const t = tiempo / MS_POR_MODO
      const indice = Math.floor(t) % MODOS.length
      const siguiente = (indice + 1) % MODOS.length
      const mezcla = suave(Math.max(0, (t % 1) - 0.55) / 0.45)

      const [n0, m0] = MODOS[indice]!
      const [n1, m1] = MODOS[siguiente]!
      const n = n0 + (n1 - n0) * mezcla
      const m = m0 + (m1 - m0) * mezcla

      // El puntero destempla la placa: corre el origen de la vibración, así que
      // todas las líneas nodales se reacomodan siguiéndolo. Sin cursor el
      // centro deriva solo para que la pieza nunca quede quieta.
      const px = puntero.activo && !tactil ? puntero.x / ancho : 0.5 + Math.sin(tiempo * 0.00011) * 0.22
      const py = puntero.activo && !tactil ? puntero.y / alto : 0.5 + Math.cos(tiempo * 0.00014) * 0.2
      const du = (px - 0.5) * 0.55
      const dv = (py - 0.5) * 0.55

      // Un giro lentísimo del conjunto. Es lo que hace que la retícula se lea
      // como un objeto y no como una textura pegada al fondo.
      const giro = tiempo * 0.000035 + progreso * 0.22
      const cos = Math.cos(giro)
      const sen = Math.sin(giro)
      const cx = ancho * 0.5
      const cy = alto * 0.5

      const proyectar = (nodo: Nodo) => {
        const dx = nodo.x - cx
        const dy = nodo.y - cy
        return { x: cx + dx * cos - dy * sen, y: cy + dx * sen + dy * cos }
      }

      // El destello recorre la espiral: es una onda que viaja por el índice, no
      // un parpadeo por nodo. Así se ve corriente circulando y no ruido.
      const onda = (tiempo % 5200) / 5200

      // ── Brazos ──────────────────────────────────────────────────────────
      // Se dibujan primero para que los nodos encendidos queden encima.
      ctx.lineCap = 'round'
      for (const salto of PARASTIQUIAS) {
        for (let i = 0; i < nodos.length - salto; i += paso) {
          const a = nodos[i]!
          const b = nodos[i + salto]!

          const resonancia =
            1 -
            suave(
              Math.min(1, Math.abs(placa(a.u + du, a.v + dv, n, m)) * 0.82),
            )
          if (resonancia < 0.06) continue

          const desvanece = 1 - suave(Math.max(0, a.radio - 0.55) / 0.45)
          if (desvanece <= 0.02) continue

          const pa = proyectar(a)
          const pb = proyectar(b)

          // La parastiquia es una vecindad local: i e i+34 son contiguos solo
          // donde la retícula ya está poblada. Cerca del centro están a media
          // pantalla de distancia, y unirlos dibujaba cuerdas rectas que
          // atravesaban todo. Se descarta por longitud, que es la forma
          // honesta: si no son vecinos, no hay brazo que dibujar.
          const largo = Math.hypot(pb.x - pa.x, pb.y - pa.y)
          if (largo > escala * 3.6) continue

          // El destello pasa una vez por vuelta por cada nodo.
          const brillo = Math.max(0, 1 - Math.abs(((a.fase - onda + 1) % 1) - 0.5) * 7)

          const intensidad = resonancia * desvanece
          ctx.beginPath()
          ctx.moveTo(pa.x, pa.y)
          ctx.lineTo(pb.x, pb.y)
          ctx.strokeStyle = brillo > 0.35 ? ORO_CLARO : ORO
          ctx.globalAlpha = intensidad * intensidad * (0.42 + brillo * 0.95)
          ctx.lineWidth = 0.7 + brillo * 1.25
          ctx.stroke()
        }
      }

      // ── Nodos ───────────────────────────────────────────────────────────
      for (let i = 0; i < nodos.length; i++) {
        const nodo = nodos[i]!
        const s = Math.abs(placa(nodo.u + du, nodo.v + dv, n, m))
        const resonancia = 1 - suave(Math.min(1, s * 0.82))
        const desvanece = 1 - suave(Math.max(0, nodo.radio - 0.55) / 0.45)
        if (desvanece <= 0.02) continue

        const p = proyectar(nodo)
        const brillo = Math.max(0, 1 - Math.abs(((nodo.fase - onda + 1) % 1) - 0.5) * 7)

        if (resonancia > 0.42) {
          // Sobre la línea nodal: oro, y el que además recibe el destello se
          // abre en un punto de luz.
          const fuerza = (resonancia - 0.42) / 0.58
          ctx.beginPath()
          ctx.arc(p.x, p.y, 0.7 + fuerza * 1.1 + brillo * 1.4, 0, Math.PI * 2)
          ctx.fillStyle = brillo > 0.45 ? ORO_PALIDO : ORO_CLARO
          ctx.globalAlpha = desvanece * (0.3 + fuerza * 0.62 + brillo * 0.55)
          ctx.fill()
        } else {
          // Fuera de resonancia queda la retícula insinuada, que es lo que
          // permite ver que el orden estaba ahí todo el tiempo.
          ctx.beginPath()
          ctx.arc(p.x, p.y, 0.65, 0, Math.PI * 2)
          ctx.fillStyle = '#161615'
          ctx.globalAlpha = desvanece * 0.16
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}

export default function CampoArmonico({ className = '' }: { className?: string }) {
  const ref = useCanvasEscena(crearCampoArmonico())

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
