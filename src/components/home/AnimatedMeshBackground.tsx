"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const GRID = {
  hero: { cols: 36, rows: 22 },
  full: { cols: 34, rows: 21 },
  mobile: { cols: 22, rows: 14 },
};

function buildPoint(
  col: number,
  row: number,
  cols: number,
  rows: number,
  phase: number,
  pointer: { x: number; y: number; active: boolean },
  variant: "hero" | "full"
) {
  const u = col / (cols - 1);
  const v = row / (rows - 1);

  const horizon = variant === "full" ? 8 : 30;
  const depth = Math.pow(v, 2.08);
  const spread = 92 + depth * 182;
  const x = 50 + (u - 0.5) * spread;

  const baseY = horizon + depth * (variant === "full" ? 90 : 72);
  const waveScale = 0.25 + (1 - v) * 0.88;
  const waveA = Math.sin(u * 10.8 + phase * 0.82 + row * 0.22) * (3.1 * waveScale);
  const waveB = Math.cos(u * 8.1 - phase * 0.54 + row * 0.44) * (2.05 * (0.28 + (1 - v) * 0.72));
  const waveC = Math.sin(u * 17.4 + phase * 0.49 - row * 0.2) * (1.26 * (0.2 + (1 - v) * 0.8));
  const waveD = Math.cos(u * 5.8 + phase * 0.31 + row * 0.18) * (0.88 * (1 - v) * (1.08 - Math.abs(u - 0.5)));
  const crest =
    Math.sin(u * 4.9 + phase * 0.44) *
    1.25 *
    (1 - v) *
    (1.22 - Math.abs(u - 0.5));

  const dx = pointer.x - u;
  const dy = pointer.y - v;
  const radius = 0.24;
  const distance = dx * dx + dy * dy;
  const influence = pointer.active ? Math.exp(-distance / (radius * radius)) : 0;
  const strength = influence * (0.55 + v * 0.7);
  const magnetX = dx * strength * 28;
  const magnetY = dy * strength * 18;

  return {
    x: x + magnetX,
    y: baseY + waveA + waveB + waveC + waveD + crest + magnetY,
  };
}

export default function AnimatedMeshBackground({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "full";
  className?: string;
}) {
  const [frameState, setFrameState] = useState({
    phase: 0,
    pointer: { x: 0.5, y: 0.72, active: false },
  });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pointerTargetRef = useRef({ x: 0.5, y: 0.72, active: false });
  const pointerSmoothRef = useRef({ x: 0.5, y: 0.72, active: false });

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const syncQueries = () => {
      setReduceMotion(reducedMotionQuery.matches);
      setIsMobile(mobileQuery.matches);
    };

    syncQueries();
    reducedMotionQuery.addEventListener("change", syncQueries);
    mobileQuery.addEventListener("change", syncQueries);

    return () => {
      reducedMotionQuery.removeEventListener("change", syncQueries);
      mobileQuery.removeEventListener("change", syncQueries);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let raf = 0;
    let phase = 0;
    let lastTime = 0;
    const fpsInterval = 1000 / 30;
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

    const onMouseMove = (event: MouseEvent) => {
      pointerTargetRef.current = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
        active: true,
      };
    };

    const onMouseLeave = () => {
      pointerTargetRef.current.active = false;
    };

    if (supportsFinePointer) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mouseleave", onMouseLeave);
    }

    const animate = (time: number) => {
      if (document.hidden) {
        raf = window.requestAnimationFrame(animate);
        return;
      }

      if (lastTime && time - lastTime < fpsInterval) {
        raf = window.requestAnimationFrame(animate);
        return;
      }

      const delta = lastTime ? (time - lastTime) / 1000 : 1 / 60;
      lastTime = time;
      phase += delta * 0.72;

      pointerSmoothRef.current.x +=
        (pointerTargetRef.current.x - pointerSmoothRef.current.x) * 0.09;
      pointerSmoothRef.current.y +=
        (pointerTargetRef.current.y - pointerSmoothRef.current.y) * 0.09;
      pointerSmoothRef.current.active = pointerTargetRef.current.active;

      setFrameState({
        phase,
        pointer: { ...pointerSmoothRef.current },
      });

      raf = window.requestAnimationFrame(animate);
    };

    raf = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(raf);
      if (supportsFinePointer) {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [reduceMotion]);

  const grid = useMemo(() => {
    if (isMobile) {
      return GRID.mobile;
    }

    return variant === "full" ? GRID.full : GRID.hero;
  }, [variant, isMobile]);

  const renderedState = useMemo(() => {
    if (!reduceMotion) {
      return frameState;
    }

    return {
      phase: 0,
      pointer: { ...frameState.pointer, active: false },
    };
  }, [frameState, reduceMotion]);

  const points = useMemo(
    () =>
      Array.from({ length: grid.rows }, (_, row) =>
        Array.from({ length: grid.cols }, (_, col) =>
          buildPoint(col, row, grid.cols, grid.rows, renderedState.phase, renderedState.pointer, variant)
        )
      ),
    [grid.cols, grid.rows, renderedState.phase, renderedState.pointer, variant]
  );

  const meshClassName =
    variant === "full"
      ? "absolute inset-0 h-full w-full opacity-88"
      : "absolute inset-x-0 bottom-[-10%] h-[84%] w-full opacity-86";

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className ? `${meshClassName} ${className}` : meshClassName}
      aria-hidden="true"
    >
      {points.map((row, rowIndex) => (
        <g key={`row-${rowIndex}`}>
          <path
            d={row.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="rgba(191,168,118,0.46)"
            strokeWidth="0.075"
          />
        </g>
      ))}

      {Array.from({ length: grid.cols }, (_, colIndex) => (
        <path
          key={`col-${colIndex}`}
          d={points.map((row, rowIndex) => `${rowIndex === 0 ? "M" : "L"}${row[colIndex].x},${row[colIndex].y}`).join(" ")}
          fill="none"
          stroke="rgba(191,168,118,0.4)"
          strokeWidth="0.075"
        />
      ))}

      {points.flatMap((row, rowIndex) =>
        row.map((point, colIndex) => (
          <circle
            key={`dot-${rowIndex}-${colIndex}`}
            cx={point.x}
            cy={point.y}
            r="0.16"
            fill="rgba(191,168,118,0.78)"
          />
        ))
      )}
    </svg>
  );
}
