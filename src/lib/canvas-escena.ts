'use client'

import { useEffect, useRef } from 'react'

/**
 * Motor compartido de las piezas generativas.
 *
 * Cada fondo animado necesita lo mismo: escalar por densidad de píxel,
 * rearmarse al cambiar de tamaño, apagarse fuera de pantalla y con la pestaña
 * en segundo plano, seguir el puntero con inercia, saber cuánto avanzó el
 * scroll sobre la sección, y dibujar un único cuadro resuelto cuando el
 * sistema pide menos movimiento.
 *
 * Escribirlo una vez acá evita que cada pieza repita ochenta líneas de ciclo
 * de vida y que una se olvide de apagarse. Lo propio de cada escena queda en
 * `construir` y `dibujar`, que es donde está el dibujo y nada más.
 */

export type Contexto = {
  /** Ancho y alto en píxeles CSS, no en píxeles de dispositivo. */
  ancho: number
  alto: number
  /** Milisegundos desde que arrancó el bucle. */
  tiempo: number
  /** Puntero en coordenadas del canvas, ya suavizado. */
  puntero: { x: number; y: number; activo: boolean }
  /** 0 cuando la sección entra por abajo, 1 cuando termina de salir por arriba. */
  progreso: number
  /** Sin cursor fino: pantalla táctil. */
  tactil: boolean
  /** Equipo con poca memoria: conviene bajar la densidad. */
  bajoConsumo: boolean
}

export type Escena = {
  /** Se llama al montar y en cada cambio de tamaño. Acá va la geometría. */
  construir?: (c: Contexto) => void
  dibujar: (ctx: CanvasRenderingContext2D, c: Contexto) => void
}

/**
 * La escena se entrega como fábrica, no como objeto ya hecho.
 *
 * El estado mutable de cada pieza —la lista de trazos, de capas, de hilos—
 * tiene que nacer dentro del efecto y no en el cuerpo del componente: si
 * viviera en el render, cada re-render lo pisaría a mitad de animación, y el
 * compilador de React lo rechaza con razón. La fábrica se ejecuta una sola
 * vez, dentro del efecto, y su clausura es el estado de la escena.
 */
export type FabricaEscena = () => Escena

export function useCanvasEscena(crear: FabricaEscena, clave?: unknown) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const crearRef = useRef(crear)

  // Se mantiene fresca sin leer refs durante el render.
  useEffect(() => {
    crearRef.current = crear
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const escena = crearRef.current()

    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tactil = window.matchMedia('(pointer: coarse)').matches

    const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    const bajoConsumo = memoria !== undefined && memoria <= 4

    const c: Contexto = {
      ancho: 0,
      alto: 0,
      tiempo: 0,
      puntero: { x: -9999, y: -9999, activo: false },
      progreso: 0,
      tactil,
      bajoConsumo,
    }

    // El puntero persigue su objetivo con inercia: sin esto el campo salta.
    const objetivo = { x: -9999, y: -9999 }

    const construir = () => {
      const rect = canvas.getBoundingClientRect()
      c.ancho = rect.width
      c.alto = rect.height
      if (c.ancho === 0 || c.alto === 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, bajoConsumo ? 1.5 : 2)
      canvas.width = Math.round(c.ancho * dpr)
      canvas.height = Math.round(c.alto * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      escena.construir?.(c)
    }

    const medirProgreso = () => {
      const rect = canvas.getBoundingClientRect()
      const total = window.innerHeight + rect.height
      const recorrido = window.innerHeight - rect.top
      c.progreso = Math.min(1, Math.max(0, recorrido / total))
    }

    let cuadro = 0
    let corriendo = false

    const bucle = (t: number) => {
      c.tiempo = t
      c.puntero.x += (objetivo.x - c.puntero.x) * 0.09
      c.puntero.y += (objetivo.y - c.puntero.y) * 0.09
      medirProgreso()
      if (c.ancho > 0 && c.alto > 0) {
        ctx.clearRect(0, 0, c.ancho, c.alto)
        escena.dibujar(ctx, c)
      }
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
      if (!c.puntero.activo) {
        c.puntero.x = objetivo.x
        c.puntero.y = objetivo.y
        c.puntero.activo = true
      }
    }

    const alSalir = () => {
      c.puntero.activo = false
    }

    const cuadroQuieto = () => {
      medirProgreso()
      if (c.ancho === 0 || c.alto === 0) return
      ctx.clearRect(0, 0, c.ancho, c.alto)
      escena.dibujar(ctx, c)
    }

    construir()
    if (menosMovimiento) cuadroQuieto()

    const observadorTamano = new ResizeObserver(() => {
      construir()
      if (menosMovimiento) cuadroQuieto()
    })
    observadorTamano.observe(canvas)

    const observadorVista = new IntersectionObserver(
      ([entrada]) => (entrada.isIntersecting ? arrancar() : parar()),
      { threshold: 0 },
    )
    observadorVista.observe(canvas)

    const alCambiarVisibilidad = () => (document.hidden ? parar() : arrancar())
    document.addEventListener('visibilitychange', alCambiarVisibilidad)

    if (!tactil) {
      window.addEventListener('pointermove', alMover, { passive: true })
      window.addEventListener('pointerout', alSalir, { passive: true })
    }

    return () => {
      parar()
      observadorTamano.disconnect()
      observadorVista.disconnect()
      document.removeEventListener('visibilitychange', alCambiarVisibilidad)
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerout', alSalir)
    }
    // La escena se rehace solo si cambia la clave (por ejemplo, el tono).
  }, [clave])

  return canvasRef
}

/** Interpolación suave entre 0 y 1. Aparece en todas las escenas. */
export function suave(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/** Ruido determinista y barato. Sin dependencias, mismo valor por semilla. */
export function azar(semilla: number): number {
  const v = Math.sin(semilla * 12.9898) * 43758.5453
  return v - Math.floor(v)
}
