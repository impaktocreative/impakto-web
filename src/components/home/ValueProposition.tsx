"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const values = [
  {
    index: "01",
    title: "Dirección clara",
    description:
      "Definimos prioridades y enfoque para que la marca avance con una lógica estratégica concreta.",
  },
  {
    index: "02",
    title: "Sistema coherente",
    description:
      "Alineamos mensaje, diseño y estructura digital para sostener una percepción más sólida y confiable.",
  },
  {
    index: "03",
    title: "Impacto comercial",
    description:
      "Ordenamos la comunicación para atraer mejor, convertir con más claridad y retener con más consistencia.",
  },
];

export default function ValueProposition() {
  return (
    <section className="section-glow bg-white py-28 md:py-36 border-t border-foreground/7">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">

        {/* Header editorial — dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-20 md:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.85, ease: EASE_LUXURY }}
            className="lg:col-span-6"
          >
            <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-foreground/45">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
              Qué aportamos
            </p>
            <h2
              className="mt-4 font-heading leading-[0.91] tracking-[-0.02em] text-foreground text-balance"
              style={{ fontSize: "clamp(2rem, 3.8vw, 4.2rem)" }}
            >
              Decisiones mejor pensadas. <span className="gold-reflect">Presencia mejor construida.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXURY }}
            className="lg:col-span-6 text-[1.06rem] md:text-[1.15rem] leading-[1.72] text-foreground/62 max-w-[34rem]"
          >
            Una intervención bien estructurada no solo mejora la imagen de marca.
            También mejora cómo se comprende su propuesta y cómo responde el mercado.
          </motion.div>
        </div>

        {/* Editorial strip — filas con índice monumental, sin cajas */}
        <div className="premium-grid-light rounded-[1.6rem] border border-foreground/8 bg-white/78 p-5 md:p-8">
          {values.map((value, index) => (
            <motion.article
              key={value.index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: index * 0.08, ease: EASE_LUXURY }}
              className="group relative grid grid-cols-12 gap-6 md:gap-10 items-start border-t border-foreground/8 py-10 md:py-12 last:border-b last:border-foreground/8"
            >
              <div className="pointer-events-none absolute inset-y-3 left-0 w-px bg-gradient-to-b from-primary/0 via-primary/45 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Número índice monumental */}
              <div className="col-span-2 md:col-span-1 pt-1">
                <span
                  className="font-heading text-foreground/12 leading-none block transition-all duration-700 group-hover:text-foreground/30"
                  style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "-0.03em" }}
                >
                  {value.index}
                </span>
              </div>

              {/* Título */}
              <div className="col-span-10 md:col-span-5 lg:col-span-4">
                <h3
                  className="font-heading leading-[0.96] tracking-[-0.02em] text-foreground/90 transition-colors duration-500 group-hover:text-foreground"
                  style={{ fontSize: "clamp(1.9rem, 3vw, 3rem)" }}
                >
                  {value.title}
                </h3>
              </div>

              {/* Descripción */}
              <div className="col-span-12 md:col-span-6 lg:col-span-7 md:pl-6 lg:pl-10">
                <p className="text-[1.02rem] leading-[1.7] text-foreground/62 max-w-[36rem] transition-colors duration-500 group-hover:text-foreground/82">
                  {value.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
