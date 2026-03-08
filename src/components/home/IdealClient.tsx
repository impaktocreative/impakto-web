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
  "Buscan una estrategia de comunicacion robusta y bien articulada.",
  "Valoran criterio, proceso y decisiones respaldadas por analisis.",
  "Necesitan crecer con una presencia de marca solida y consistente.",
  "Priorizan resultados sostenibles por encima de soluciones tacticas de corto plazo.",
];

export default function IdealClient() {
  return (
    <section className="bg-[#f8f9f6] py-28 md:py-36 border-t border-foreground/7">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        {/* §3 hairline border */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-foreground/10">

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
              className="absolute inset-0 bg-cover bg-center grayscale transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(54,53,49,0.28),rgba(54,53,49,0.18)),
                  url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')
                `,
                willChange: "transform",
              }}
            />

            {/* Overlay de composición — número decorativo */}
            <div className="absolute bottom-6 left-6 pointer-events-none select-none z-10">
              <span
                className="font-heading text-background/20 leading-none block"
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
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/42">Con quién trabajamos mejor</p>
            <h2
              className="mt-4 font-heading leading-[0.91] tracking-[-0.02em] text-foreground text-balance"
              style={{ fontSize: "clamp(2rem, 3.5vw, 4rem)" }}
            >
              Proyectos que requieren direccion, criterio y estandar de ejecucion.
            </h2>
            <p className="mt-6 text-[1.05rem] md:text-[1.1rem] leading-[1.72] text-foreground/60 max-w-[40rem]">
              Los mejores resultados aparecen cuando existe una decision real de
              ordenar la comunicacion, elevar percepcion y consolidar una base
              comercial consistente. Tambien trabajamos en conjunto con agencias
              de marketing y equipos internos para integrar capacidades,
              complementar conocimiento y elevar resultados.
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
                  className="group flex items-start gap-4 border-t border-foreground/8 py-4 last:border-b last:border-foreground/8"
                >
                  <span className="text-foreground/25 text-[0.68rem] tracking-[0.14em] pt-1 min-w-[2rem] font-heading transition-colors duration-500 group-hover:text-foreground/55">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[1rem] text-foreground/68 leading-[1.58] transition-colors duration-500 group-hover:text-foreground/88">
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
