"use client";

import { motion } from "framer-motion";

const fit = [
  "Buscan una estrategia de comunicación mejor construida.",
  "Valoran criterio, proceso y decisiones con fundamento.",
  "Necesitan crecer con una presencia de marca más sólida.",
  "Priorizan resultados sostenibles por encima de soluciones rápidas.",
];

export default function IdealClient() {
  return (
    <section className="bg-background py-28 md:py-36 border-t border-foreground/7">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-foreground/10">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-5 min-h-[24rem] md:min-h-[34rem] bg-[linear-gradient(rgba(175,163,133,0.18),rgba(175,163,133,0.18)),url('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"
          />

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="lg:col-span-7 p-9 md:p-14 lg:p-16"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-foreground/48">Con quién trabajamos mejor</p>
            <h2 className="mt-4 font-heading text-[2.3rem] md:text-[3.3rem] lg:text-[4rem] leading-[0.91] tracking-[-0.02em] text-foreground text-balance">
              Proyectos que quieren hacer las cosas bien, con visión y método.
            </h2>
            <p className="mt-6 text-[1.05rem] md:text-[1.1rem] leading-[1.66] text-foreground/66 max-w-[40rem]">
              Nuestros mejores resultados aparecen cuando hay intención real de
              ordenar la comunicación, elevar percepción y construir una base
              comercial más consistente.
            </p>

            <ul className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-4">
              {fit.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.12 + i * 0.07 }}
                  whileHover={{ y: -3 }}
                  className="border border-foreground/10 p-4 text-foreground/74 leading-[1.56] bg-background"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
