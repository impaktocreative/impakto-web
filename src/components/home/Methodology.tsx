"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Diagnostico",
    description:
      "Analizamos el contexto, identificamos el punto real del proyecto y definimos que necesita ser resuelto.",
  },
  {
    number: "02",
    title: "Direccion",
    description:
      "Establecemos una base conceptual, verbal y estructural que ordena el trabajo posterior.",
  },
  {
    number: "03",
    title: "Desarrollo",
    description:
      "Disenamos y construimos los elementos necesarios con una logica coherente y bien articulada.",
  },
  {
    number: "04",
    title: "Implementacion",
    description:
      "Llevamos la solucion a su version final con precision visual, tecnica y comunicacional.",
  },
  {
    number: "05",
    title: "Optimizacion",
    description:
      "Ajustamos lo necesario para que la experiencia final responda mejor al uso real y al estandar esperado.",
  },
];

export default function Methodology() {
  return (
    <section id="metodo" className="py-32 md:py-48 bg-background border-t border-foreground/5">
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-[42rem] mb-20 md:mb-28"
        >
          <span className="text-[0.8rem] tracking-[0.2em] uppercase font-medium text-primary mb-6 block">
            Método de trabajo
          </span>
          <h2 className="font-heading italic text-5xl md:text-[4.5rem] mb-8 leading-[1.05] text-foreground text-balance">
            Una estructura clara mejora el resultado.
          </h2>
          <p className="text-xl md:text-2xl text-foreground/60 leading-[1.6] font-light">
            Cada proyecto se desarrolla con una lógica ordenada. Esa estructura
            permite tomar mejores decisiones, sostener consistencia y construir
            resultados con mayor solidez.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6">
          {steps.map((step, i) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="group border-t border-foreground/10 pt-8 md:pt-10 bg-transparent"
            >
              <p className="text-[11px] tracking-[0.25em] uppercase text-foreground/40 mb-5 group-hover:text-primary transition-colors duration-300">Paso {step.number}</p>
              <h3 className="font-heading text-[1.75rem] md:text-[2rem] mb-4 text-foreground/90 group-hover:text-foreground transition-colors duration-300 leading-[1.1]">{step.title}</h3>
              <p className="text-foreground/60 leading-[1.65] text-[1rem] font-light group-hover:text-foreground/80 transition-colors duration-300">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
