"use client";

import { motion } from "framer-motion";

export default function IntroPanel() {
  return (
    <section className="relative overflow-hidden bg-foreground py-28 md:py-36 border-y border-white/8">
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.14]" />
      <div className="ambient-orb pointer-events-none absolute -top-20 -right-24 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-0 border border-white/12 bg-foreground/94">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.75 }}
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-5 min-h-[24rem] md:min-h-[34rem] bg-[linear-gradient(rgba(175,163,133,0.16),rgba(175,163,133,0.16)),url('https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-7 p-9 md:p-14 lg:p-[4.5rem]"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-primary/82">Manifiesto operativo</p>
            <h2 className="mt-5 font-heading text-[2.2rem] md:text-[3.25rem] lg:text-[4.1rem] leading-[0.92] tracking-[-0.02em] text-background text-balance">
              La percepción de una marca se construye con dirección, criterio y consistencia.
            </h2>
            <div className="mt-9 space-y-6 text-[1.06rem] md:text-[1.16rem] leading-[1.7] text-background/78 max-w-[43rem]">
              <p>
                Una marca no se fortalece con piezas sueltas. Se fortalece cuando
                estrategia, estructura y comunicación trabajan como un sistema.
              </p>
              <p>
                En Impakto Creative diseñamos ese sistema para que cada decisión
                mejore la claridad comercial y sostenga una presencia sólida en el tiempo.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
