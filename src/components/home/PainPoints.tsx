"use client";

import { motion } from "framer-motion";
import { situacionesQueAtendemos } from "@/content/sitio";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const LIST_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const LIST_ITEM = {
  hidden: { opacity: 0, y: 18, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_LUXURY },
  },
};

export default function PainPoints() {
  return (
    <section className="relative py-16 md:py-20 bg-surface-muted border-t border-graphite/8">
      <div className="pointer-events-none absolute inset-0 premium-grid-light opacity-35" />
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          transition={{ duration: 0.85, ease: EASE_LUXURY }}
          className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-14"
        >
          <div className="lg:col-span-6">
          <p className="flex items-center gap-3 text-eyebrow uppercase text-stone"><span className="h-px w-6 bg-gold/70" />Dónde aportamos más valor</p>
          <h2
            className="text-display-lg mt-4 font-heading text-foreground text-balance"
          >
            Hay momentos en los que una marca necesita algo más que ejecución.
          </h2>
          </div>
          <p className="text-body text-stone md:text-body-lg lg:col-span-5 lg:col-start-8">
             En esos contextos intervenimos con dirección estratégica y ejecución
             integrada para recuperar claridad, consistencia y tracción comercial.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-x-12 lg:grid-cols-2"
          variants={LIST_CONTAINER}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        >
            {situacionesQueAtendemos.map((item, index) => (
              <motion.div
                key={item}
                variants={LIST_ITEM}
                className="group relative grid grid-cols-[3.3rem_1fr] gap-4 border-t border-graphite/12 py-6 md:py-7 items-start"
              >
                <div className="pointer-events-none absolute inset-y-2 left-[-0.55rem] w-px bg-gold/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Índice monumental */}
                <span
                  className="text-display-sm font-heading text-stone leading-none pt-[0.15rem] block transition-all duration-700 group-hover:text-stone"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Texto */}
                <p className="pt-1 text-body-sm text-stone transition-colors duration-500 group-hover:text-ink md:text-body">
                  {item}
                </p>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
