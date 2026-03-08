"use client";

import { motion } from "framer-motion";

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
    <section className="bg-background py-28 md:py-36 border-t border-foreground/7">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-6"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-foreground/48">Qué aportamos</p>
            <h2 className="mt-4 font-heading text-[2.3rem] md:text-[3.35rem] lg:text-[4.2rem] leading-[0.91] tracking-[-0.02em] text-foreground text-balance">
              Decisiones mejor pensadas. Presencia mejor construida.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-6 text-[1.06rem] md:text-[1.15rem] leading-[1.7] text-foreground/66 max-w-[35rem]"
          >
            Una intervención bien estructurada no solo mejora la imagen de marca.
            También mejora cómo se entiende tu propuesta y cómo responde el mercado.
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.96 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 border border-foreground/10"
        >
          {values.map((value, index) => (
            <motion.article
              key={value.index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-8 md:p-10 border-t md:border-t-0 border-foreground/10 first:border-t-0 md:border-l first:md:border-l-0 bg-background"
            >
              <p className="text-[0.7rem] tracking-[0.2em] uppercase text-foreground/45">{value.index}</p>
              <h3 className="mt-5 font-heading text-[2.05rem] md:text-[2.5rem] leading-[1] tracking-[-0.01em] text-foreground/92">
                {value.title}
              </h3>
              <p className="mt-5 text-[1rem] leading-[1.66] text-foreground/66">{value.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
