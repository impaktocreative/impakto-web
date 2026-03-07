"use client";

import { motion } from "framer-motion";

const fit = [
  "Valoran claridad y direccion antes que velocidad sin proceso.",
  "Buscan una presencia mas solida y consistente en cada punto de contacto.",
  "Reconocen el valor de decisiones bien pensadas y ejecucion cuidada.",
  "Priorizan calidad y una relacion profesional sostenida.",
];

const noFit = [
  "Proyectos que solo comparan precio.",
  "Pedidos de tareas sueltas sin estrategia.",
  "Expectativas de resultados inmediatos sin proceso.",
  "Busquedas de volumen barato sin direccion.",
];

export default function IdealClient() {
  return (
    <section className="py-32 md:py-48 bg-background relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="max-w-[50rem] mb-20 md:mb-28">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading italic text-5xl md:text-[4.5rem] lg:text-[5rem] text-foreground mb-10 leading-[1.05] text-balance"
          >
            Trabajamos mejor con marcas y negocios que buscan una construcción seria
            y bien resuelta.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-foreground/60 leading-[1.6] text-xl md:text-2xl font-light max-w-[42rem]"
          >
            Nuestros mejores proyectos aparecen cuando existe intención real de
            ordenar la presencia de una marca, elevar su percepción y construir
            una base digital sólida con dirección.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass relative overflow-hidden bg-white/40 p-10 md:p-14 rounded-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50" />
            <h3 className="font-heading text-4xl md:text-[3rem] mb-10 text-foreground/90 leading-[1.1]">Encaje ideal</h3>
            <ul className="space-y-5">
              {fit.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="border-b border-foreground/5 pb-4 text-foreground/80 font-light leading-relaxed flex items-start gap-3"
                >
                  <span className="text-primary mt-1 text-sm">✦</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass bg-foreground/[0.02] p-10 md:p-14 rounded-2xl"
          >
            <h3 className="font-heading text-4xl md:text-[3rem] mb-10 text-foreground/60 leading-[1.1]">Cuando no hay alineación</h3>
            <ul className="space-y-5">
              {noFit.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="border-b border-foreground/5 pb-4 text-foreground/50 font-light leading-relaxed flex items-start gap-3"
                >
                  <span className="text-foreground/30 mt-1 text-sm">×</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
