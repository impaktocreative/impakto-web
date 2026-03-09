"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

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
  hidden: { opacity: 0, y: 18, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_LUXURY },
  },
};

const steps = [
  { number: "01", title: "Diagnóstico", description: "Analizamos contexto, audiencia y percepción actual para detectar dónde su marca puede ganar más tracción." },
  { number: "02", title: "Dirección", description: "Definimos enfoque estratégico, narrativa y prioridades para que cada frente avance con el mismo criterio." },
  { number: "03", title: "Desarrollo", description: "Construimos piezas, estructuras y experiencias conectadas entre sí para evitar dispersión y retrabajo." },
  { number: "04", title: "Implementación", description: "Ejecutamos con orden operativo para que la mejora se vea en la percepción de marca y en la conversión." },
  { number: "05", title: "Optimización", description: "Medimos, ajustamos y refinamos para sostener resultados y escalar con más seguridad." },
];

export default function Methodology() {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageInView = useInView(imageRef, { once: true, margin: "-80px" });

  return (
    <section id="metodo" className="relative overflow-hidden py-28 md:py-36 bg-[#2a2f34] text-background border-t border-white/8">
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.13]" />

      {/* §6 Blueprint — iluminación ambiental radial en sección oscura */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(175,163,133,0.06),transparent_55%),radial-gradient(circle_at_88%_80%,rgba(154,164,144,0.05),transparent_52%)]" />

      <div className="ambient-orb pointer-events-none absolute right-10 top-14 h-52 w-52 rounded-full bg-secondary/10 blur-3xl" />
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.85, ease: EASE_LUXURY }}
            className="lg:col-span-5 lg:col-start-8"
          >
            <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-primary/75">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-65" />
              Cómo trabajamos
            </p>
            {/* §2 Blueprint — tipografía fluida clamp() */}
            <h2
              className="mt-4 font-heading leading-[0.91] tracking-[-0.02em] text-background text-balance"
              style={{ fontSize: "clamp(2.1rem, 3.5vw, 4rem)" }}
            >
              Nuestra metodología: claridad estratégica y ejecución consistente.
            </h2>
            <p className="mt-7 text-[1.02rem] md:text-[1.12rem] leading-[1.72] text-background/80 max-w-[31rem]">
              Este proceso nos permite alinear estrategia, diseño y rendimiento
              comercial para que su marca crezca con menos fricción y más consistencia.
            </p>

            {/* §4 Blueprint — imagen con scale 1.15→1.0 al entrar en view */}
            <motion.div
              ref={imageRef}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.85, delay: 0.14, ease: EASE_LUXURY }}
              className="mt-10 image-reveal-container border border-white/14"
            >
              <div
                data-image-reveal
                className={`aspect-[4/3] bg-[linear-gradient(rgba(54,53,49,0.28),rgba(54,53,49,0.28)),url('https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center transition-transform hover:scale-[1.03] ${imageInView ? "in-view" : ""}`}
                style={{
                  transform: imageInView ? "scale(1.0)" : "scale(1.15)",
                  transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
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
                <p className="text-[0.68rem] tracking-[0.22em] uppercase text-background/45 pt-1">Paso {step.number}</p>
                <div>
                  <h3 className="font-heading leading-[1.01] tracking-[-0.01em] text-background/96" style={{ fontSize: "clamp(1.5rem, 2.2vw, 2.2rem)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[1rem] leading-[1.66] text-background/78">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
