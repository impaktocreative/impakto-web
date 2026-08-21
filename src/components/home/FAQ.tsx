"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { preguntasFrecuentes } from "@/content/sitio";

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
            <motion.h2 variants={INTRO_ITEM} className="font-heading text-4xl md:text-display-lg text-foreground mb-6 text-balance">
              Preguntas frecuentes
            </motion.h2>
            <motion.p variants={INTRO_ITEM} className="text-stone text-body max-w-sm">
              Respuestas directas para conocer nuestra forma de trabajo y los
              beneficios que aporta en cada etapa.
            </motion.p>

            {/* Acá había una trama dibujada dentro de una caja. Era pobre y no
                decía nada que el texto no dijera ya, así que se va: en una
                columna de preguntas, el aire vale más que un adorno. Queda un
                filete dorado, que sí pertenece al sistema. */}
            <motion.div variants={INTRO_ITEM} className="mt-10">
              <span className="hairline-gold block h-px w-24" />
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-8 lg:pl-2 space-y-4"
            variants={FAQ_CONTAINER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
          {preguntasFrecuentes.map((faq) => (
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
