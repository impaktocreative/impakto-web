"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { propuestaDeValor } from "@/content/sitio";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ValueProposition() {
  return (
    <section className="section-glow bg-white py-16 md:py-20 border-t border-graphite/8">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">

        {/* Header editorial — dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-20 md:mb-28">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.85, ease: EASE_LUXURY }}
            className="lg:col-span-6"
          >
            <p className="flex items-center gap-2 text-eyebrow uppercase text-stone">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
              Qué gana tu marca
            </p>
            <h2
              className="text-display-lg mt-4 font-heading text-foreground text-balance"
            >
              Decisiones mejor pensadas. <span className="gold-reflect">Resultados mejor sostenidos.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXURY }}
            className="lg:col-span-6 text-body md:text-body-lg text-stone max-w-[34rem]"
          >
            Nuestra forma de trabajo no solo mejora la imagen de marca. También mejora
            cómo se entiende tu propuesta y cómo responde el mercado.
          </motion.div>
        </div>

        {/* Editorial strip — filas con índice monumental, sin cajas */}
        <div className="mt-4">
          {propuestaDeValor.map((value, index) => (
            <motion.article
              key={value.index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.9, delay: index * 0.08, ease: EASE_LUXURY }}
              className="group relative grid grid-cols-12 gap-6 md:gap-10 items-start border-t border-graphite/8 py-10 md:py-12 last:border-b last:border-graphite/8"
            >
              <div className="pointer-events-none absolute inset-y-3 left-0 w-px bg-gradient-to-b from-gold/0 via-gold/45 to-gold/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Número índice monumental */}
              <div className="col-span-2 md:col-span-1 pt-1">
                <span
                  className="text-display-lg font-heading text-graphite/25 leading-none block transition-colors duration-slow group-hover:text-primary-ink"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {value.index}
                </span>
              </div>

              {/* Título */}
              <div className="col-span-10 md:col-span-5 lg:col-span-4">
                <h3
                  className="text-display-md font-heading text-ink"
                >
                  {value.title}
                </h3>
              </div>

              {/* Descripción */}
              <div className="col-span-12 md:col-span-6 lg:col-span-7 md:pl-6 lg:pl-10">
                <p className="text-body text-stone max-w-[36rem] transition-colors duration-500 group-hover:text-slate">
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
