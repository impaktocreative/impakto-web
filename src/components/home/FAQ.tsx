"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FAQ_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const FAQ_ITEM = {
  hidden: { opacity: 0, y: 16, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_LUXURY },
  },
};

const faqs = [
  {
    question: "¿Con qué tipo de organizaciones y alcances trabaja Impakto Creative?",
    answer:
      "Trabajamos con marcas, empresas y equipos directivos que requieren dirección estratégica, consistencia de marca y ejecución con estándar en múltiples frentes.",
  },
  {
    question: "¿Cómo abordan proyectos con múltiples unidades, mercados o líneas de negocio?",
    answer:
      "Iniciamos con un diagnóstico integral para priorizar frentes críticos, alinear criterios entre equipos y definir una hoja de ruta por etapas con objetivos medibles.",
  },
  {
    question: "¿Qué nivel de involucramiento requiere el equipo interno del cliente?",
    answer:
      "El involucramiento se define por etapa. Establecemos una dinámica ejecutiva con responsables claros, instancias de validación y decisiones oportunas para sostener velocidad y calidad.",
  },
  {
    question: "¿Cómo aseguran consistencia en captación, conversión y retención?",
    answer:
      "La metodología integra estos tres pilares desde el diseño de la estrategia. Cada decisión de mensaje, experiencia y sistema se evalúa por su impacto en captación, conversión y retención.",
  },
  {
    question: "¿Cómo gestionan aprobaciones y toma de decisiones con múltiples stakeholders?",
    answer:
      "Definimos una gobernanza de proyecto desde el inicio, con responsables por frente, hitos de aprobación y criterios de decisión para sostener trazabilidad y velocidad ejecutiva.",
  },
  {
    question: "¿Pueden colaborar con agencias de marketing o equipos internos ya existentes?",
    answer:
      "Sí. Participamos como socio estratégico y de ejecución en proyectos compartidos, integrando conocimiento con agencias y equipos internos para fortalecer el resultado final.",
  },
];

export default function FAQ() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 bg-[#f7f8f5] border-t border-foreground/8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(164,154,130,0.12),transparent_35%)]" />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-4 lg:pr-6 lg:sticky lg:top-28"
          >
            <p className="mb-4 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-foreground/45">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
              Resolvemos dudas clave
            </p>
            <h2 className="font-heading font-normal text-4xl md:text-[3.8rem] leading-[0.92] tracking-[-0.02em] text-foreground mb-6 text-balance">
              Preguntas frecuentes
            </h2>
            <p className="text-foreground/62 leading-[1.64] text-[1.03rem] max-w-sm">
              Respuestas directas para entender cómo trabajamos, qué priorizamos y
              qué esperar del proceso.
            </p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-foreground/10 shadow-[0_20px_34px_-28px_rgba(50,50,47,0.4)]">
              <div className="aspect-[4/3] bg-[linear-gradient(rgba(54,53,49,0.22),rgba(54,53,49,0.22)),url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-8 lg:pl-2 space-y-4"
            variants={FAQ_CONTAINER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
          {faqs.map((faq) => (
            <motion.details
              key={faq.question}
              variants={FAQ_ITEM}
              whileHover={{ y: -2 }}
               className="group border border-foreground/10 bg-white/60 p-5 md:p-6 open:bg-white transition-all duration-300 rounded-2xl shadow-[0_16px_28px_-30px_rgba(50,50,47,0.5)]"
             >
               <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[clamp(0.84rem,4.2vw,0.9rem)] font-medium leading-[1.42] text-foreground md:text-[1.08rem] md:leading-[1.5]">
                  {faq.question}
                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/14 text-foreground/55 transition-all group-open:rotate-45 group-open:border-primary/40">+</span>
                </summary>
              <p className="mt-4 text-[clamp(0.8rem,3.95vw,0.86rem)] leading-[1.58] text-foreground/70 md:text-[1rem] md:leading-[1.66]">{faq.answer}</p>
            </motion.details>
          ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
