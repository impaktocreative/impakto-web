"use client";

import { motion } from "framer-motion";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const LIST_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const LIST_ITEM = {
  hidden: { opacity: 0, x: -16, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE_LUXURY },
  },
};

const fit = [
  "Necesitan una estrategia de comunicación robusta y bien articulada.",
  "Valoran criterio, proceso y decisiones respaldadas por análisis.",
  "Buscan crecer con una presencia de marca sólida y consistente.",
  "Priorizan resultados sostenibles por encima de soluciones tácticas de corto plazo.",
];

export default function IdealClient() {
  return (
    <section className="bg-band py-16 md:py-20 border-t border-graphite/8">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        {/* §3 hairline border */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-graphite/12">

          {/* Panel imagen — textura editorial (tela/lino, sin rostros) §5 cinematic hover */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE_LUXURY }}
            className="lg:col-span-5 min-h-[24rem] md:min-h-[36rem] overflow-hidden relative"
          >
            {/* Capa de textura mineral/abstracta — sin personas corporativas */}
            <div
              className="absolute inset-0 bg-cover bg-center grayscale transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(54,53,49,0.28),rgba(54,53,49,0.18)),
                  url('/media/cliente-ideal.webp')
                `,
                willChange: "transform",
              }}
            />

            {/* Overlay de composición — número decorativo */}
            <div className="absolute bottom-6 left-6 pointer-events-none select-none z-10">
              <span
                className="font-heading text-paper/65 leading-none block"
                style={{ fontSize: "clamp(5rem, 10vw, 8rem)", letterSpacing: "-0.04em" }}
              >
                02
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXURY }}
            className="lg:col-span-7 p-9 md:p-14 lg:p-16"
          >
            <p className="text-eyebrow uppercase text-stone">Con quién trabajamos mejor</p>
            <h2
              className="text-display-lg mt-4 font-heading text-foreground text-balance"
            >
              Proyectos donde nuestra forma de trabajo genera mayor impacto.
            </h2>
            <p className="mt-6 text-body md:text-body-lg text-stone max-w-[40rem]">
              Los mejores resultados aparecen cuando hay una decisión real de
              ordenar la comunicación, elevar percepción y consolidar una base
              comercial consistente. También trabajamos junto a agencias de
              marketing y equipos internos para integrar capacidades,
              complementar conocimiento y acelerar resultados.
            </p>

            {/* Lista editorial — filas con hairlines, sin cajas */}
            <motion.ul
              className="mt-10 space-y-0"
              variants={LIST_CONTAINER}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {fit.map((item, i) => (
                <motion.li
                  key={item}
                  variants={LIST_ITEM}
                  className="group flex items-start gap-4 border-t border-graphite/8 py-4 last:border-b last:border-graphite/8"
                >
                  <span className="text-stone text-eyebrow pt-1 min-w-[2rem] font-heading transition-colors duration-500 group-hover:text-stone">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-body text-stone transition-colors duration-500 group-hover:text-ink">
                    {item}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
