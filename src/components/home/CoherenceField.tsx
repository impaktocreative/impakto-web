"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de coherencia.
 *
 * Una grilla de flechas que lejos del puntero apuntan cada una a su lado y
 * cerca giran todas hacia él. Es la propuesta del estudio dibujada: marcas
 * dispersas que encuentran dirección, y la dirección es un punto concreto,
 * no una tendencia difusa.
 *
 * Antes se alineaban a un ángulo común y el efecto se leía como "se peinan".
 * Apuntando al cursor se lee lo otro: hay un norte y todo se ordena hacia él.
 * El oro solo aparece donde la alineación es máxima, así que sigue siendo
 * consecuencia del orden y no decoración encima.
 *
 * Todo el trabajo por cuadro va en canvas 2D sobre un ref: React no
 * re-renderiza durante la animación. El bucle se apaga cuando la sección
 * sale de pantalla o la pestaña pasa a segundo plano, y con
 * `prefers-reduced-motion` se dibuja un único cuadro ya resuelto.
 */

type Stroke = {
  x: number;
  y: number;
  angle: number;
  phase: number;
};

const SPACING_DESKTOP = 26;
const SPACING_MOBILE = 30;
const BASE_LENGTH = 9;
const ALIGNED_LENGTH = 22;
const INFLUENCE = 420;
const GOLD_THRESHOLD = 0.74;

function shortestAngleDelta(from: number, to: number) {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

export default function CoherenceField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    // Los equipos con poca memoria reciben una grilla más rala y menos
    // densidad de píxel: el efecto se sostiene, el costo baja.
    const lowPower =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;

    let strokes: Stroke[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const spacing = (coarsePointer ? SPACING_MOBILE : SPACING_DESKTOP) * (lowPower ? 1.35 : 1);
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      strokes = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // El jitter evita que se lea como cuadrícula de software.
          const jitterX = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
          const jitterY = Math.sin(col * 39.3468 + row * 11.135) * 24634.6345;
          strokes.push({
            x: col * spacing + (jitterX - Math.floor(jitterX) - 0.5) * spacing * 0.55,
            y: row * spacing + (jitterY - Math.floor(jitterY) - 0.5) * spacing * 0.55,
            angle: (jitterX - Math.floor(jitterX)) * Math.PI * 2,
            phase: (jitterY - Math.floor(jitterY)) * Math.PI * 2,
          });
        }
      }
    };

    const draw = (time: number) => {
      if (width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);


      // En touch no hay cursor: un foco de atención recorre el campo solo,
      // así el fenómeno se lee igual sin input.
      let px = pointer.x;
      let py = pointer.y;
      if (coarsePointer || !pointer.active) {
        px = width * (0.5 + Math.sin(time * 0.00013) * 0.32);
        py = height * (0.5 + Math.cos(time * 0.00019) * 0.3);
      }

      const influence = Math.min(
        coarsePointer ? INFLUENCE * 0.62 : INFLUENCE,
        Math.min(width, height) * 0.62,
      );
      // Sin cursor no hay lectura de "oro ganado por el orden": en touch
      // el campo queda como textura de tinta y el oro es cosa de escritorio.
      const goldThreshold = coarsePointer ? 1.1 : GOLD_THRESHOLD;
      const influenceSq = influence * influence;

      ctx.lineCap = "round";

      // Dos pasadas: primero toda la tinta, después los destellos dorados.
      // Agrupar por color evita cambiar el estado del contexto por trazo.
      ctx.strokeStyle = "#161615";
      ctx.lineWidth = 1;
      const gold: { x: number; y: number; angle: number; k: number; len: number }[] = [];

      ctx.beginPath();
      let currentAlpha = -1;

      for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        const dx = s.x - px;
        const dy = s.y - py;
        const distSq = dx * dx + dy * dy;

        let coherence = 0;
        if (distSq < influenceSq) {
          const t = 1 - Math.sqrt(distSq) / influence;
          coherence = t * t * (3 - 2 * t); // smoothstep
        }

        // Cada flecha apunta a donde está el foco, no a un ángulo común.
        const aimAngle = Math.atan2(py - s.y, px - s.x);
        const drift = Math.sin(time * 0.0004 + s.phase) * 0.09;
        const angle = s.angle + drift + shortestAngleDelta(s.angle + drift, aimAngle) * coherence;
        const len = BASE_LENGTH + (ALIGNED_LENGTH - BASE_LENGTH) * coherence;
        const alpha = (coarsePointer ? 0.07 : 0.12) + coherence * (coarsePointer ? 0.16 : 0.3);

        // Redondear la opacidad agrupa los trazos en pocos batches.
        const quantized = Math.round(alpha * 20) / 20;
        if (quantized !== currentAlpha) {
          ctx.stroke();
          ctx.globalAlpha = quantized;
          ctx.beginPath();
          currentAlpha = quantized;
        }

        const hx = (Math.cos(angle) * len) / 2;
        const hy = (Math.sin(angle) * len) / 2;
        const puntaX = s.x + hx;
        const puntaY = s.y + hy;
        ctx.moveTo(s.x - hx, s.y - hy);
        ctx.lineTo(puntaX, puntaY);

        // La punta aparece a medida que la flecha se orienta: dispersa es un
        // trazo, orientada es una flecha.
        if (coherence > 0.16) {
          const ala = Math.min(5, len * 0.34) * coherence;
          const abre = 0.42;
          ctx.moveTo(puntaX, puntaY);
          ctx.lineTo(puntaX - Math.cos(angle - abre) * ala, puntaY - Math.sin(angle - abre) * ala);
          ctx.moveTo(puntaX, puntaY);
          ctx.lineTo(puntaX - Math.cos(angle + abre) * ala, puntaY - Math.sin(angle + abre) * ala);
        }

        if (coherence > goldThreshold) {
          gold.push({
            x: s.x,
            y: s.y,
            angle,
            k: (coherence - goldThreshold) / (1 - goldThreshold),
            len,
          });
        }
      }
      ctx.stroke();

      // El oro: solo donde el campo llegó a alinearse del todo.
      if (gold.length) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#b99a5b";
        let goldAlpha = -1;
        ctx.beginPath();
        for (let i = 0; i < gold.length; i++) {
          const g = gold[i];
          const quantized = Math.round(g.k * 0.85 * 16) / 16;
          if (quantized !== goldAlpha) {
            ctx.stroke();
            ctx.globalAlpha = quantized;
            ctx.beginPath();
            goldAlpha = quantized;
          }
          const hx = (Math.cos(g.angle) * g.len * 0.62) / 2;
          const hy = (Math.sin(g.angle) * g.len * 0.62) / 2;
          const px2 = g.x + hx;
          const py2 = g.y + hy;
          ctx.moveTo(g.x - hx, g.y - hy);
          ctx.lineTo(px2, py2);
          const ala = Math.min(5, g.len * 0.34);
          ctx.moveTo(px2, py2);
          ctx.lineTo(px2 - Math.cos(g.angle - 0.42) * ala, py2 - Math.sin(g.angle - 0.42) * ala);
          ctx.moveTo(px2, py2);
          ctx.lineTo(px2 - Math.cos(g.angle + 0.42) * ala, py2 - Math.sin(g.angle + 0.42) * ala);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    let frame = 0;
    let running = false;

    const loop = (time: number) => {
      // El puntero persigue su objetivo con inercia para que el campo
      // se sienta con peso y no salte.
      pointer.x += (pointer.tx - pointer.x) * 0.09;
      pointer.y += (pointer.ty - pointer.y) * 0.09;
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
      if (!pointer.active) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
        pointer.active = true;
      }
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    build();

    if (reduceMotion) {
      // Un solo cuadro, ya resuelto, sin bucle.
      draw(0);
    }

    const resizeObserver = new ResizeObserver(() => {
      build();
      if (reduceMotion) draw(0);
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    if (!coarsePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerout", onPointerLeave, { passive: true });
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
