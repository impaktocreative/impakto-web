"use client";

import { motion } from "framer-motion";

const painPoints = [
  "La marca evolucionó y su presentación actual ya no la representa.",
  "El sitio quedó por debajo del nivel real del negocio.",
  "La comunicación perdió coherencia entre canales y soportes.",
  "Existen piezas aisladas, pero falta sistema.",
  "El equipo necesita una agencia que piense y ejecute con precisión.",
];

export default function PainPoints() {
  return (
    <section className="py-28 md:py-36 bg-background border-t border-foreground/7">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.75 }}
            className="lg:col-span-5"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-foreground/48">Contextos clave</p>
            <h2 className="mt-4 font-heading text-[2.25rem] md:text-[3.2rem] lg:text-[3.95rem] leading-[0.92] tracking-[-0.02em] text-foreground text-balance">
              Hay etapas en las que una marca necesita algo más que ejecución.
            </h2>
            <p className="mt-7 text-[1.06rem] md:text-[1.16rem] leading-[1.7] text-foreground/66 max-w-[31rem]">
              Cuando la presencia digital deja de acompañar el nivel real del negocio,
              el problema no es de volumen. Es de dirección.
            </p>
          </motion.div>

          <div className="lg:col-span-7 border border-foreground/10 bg-background">
            {painPoints.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                whileHover={{ x: 4 }}
                className="border-b border-foreground/10 p-6 md:p-8 last:border-b-0"
              >
                <p className="text-foreground/74 leading-[1.66] text-[1.02rem]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
