"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  margin?: string;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  duration = 0.75,
  margin = "-90px",
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: EASE_LUXURY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type RevealLineProps = {
  className?: string;
  delay?: number;
  duration?: number;
  margin?: string;
};

export function RevealLine({ className, delay = 0, duration = 0.8, margin = "-80px" }: RevealLineProps) {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scaleX: 0, opacity: 0.45 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: EASE_LUXURY }}
      className={className}
      style={{ transformOrigin: "left center" }}
    />
  );
}
