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
  radio: number
  vueltas: number
  faseA: number
  faseB: number
  amplitud: number
  hilos: number
  dorada: boolean
}

const CINTAS_ESCRITORIO = 26
const CINTAS_TACTIL = 10
const PASOS = 52

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

      cintas = Array.from({ length: cantidad }, (_, i) => {
        const t = i / (cantidad - 1)
        return {
          radio: 0.42 + t * 0.5,
          // Vueltas no enteras: los hilos nunca cierran sobre sí mismos y por
          // eso el cruce produce trama en vez de un patrón repetido.
          vueltas: 2 + azar(i * 5.3) * 3.4,
          faseA: azar(i * 2.7) * Math.PI * 2,
          faseB: azar(i * 8.1) * Math.PI * 2,
          amplitud: 0.18 + azar(i * 3.9) * 0.42,
          hilos: c.tactil || c.bajoConsumo ? 6 : 15,
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
      const escala = Math.min(ancho, alto) * 0.5
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
      const torsion = 0.55 + Math.sin(progreso * Math.PI) * 0.85
      const giroPropio = tiempo * 0.00006

      const senX = Math.sin(giro.x)
      const cosX = Math.cos(giro.x)
      const senY = Math.sin(giro.y)
      const cosY = Math.cos(giro.y)

      /** Punto de la cinta en 3D, ya rotado y proyectado a pantalla. */
      const proyectar = (cinta: Cinta, t: number, desvio: number) => {
        const a = t * Math.PI * 2 * cinta.vueltas + cinta.faseA + giroPropio
        const b = t * Math.PI * 2 + cinta.faseB

        // Curva base: un lazo que se pliega sobre sí mismo. La torsión del
        // scroll cambia cuánto se pliega.
        let x = Math.cos(a) * cinta.radio + Math.cos(b) * cinta.amplitud * torsion
        const y = Math.sin(b) * cinta.radio * 0.72 + Math.sin(a * 0.5) * cinta.amplitud
        let z = Math.sin(a) * cinta.radio * 0.6 + Math.cos(b * 1.5) * cinta.amplitud * torsion

        // Los hilos de una misma cinta se separan en la normal aproximada.
        x += Math.cos(b + Math.PI / 2) * desvio
        z += Math.sin(b + Math.PI / 2) * desvio

        // Rotación en Y, después en X.
        const x1 = x * cosY - z * senY
        const z1 = x * senY + z * cosY
        const y1 = y * cosX - z1 * senX
        const z2 = y * senX + z1 * cosX

        const p = distancia / (distancia - z2)
        return { x: cx + x1 * escala * p, y: cy + y1 * escala * p, p }
      }

      ctx.lineCap = 'round'
      ctx.lineWidth = 0.65

      for (let i = 0; i < cintas.length; i++) {
        const cinta = cintas[i]

        for (let h = 0; h < cinta.hilos; h++) {
          const desvio = ((h / (cinta.hilos - 1)) - 0.5) * 0.085

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
