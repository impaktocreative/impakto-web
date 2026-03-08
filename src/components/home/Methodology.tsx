"use client";

import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Diagnóstico", description: "Analizamos contexto, audiencia, percepción actual y objetivos reales." },
  { number: "02", title: "Dirección", description: "Definimos enfoque estratégico, narrativa y prioridades de implementación." },
  { number: "03", title: "Desarrollo", description: "Construimos piezas, estructuras y experiencias con un criterio unificado." },
  { number: "04", title: "Implementación", description: "Llevamos la solución a ejecución cuidando coherencia visual y comercial." },
  { number: "05", title: "Optimización", description: "Medimos, ajustamos y refinamos para sostener resultados en el tiempo." },
];

export default function Methodology() {
  return (
    <section id="metodo" className="relative overflow-hidden py-28 md:py-36 bg-foreground text-background border-t border-white/8">
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.13]" />
      <div className="ambient-orb pointer-events-none absolute right-10 top-14 h-52 w-52 rounded-full bg-secondary/10 blur-3xl" />
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-5"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-primary/82">Método de trabajo</p>
            <h2 className="mt-4 font-heading text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] leading-[0.91] tracking-[-0.02em] text-background text-balance">
              Estructura para decidir mejor y ejecutar con precisión.
            </h2>
            <p className="mt-7 text-[1.06rem] md:text-[1.16rem] leading-[1.7] text-background/72 max-w-[31rem]">
              No improvisamos el crecimiento de una marca. Trabajamos con un proceso
              claro para alinear estrategia, diseño y rendimiento comercial.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-10 overflow-hidden border border-white/14"
            >
              <div className="aspect-[4/3] bg-[linear-gradient(rgba(54,53,49,0.28),rgba(54,53,49,0.28)),url('https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]" />
            </motion.div>
          </motion.div>

          <div className="lg:col-span-7 border border-white/12 bg-white/[0.02]">
            {steps.map((step, i) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ x: 2 }}
                className="grid grid-cols-[4.8rem_1fr] gap-4 md:gap-6 border-b border-white/12 p-6 md:p-7 last:border-b-0"
              >
                <p className="text-[0.72rem] tracking-[0.2em] uppercase text-background/48 pt-1">Paso {step.number}</p>
                <div>
                  <h3 className="font-heading text-[1.78rem] md:text-[2.2rem] leading-[1.01] tracking-[-0.01em] text-background/96">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[1rem] leading-[1.64] text-background/72">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
