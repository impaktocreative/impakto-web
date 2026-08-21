'use client'

import { useCanvasEscena, suave, azar, type Contexto, type FabricaEscena } from '@/lib/canvas-escena'
import { ORO_CLARO, ORO_PALIDO } from './paleta'

/**
 * Escultura viva.
 *
 * La misma pieza que generamos como imagen, pero calculada cuadro a cuadro:
 * miles de filamentos que describen una superficie retorcida en tres
 * dimensiones, con el moiré que aparece solo donde los hilos se cruzan.
 *
 * La diferencia con una imagen es que acá la escultura existe de verdad en el
 * espacio. Gira con el puntero, se retuerce con el scroll y el eje de luz
 * dorada la atraviesa desde donde está el cursor. Una imagen fija se puede
 * deformar, pero no se puede mirar desde otro lado; esta sí.
 *
 * Va en canvas 2D y no en WebGL a propósito: la geometría es de líneas, no de
 * superficies, y las líneas no necesitan un runtime de 3D para proyectarse.
 * Un shader daría profundidad de campo real, pero cuesta el bundle entero.
 *
 * ## Cómo está construida
 *
 * Cada cinta es una curva paramétrica en 3D. Alrededor de esa curva se
 * dibujan varios hilos desplazados en la normal, y es el cruce entre hilos de
 * cintas distintas lo que produce la trama. La densidad hace la forma: ningún
 * hilo suelto se ve, se ve la masa.
 */

type Cinta = {
  /** Desplazamiento de fase sobre el nudo base. Mantiene la forma, cambia el hilo. */
  fase: number
  /** Escala respecto del nudo base. Muy cerca de 1: es un haz, no un enjambre. */
  escala: number
  /** Inclinación propia, en radianes. Chica: agrupa en vez de dispersar. */
  ladeo: number
  hilos: number
  dorada: boolean
}

const CINTAS_ESCRITORIO = 26
const CINTAS_TACTIL = 10
const PASOS = 128

export default function EsculturaViva({
  className = '',
  /** Fondo claro: hilos oscuros. Fondo oscuro: hilos claros. */
  tono = 'claro',
}: {
  className?: string
  tono?: 'claro' | 'oscuro'
}) {
  const ref = useCanvasEscena(crearEscultura(tono), tono)

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}

function crearEscultura(tono: 'claro' | 'oscuro'): FabricaEscena {
  return () => {
    let cintas: Cinta[] = []
    // La rotación persigue al puntero con inercia: la escultura tiene peso.
    const giro = { x: 0, y: 0, objX: 0, objY: 0 }

    const hilo = tono === 'claro' ? '90, 88, 82' : '236, 234, 229'
    const alfaHilo = tono === 'claro' ? 0.07 : 0.055

    const construir = (c: Contexto) => {
      const cantidad = c.tactil || c.bajoConsumo ? CINTAS_TACTIL : CINTAS_ESCRITORIO

      // Todas las cintas son el mismo nudo, corrido un poco. Antes cada una
      // tenía su propia geometría y el resultado era una maraña sin forma:
      // veintiséis curvas distintas cruzándose no son una escultura, son
      // ruido. Un haz de copias de la misma curva sí tiene silueta.
      cintas = Array.from({ length: cantidad }, (_, i) => {
        const t = i / (cantidad - 1)
        return {
          fase: t * 0.42 + azar(i * 2.7) * 0.05,
          escala: 0.9 + t * 0.16,
          ladeo: (t - 0.5) * 0.34 + (azar(i * 8.1) - 0.5) * 0.05,
          hilos: c.tactil || c.bajoConsumo ? 5 : 11,
          // Una sola cinta dorada. El oro es el eje de luz, no un color más.
          dorada: i === Math.floor(cantidad * 0.55),
        }
      })
    }

    const dibujar = (ctx: CanvasRenderingContext2D, c: Contexto) => {
      if (!cintas.length) return
      const { ancho, alto, tiempo, puntero, progreso } = c

      const cx = ancho * 0.5
      const cy = alto * 0.5
      const escala = Math.min(ancho, alto) * 0.34
      const distancia = 3.2

      // El puntero gira la pieza. Sin puntero gira sola, muy despacio.
      if (puntero.activo && !c.tactil) {
        giro.objY = (puntero.x / ancho - 0.5) * 1.1
        giro.objX = (puntero.y / alto - 0.5) * 0.62
      } else {
        giro.objY = Math.sin(tiempo * 0.00009) * 0.42
        giro.objX = Math.cos(tiempo * 0.00007) * 0.2
      }
      giro.x += (giro.objX - giro.x) * 0.045
      giro.y += (giro.objY - giro.y) * 0.045

      // El scroll retuerce la superficie: entra abierta, se cierra al pasar
      // por el centro de la pantalla y vuelve a abrirse al salir.
      const torsion = 0.72 + Math.sin(progreso * Math.PI) * 0.45
      const giroPropio = tiempo * 0.00006

      const senX = Math.sin(giro.x)
      const cosX = Math.cos(giro.x)
      const senY = Math.sin(giro.y)
      const cosY = Math.cos(giro.y)

      /**
       * Punto de la cinta en 3D, ya rotado y proyectado a pantalla.
       *
       * La curva base es un nudo tórico: da la vuelta P veces alrededor del
       * eje mientras da Q vueltas alrededor del tubo. Cierra sobre sí mismo,
       * así que tiene silueta y no se escapa del encuadre, y al ser el mismo
       * nudo para todas las cintas el conjunto se lee como un cuerpo.
       */
      const P = 3
      const Q = 7

      const proyectar = (cinta: Cinta, t: number, desvio: number) => {
        const u = t * Math.PI * 2 + cinta.fase + giroPropio

        // La torsión del scroll aprieta o afloja el tubo del nudo.
        const r = (2 + Math.cos(Q * u) * torsion) / 3

        let x = r * Math.cos(P * u)
        let y = r * Math.sin(P * u)
        let z = -Math.sin(Q * u) * 0.42 * torsion

        // Los hilos de una misma cinta se separan en la normal del tubo: es
        // ese desfase mínimo el que produce el moiré donde se cruzan.
        const n = Math.cos(Q * u)
        x += Math.cos(P * u) * desvio * n
        y += Math.sin(P * u) * desvio * n
        z += desvio * 0.6

        // Ladeo propio de la cinta, para que el haz tenga volumen.
        const senL = Math.sin(cinta.ladeo)
        const cosL = Math.cos(cinta.ladeo)
        const xl = x * cosL - y * senL
        const yl = x * senL + y * cosL

        const s = cinta.escala
        // Rotación en Y, después en X.
        const x1 = xl * s * cosY - z * s * senY
        const z1 = xl * s * senY + z * s * cosY
        const y1 = yl * s * cosX - z1 * senX
        const z2 = yl * s * senX + z1 * cosX

        const p = distancia / (distancia - z2)
        return { x: cx + x1 * escala * p, y: cy + y1 * escala * p, p }
      }

      ctx.lineCap = 'round'
      ctx.lineWidth = 0.65

      for (let i = 0; i < cintas.length; i++) {
        const cinta = cintas[i]

        for (let h = 0; h < cinta.hilos; h++) {
          const desvio = ((h / (cinta.hilos - 1)) - 0.5) * 0.055

          ctx.beginPath()
          let profundidadMedia = 0

          for (let s = 0; s <= PASOS; s++) {
            const punto = proyectar(cinta, s / PASOS, desvio)
            profundidadMedia += punto.p
            if (s === 0) ctx.moveTo(punto.x, punto.y)
            else ctx.lineTo(punto.x, punto.y)
          }

          profundidadMedia /= PASOS + 1
          // Lo que está más cerca pesa más: es toda la profundidad que hace
          // falta, sin desenfoque ni sombras.
          const cerca = suave((profundidadMedia - 0.72) * 1.6)

          if (cinta.dorada) {
            ctx.strokeStyle = h % 2 === 0 ? ORO_CLARO : ORO_PALIDO
            ctx.globalAlpha = 0.14 + cerca * 0.4
            ctx.lineWidth = 0.9
          } else {
            ctx.strokeStyle = `rgb(${hilo})`
            ctx.globalAlpha = alfaHilo + cerca * 0.14
            ctx.lineWidth = 0.65
          }
          ctx.stroke()
        }
      }

      // El destello: donde el eje de luz corta la pieza. Sigue al puntero, y
      // sin puntero se queda en el corazón de la escultura.
      const lx = puntero.activo && !c.tactil ? puntero.x : cx + Math.sin(tiempo * 0.00013) * ancho * 0.12
      const ly = puntero.activo && !c.tactil ? puntero.y : cy + Math.cos(tiempo * 0.00017) * alto * 0.1
      const radio = Math.min(ancho, alto) * 0.38

      const luz = ctx.createRadialGradient(lx, ly, 0, lx, ly, radio)
      luz.addColorStop(0, 'rgba(242, 232, 205, 0.28)')
      luz.addColorStop(0.32, 'rgba(217, 196, 140, 0.12)')
      luz.addColorStop(1, 'rgba(185, 154, 91, 0)')
      ctx.globalCompositeOperation = tono === 'claro' ? 'multiply' : 'lighter'
      ctx.globalAlpha = tono === 'claro' ? 0.55 : 1
      ctx.fillStyle = luz
      ctx.fillRect(0, 0, ancho, alto)

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    return { construir, dibujar }
  }
}
