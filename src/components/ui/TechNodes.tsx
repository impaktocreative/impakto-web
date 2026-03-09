"use client";

import { motion } from "framer-motion";

type TechNodesProps = {
  className?: string;
};

const nodes = [
  { top: "16%", left: "12%", delay: 0.1 },
  { top: "34%", left: "78%", delay: 0.35 },
  { top: "68%", left: "24%", delay: 0.7 },
  { top: "76%", left: "84%", delay: 1.05 },
];

export default function TechNodes({ className }: TechNodesProps) {
  return (
    <div className={className} aria-hidden="true">
      {nodes.map((node) => (
        <motion.span
          key={`${node.top}-${node.left}`}
          className="pointer-events-none absolute h-2 w-2 rounded-full bg-primary/55 shadow-[0_0_0_1px_rgba(216,193,136,0.38),0_0_18px_rgba(216,193,136,0.32)]"
          style={{ top: node.top, left: node.left }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.92, 1.25, 0.92] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
        />
      ))}
    </div>
  );
}
