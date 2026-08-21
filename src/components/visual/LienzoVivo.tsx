'use client'

import { useEffect, useRef } from 'react'
import { suave } from '@/lib/canvas-escena'

/**
 * Lienzo vivo.
 *
 * Toma una imagen fija y la pone en movimiento: la dibuja en franjas que se
 * desplazan según dónde está el cursor y cuánto avanzó el scroll, con una
 * banda de luz dorada que sigue al puntero.
 *
 * La idea es que la pieza no sea una foto colgada sino una superficie que
 * responde. Una escultura de filamentos mirada a través de vidrio que se
 * mueve: los hilos se corren donde pasás la mano y vuelven a su sitio cuando
 * te alejás.
 *
 * Va en canvas 2D y no en WebGL a propósito. Un shader daría refracción de
 * verdad, pero cuesta un runtime entero en el bundle; el desplazamiento por
 * franjas da el noventa por ciento del efecto por unos pocos kilobytes, que
 * en un sitio que carga en 140ms es la diferencia que importa.
 *
 * Sin JavaScript, con `prefers-reduced-motion` o mientras la imagen carga, se
 * ve la imagen tal cual debajo: el canvas es una capa encima, nunca la única
 * forma de ver la pieza.
 */

type Props = {
  src: string
  /** Alto de cada franja en píxeles CSS. Más chico, más suave y más caro. */
  franja?: number
  /** Desplazamiento máximo de una franja, en píxeles. */
  desvio?: number
  className?: string
}

export default function LienzoVivo({ src, franja = 14, desvio = 26, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tactil = window.matchMedia('(pointer: coarse)').matches

    const imagen = new Image()
    imagen.decoding = 'async'
    imagen.src = src

    let ancho = 0
    let alto = 0
    let progreso = 0
    let listo = false

    const puntero = { x: -9999, y: -9999, activo: false }
    const objetivo = { x: -9999, y: -9999 }

    const medir = () => {
      const rect = canvas.getBoundingClientRect()
      ancho = rect.width
      alto = rect.height
      if (ancho === 0 || alto === 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(ancho * dpr)
      canvas.height = Math.round(alto * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const total = window.innerHeight + rect.height
      progreso = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total))
    }

    /** Recorte de la imagen que cubre el lienzo sin deformarla. */
    const encuadre = () => {
      const escalaImagen = imagen.width / imagen.height
      const escalaLienzo = ancho / alto
      if (escalaImagen > escalaLienzo) {
        const w = imagen.height * escalaLienzo
        return { sx: (imagen.width - w) / 2, sy: 0, sw: w, sh: imagen.height }
      }
      const h = imagen.width / escalaLienzo
      return { sx: 0, sy: (imagen.height - h) / 2, sw: imagen.width, sh: h }
    }

    const dibujar = (tiempo: number) => {
      if (!listo || ancho === 0 || alto === 0) return
      ctx.clearRect(0, 0, ancho, alto)

      const { sx, sy, sw, sh } = encuadre()

      // El scroll acerca la pieza: entra algo más grande y se asienta al pasar
      // por el centro de la pantalla. Es profundidad, no un zoom decorativo.
      const acercamiento = 1.06 - suave(Math.sin(progreso * Math.PI)) * 0.06
      const deriva = (progreso - 0.5) * alto * 0.06

      const px = puntero.activo && !tactil ? puntero.x : ancho * 0.5
      const py = puntero.activo && !tactil ? puntero.y : alto * (0.5 + Math.sin(tiempo * 0.00016) * 0.3)
      const fuerza = puntero.activo && !tactil ? 1 : 0.35

      const franjas = Math.ceil(alto / franja)
      const altoFuente = sh / franjas

      for (let i = 0; i < franjas; i++) {
        const y = i * franja
        const centroFranja = y + franja / 2

        // Cuanto más cerca del puntero, más se corre la franja. El signo sale
        // del lado en el que está el cursor, así el material parece apartarse.
        const d = Math.abs(centroFranja - py)
        const cerca = suave(1 - d / (alto * 0.42))
        const lado = px < ancho / 2 ? 1 : -1
        const corrimiento =
          lado * cerca * desvio * fuerza +
          Math.sin(tiempo * 0.0005 + i * 0.22) * 2.2 * (0.4 + cerca)

        const anchoDibujo = ancho * acercamiento
        const altoDibujo = franja * acercamiento + 1

        ctx.drawImage(
          imagen,
          sx,
          sy + i * altoFuente,
          sw,
          altoFuente,
          corrimiento - (anchoDibujo - ancho) / 2,
          y + deriva - (altoDibujo - franja) / 2,
          anchoDibujo,
          altoDibujo,
        )
      }

      // Banda de luz dorada siguiendo al puntero. Es el reflejo especular que
      // la imagen fija no puede tener: se mueve con quien mira.
      if (fuerza > 0) {
        const brillo = ctx.createRadialGradient(px, py, 0, px, py, Math.max(ancho, alto) * 0.42)
        brillo.addColorStop(0, `rgba(242, 232, 205, ${0.16 * fuerza})`)
        brillo.addColorStop(0.35, `rgba(185, 154, 91, ${0.07 * fuerza})`)
        brillo.addColorStop(1, 'rgba(185, 154, 91, 0)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = brillo
        ctx.fillRect(0, 0, ancho, alto)
        ctx.globalCompositeOperation = 'source-over'
      }
    }

    let cuadro = 0
    let corriendo = false

    const bucle = (t: number) => {
      puntero.x += (objetivo.x - puntero.x) * 0.08
      puntero.y += (objetivo.y - puntero.y) * 0.08
      const rect = canvas.getBoundingClientRect()
      const total = window.innerHeight + rect.height
      progreso = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total))
      dibujar(t)
      cuadro = requestAnimationFrame(bucle)
    }

    const arrancar = () => {
      if (corriendo || menosMovimiento) return
      corriendo = true
      cuadro = requestAnimationFrame(bucle)
    }
    const parar = () => {
      if (!corriendo) return
      corriendo = false
      cancelAnimationFrame(cuadro)
    }

    const alMover = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      objetivo.x = e.clientX - rect.left
      objetivo.y = e.clientY - rect.top
      if (!puntero.activo) {
        puntero.x = objetivo.x
        puntero.y = objetivo.y
        puntero.activo = true
      }
    }
    const alSalir = () => {
      puntero.activo = false
    }

    imagen.onload = () => {
      listo = true
      medir()
      // Con menos movimiento se dibuja un cuadro y se deja quieto.
      if (menosMovimiento) dibujar(0)
      else arrancar()
    }

    medir()

    const observadorTamano = new ResizeObserver(() => {
      medir()
      if (menosMovimiento && listo) dibujar(0)
    })
    observadorTamano.observe(canvas)

    const observadorVista = new IntersectionObserver(
      ([entrada]) => (entrada.isIntersecting && listo ? arrancar() : parar()),
      { threshold: 0 },
    )
    observadorVista.observe(canvas)

    const alCambiarVisibilidad = () => (document.hidden ? parar() : listo && arrancar())
    document.addEventListener('visibilitychange', alCambiarVisibilidad)

    if (!tactil) {
      window.addEventListener('pointermove', alMover, { passive: true })
      window.addEventListener('pointerout', alSalir, { passive: true })
    }

    return () => {
      parar()
      imagen.onload = null
      observadorTamano.disconnect()
      observadorVista.disconnect()
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerout', alSalir)
    }
  }, [src, franja, desvio])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
