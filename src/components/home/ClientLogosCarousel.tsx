"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const logos = [
  { file: "cliente-01.jpg", name: "Cliente 01" },
  { file: "cliente-02.jpg", name: "Cliente 02" },
  { file: "cliente-03.jpg", name: "Cliente 03" },
  { file: "cliente-04.jpg", name: "Cliente 04" },
  { file: "cliente-05.jpg", name: "Cliente 05" },
  { file: "cliente-06.jpg", name: "Cliente 06" },
  { file: "cliente-07.jpg", name: "Cliente 07" },
  { file: "cliente-08.jpg", name: "Cliente 08" },
  { file: "cliente-09.jpg", name: "Cliente 09" },
];

// §Marquesinas Blueprint — duplicación estructural para loop infinito sin corte
const repeated = [...logos, ...logos];

export default function ClientLogosCarousel() {
  return (
    <section className="border-b border-foreground/7 bg-[#f7f8f4] py-5 md:py-6">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.65 }}
          className="mb-4 flex items-center justify-between"
        >
          <p className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-foreground/45">
            <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
            Marcas que confiaron en Impakto
          </p>
          <span className="rounded-full border border-foreground/12 px-3 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-foreground/45">
            40+ proyectos
          </span>
        </motion.div>

        {/* §Marquesinas Blueprint — mask-image lateral: logos nacen y desaparecen en los bordes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.75, delay: 0.08 }}
          className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-white/70 shadow-[0_16px_34px_-28px_rgba(50,50,47,0.4)] logos-scroll-container"
        >
          <div
            className="logos-track flex w-max items-stretch gap-0"
            aria-label="Logos de clientes"
          >
            {repeated.map((logo, index) => (
              <div
                key={`${logo.file}-${index}`}
                className="flex h-[5.3rem] w-44 items-center justify-center border-r border-foreground/8 bg-transparent px-5 md:h-[7.1rem] md:w-60 md:px-4"
              >
                <div className="relative h-11 w-[90%] md:h-[4.35rem] md:w-[95%]">
                  <Image
                    src={encodeURI(`/logos/clientes/${logo.file}`)}
                    alt={logo.name}
                    fill
                    className="object-contain object-center grayscale opacity-68 transition-all duration-500 hover:grayscale-0 hover:opacity-95"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
