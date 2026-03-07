"use client";

import { motion } from "framer-motion";

export default function IntroPanel() {
  return (
    <section className="py-32 md:py-48 bg-foreground text-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 lg:pr-6"
          >
            <span className="text-sm tracking-[0.2em] uppercase text-primary/80 block mb-5 font-medium">
              Manifiesto operativo
            </span>
            <h2 className="font-heading italic font-light text-5xl md:text-[4.5rem] lg:text-[5.5rem] leading-[0.95] tracking-[-0.02em] text-primary text-balance">
              La percepción de una marca se construye en cada decisión.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 lg:col-start-7 space-y-7 text-lg md:text-[1.35rem] leading-[1.65] text-background/80 font-light"
          >
            <p>
              La forma en que una marca se presenta influye en cómo es entendida,
              valorada y recordada. Esa percepción no depende solo de una identidad
              visual o de un sitio correcto. Depende de la calidad del sistema
              completo.
            </p>
            <p>
              Por eso trabajamos sobre dirección, mensajes, estructura y diseño
              como partes de una misma construcción. Cada proyecto se desarrolla
              con criterio y precisión para sostener consistencia en el tiempo.
            </p>
            <p className="text-background pt-2">Impakto Creative trabaja sobre esa base.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
