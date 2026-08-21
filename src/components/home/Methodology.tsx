"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Secuencia from "@/components/visual/Secuencia";

// §4 Blueprint — easing de lujo unificado
const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STEPS_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const STEP_ITEM = {
  hidden: { opacity: 0, y: 22, scale: 0.99, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_LUXURY },
  },
};

const INTRO_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.1,
    },
  },
};

const INTRO_ITEM = {
  hidden: { opacity: 0, y: 24, filter: "blur(7px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE_LUXURY },
  },
};

const steps = [
  { number: "01", title: "Diagnóstico", description: "Analizamos contexto, audiencia y percepción actual para detectar dónde tu marca puede ganar más tracción." },
  { number: "02", title: "Dirección", description: "Definimos enfoque estratégico, narrativa y prioridades para que cada frente avance con el mismo criterio." },
  { number: "03", title: "Desarrollo", description: "Construimos piezas, estructuras y experiencias conectadas entre sí para evitar dispersión y retrabajo." },
  { number: "04", title: "Implementación", description: "Ejecutamos con orden operativo para que la mejora se vea en la percepción de marca y en la conversión." },
  { number: "05", title: "Optimización", description: "Medimos, ajustamos y refinamos para sostener resultados y escalar con más seguridad." },
];

export default function Methodology() {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageInView = useInView(imageRef, { once: true, margin: "-80px" });

  return (
    <section id="metodo" className="relative overflow-hidden py-16 md:py-20 bg-night-soft text-paper border-t border-white/8">

      {/* §6 Blueprint — iluminación ambiental radial en sección oscura */}

      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={INTRO_CONTAINER}
            className="lg:col-span-5 lg:col-start-8"
          >
            <motion.p variants={INTRO_ITEM} className="flex items-center gap-2 text-eyebrow uppercase text-primary/75">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-65" />
              Cómo trabajamos
            </motion.p>
            {/* §2 Blueprint — tipografía fluida clamp() */}
            <motion.h2
              variants={INTRO_ITEM}
              className="text-display-lg mt-4 font-heading text-paper text-balance"
            >
              Del diagnóstico a la implementación, en cinco pasos.
            </motion.h2>
            <motion.p variants={INTRO_ITEM} className="mt-7 text-body md:text-body-lg text-ash max-w-[31rem]">
              Este proceso nos permite alinear estrategia, diseño y rendimiento
              comercial para que tu marca crezca con menos fricción y más consistencia.
            </motion.p>

            {/* §4 Blueprint — imagen con scale 1.15→1.0 al entrar en view */}
            <motion.div
              variants={INTRO_ITEM}
              ref={imageRef}
              className="mt-10 image-reveal-container border border-white/14"
            >
              {/* Los cinco pasos como recorrido: el pulso avanza con el
                  scroll, así que bajar por la página es avanzar el proceso. */}
              <div
                data-image-reveal
                className={`relative aspect-[4/3] overflow-hidden ${imageInView ? "in-view" : ""}`}
              >
                <Secuencia tono="papel" />
              </div>
            </motion.div>
          </motion.div>

          {/* §3 Blueprint — hairlines: border-bottom compartidos, último sin border-right */}
          <motion.div
            className="lg:col-span-7 lg:row-start-1 border border-white/12 bg-white/[0.02]"
            variants={STEPS_CONTAINER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {steps.map((step) => (
              <motion.article
                key={step.number}
                variants={STEP_ITEM}
                whileHover={{ x: 2 }}
                className="grid grid-cols-[4.8rem_1fr] gap-4 md:gap-6 border-b border-white/12 p-6 md:p-7 last:border-b-0"
              >
                <p className="text-eyebrow uppercase text-fog pt-1">Paso {step.number}</p>
                <div>
                  <h3 className="text-display-sm font-heading text-ash">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-body text-ash">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
