"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ScrollStageProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  margin?: string;
};

export default function ScrollStage({ children, className, delay = 0, margin = "-12% 0px -10% 0px" }: ScrollStageProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 48, scale: 0.982, filter: "blur(12px)" }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin }}
      transition={
        prefersReducedMotion
          ? { duration: 0.01 }
          : { duration: 1.05, delay, ease: EASE_LUXURY }
      }
      className={className}
      style={{ transformOrigin: "50% 40%" }}
    >
      {children}
    </motion.div>
  );
}
