"use client";

import { motion } from "framer-motion";

const values = [
  {
    index: "01",
    title: "Direccion clara",
    description:
      "Ordenamos el enfoque general de la marca para que cada decision visual, verbal y digital responda a una direccion definida.",
  },
  {
    index: "02",
    title: "Diseno con estandar",
    description:
      "Desarrollamos entornos y piezas que transmiten una percepcion solida, cuidada y alineada con el valor real del negocio.",
  },
  {
    index: "03",
    title: "Estructura digital",
    description:
      "Construimos sitios y sistemas que mejoran como la marca se presenta, organiza su informacion y acompana sus objetivos comerciales.",
  },
  {
    index: "04",
    title: "Comunicacion mejor resuelta",
    description:
      "Disenamos contenidos y mensajes con precision para expresar el valor de la marca con mas claridad y consistencia.",
  },
];

export default function ValueProposition() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-14 md:mb-18 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-foreground/10 pb-7">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-heading italic text-4xl md:text-5xl text-foreground text-balance"
          >
            Qué aportamos
          </motion.h2>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm tracking-[0.16em] uppercase text-foreground/50"
          >
            Propuesta de valor
          </motion.span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {values.map((value, index) => (
            <motion.article
              key={value.index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group glass relative overflow-hidden bg-accent/5 p-8 md:p-10 transition-colors hover:bg-white/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10">
                <p className="text-[11px] tracking-[0.22em] uppercase text-foreground/40 mb-5 group-hover:text-primary transition-colors duration-300">{value.index}</p>
                <h3 className="font-heading text-3xl md:text-4xl mb-4 text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-foreground/70 leading-[1.65] text-lg font-light group-hover:text-foreground/85 transition-colors duration-300">{value.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
