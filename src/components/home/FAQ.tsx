"use client";

import { motion } from "framer-motion";

const faqs = [
  {
    question: "Con que tipo de proyectos trabaja Impakto Creative?",
    answer:
      "Trabajamos con marcas y negocios que buscan ordenar su presencia digital con un enfoque profesional, no con logica de volumen o piezas aisladas.",
  },
  {
    question: "Si no tengo claro que servicio necesito, puedo consultar igual?",
    answer:
      "Si. La conversacion inicial sirve para ordenar el punto de partida y definir que tipo de intervencion tiene mas sentido en tu contexto.",
  },
  {
    question: "Cuanto demora un proyecto?",
    answer:
      "Depende del alcance y la complejidad. Siempre trabajamos con etapas y criterios claros para sostener calidad y previsibilidad.",
  },
  {
    question: "Toman proyectos urgentes?",
    answer:
      "Podemos evaluar urgencias puntuales, pero priorizamos procesos bien orientados porque son los que garantizan resultados solidos.",
  },
];

export default function FAQ() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 bg-background border-t border-foreground/8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(175,163,133,0.1),transparent_35%)]" />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-4"
          >
            <h2 className="font-heading font-normal text-4xl md:text-[3.8rem] leading-[0.92] tracking-[-0.02em] text-foreground mb-6 text-balance">
              Preguntas frecuentes
            </h2>
            <p className="text-foreground/62 leading-[1.64] text-[1.03rem] max-w-sm">
              Respuestas directas para entender cómo trabajamos, qué priorizamos y
              qué esperar del proceso.
            </p>

            <div className="mt-8 overflow-hidden border border-foreground/10">
              <div className="aspect-[4/3] bg-[linear-gradient(rgba(54,53,49,0.22),rgba(54,53,49,0.22)),url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            </div>
          </motion.div>

          <div className="lg:col-span-8 space-y-4">
          {faqs.map((faq) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.55 }}
              whileHover={{ y: -2 }}
              className="group border border-foreground/10 bg-white/45 p-5 md:p-6 open:bg-white/75 transition-colors duration-300"
            >
              <summary className="cursor-pointer list-none text-[1.03rem] md:text-[1.08rem] font-medium text-foreground flex items-center justify-between gap-6 leading-[1.5]">
                {faq.question}
                <span className="text-foreground/55 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-foreground/72 leading-[1.66]">{faq.answer}</p>
            </motion.details>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
