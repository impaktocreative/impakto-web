"use client";

import { motion } from "framer-motion";

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

const painPoints = [
  "La marca evolucionó y su presentación actual ya no representa su nivel.",
  "El ecosistema digital quedó por debajo del estándar de la organización.",
  "La comunicación perdió coherencia entre unidades, canales y soportes.",
  "Existen activos dispersos, pero falta un sistema de dirección integral.",
  "El equipo directivo necesita una agencia que piense y ejecute con precisión.",
  "Los equipos de marketing y ventas no operan con un marco unificado de comunicación.",
];

export default function PainPoints() {
  return (
    <section className="relative py-28 md:py-36 bg-[#f2f4f0] border-t border-foreground/7">
      <div className="pointer-events-none absolute inset-0 premium-grid-light opacity-35" />
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.85, ease: EASE_LUXURY }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/42">Dónde aportamos más valor</p>
          <h2
            className="mt-4 font-heading leading-[0.92] tracking-[-0.02em] text-foreground text-balance"
            style={{ fontSize: "clamp(2rem, 3.4vw, 3.95rem)" }}
          >
            Hay momentos en los que una marca necesita algo más que ejecución.
          </h2>
          <p className="mx-auto mt-7 text-[1.02rem] md:text-[1.1rem] leading-[1.72] text-foreground/62 max-w-[42rem]">
             En esos contextos intervenimos con dirección estratégica y ejecución
             integrada para recuperar claridad, consistencia y tracción comercial.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-x-12 lg:grid-cols-2"
          variants={LIST_CONTAINER}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
            {painPoints.map((item, index) => (
              <motion.div
                key={item}
                variants={LIST_ITEM}
                className="group relative grid grid-cols-[3.3rem_1fr] gap-4 border-t border-foreground/10 py-6 md:py-7 items-start"
              >
                <div className="pointer-events-none absolute inset-y-2 left-[-0.55rem] w-px bg-primary/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Índice monumental */}
                <span
                  className="font-heading text-foreground/14 leading-none pt-[0.15rem] block transition-all duration-700 group-hover:text-foreground/45"
                  style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.4rem)", letterSpacing: "-0.02em" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Texto */}
                <p className="pt-1 text-[clamp(0.82rem,4vw,0.88rem)] leading-[1.5] text-foreground/68 transition-colors duration-500 group-hover:text-foreground/88 md:text-[1.04rem] md:leading-[1.66]">
                  {item}
                </p>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
