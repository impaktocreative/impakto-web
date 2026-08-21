"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Trama from "@/components/visual/Trama";

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
  hidden: { opacity: 0, y: 20, scale: 0.992, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_LUXURY },
  },
};

const INTRO_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.1,
    },
  },
};

const INTRO_ITEM = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.82, ease: EASE_LUXURY },
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
    <section className="relative overflow-hidden py-16 md:py-20 bg-band border-t border-graphite/8">

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={INTRO_CONTAINER}
            className="lg:col-span-4 lg:pr-6 lg:sticky lg:top-28"
          >
            <motion.p variants={INTRO_ITEM} className="mb-4 flex items-center gap-2 text-eyebrow uppercase text-stone">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
              Resolvemos dudas clave
            </motion.p>
            <motion.h2 variants={INTRO_ITEM} className="font-heading font-normal text-4xl md:text-display-lg text-foreground mb-6 text-balance">
              Preguntas frecuentes
            </motion.h2>
            <motion.p variants={INTRO_ITEM} className="text-stone text-body max-w-sm">
              Respuestas directas para conocer nuestra forma de trabajo y los
              beneficios que aporta en cada etapa.
            </motion.p>

            <motion.div variants={INTRO_ITEM} className="mt-8 overflow-hidden rounded-card border border-graphite/12">
              {/* Trama: floja lejos del cursor, tensa donde uno se detiene. */}
              <div className="relative aspect-[4/3] overflow-hidden bg-band">
                <Trama tono="tinta" />
              </div>
            </motion.div>
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
               className="group border border-graphite/12 bg-paper-lift p-5 md:p-6 open:bg-white transition-all duration-300 rounded-card"
             >
               <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body-sm font-medium text-foreground md:text-body">
                  {faq.question}
                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-graphite/12 text-stone transition-all group-open:rotate-45 group-open:border-primary/40">+</span>
                </summary>
              <p className="mt-4 text-body-sm text-slate md:text-body">{faq.answer}</p>
            </motion.details>
          ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
