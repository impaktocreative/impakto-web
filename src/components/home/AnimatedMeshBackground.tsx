"use client";

import { useEffect, useMemo, useState } from "react";

const COLS = 32;
const ROWS = 19;

function buildPoint(col: number, row: number, phase: number) {
  const u = col / (COLS - 1);
  const v = row / (ROWS - 1);

  const horizon = 30;
  const depth = Math.pow(v, 1.85);
  const spread = 108 + depth * 84;
  const x = 50 + (u - 0.5) * spread;

  const baseY = horizon + depth * 70;
  const waveScale = 1 - v * 0.58;
  const waveA = Math.sin(u * 10 + phase * 0.82 + row * 0.22) * (2.15 * waveScale);
  const waveB = Math.cos(u * 7.2 - phase * 0.52 + row * 0.42) * (1.22 * (1 - v * 0.35));
  const crest =
    Math.sin(u * 4.8 + phase * 0.44) *
    0.85 *
    (1 - v) *
    (1.18 - Math.abs(u - 0.5));

  return {
    x,
    y: baseY + waveA + waveB + crest,
  };
}

export default function AnimatedMeshBackground() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let frame = 0;
    let raf = 0;

    const animate = () => {
      frame += 1;
      setPhase(frame * 0.012);
      raf = window.requestAnimationFrame(animate);
    };

    raf = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const points = useMemo(
    () =>
      Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => buildPoint(col, row, phase))
      ),
    [phase]
  );

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-[-10%] h-[84%] w-full opacity-86"
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

      {Array.from({ length: COLS }, (_, colIndex) => (
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
