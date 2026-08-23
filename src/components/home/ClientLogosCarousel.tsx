"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { marcasClientes } from "@/content/sitio";


// §Marquesinas Blueprint — duplicación estructural para loop infinito sin corte
const repeated = [...marcasClientes, ...marcasClientes];

/**
 * Segundos que tarda cada logo en cruzar. La duración total se deriva de la
 * cantidad y no es un número fijo: con un valor fijo, sumar marcas alarga la
 * cinta y la vuelve más lenta, que es exactamente lo contrario de lo que se
 * busca al agregar clientes.
 */
const SEGUNDOS_POR_LOGO = 3;

export default function ClientLogosCarousel() {
  return (
    <section className="border-b border-graphite/8 bg-band py-5 md:py-6">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -70px 0px" }}
          transition={{ duration: 0.65 }}
          className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2 text-eyebrow uppercase text-stone">
            <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
            Marcas que confiaron en <span className="marca-impakto">Impakto</span>
          </p>
          <span className="flex items-center gap-3 text-eyebrow uppercase text-stone">
            <span className="hairline-gold h-px w-6" aria-hidden="true" />
            +30 marcas
          </span>
        </motion.div>

        {/* §Marquesinas Blueprint — mask-image lateral: logos nacen y desaparecen en los bordes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -70px 0px" }}
          transition={{ duration: 0.75, delay: 0.08 }}
          className="logos-scroll-container relative overflow-hidden rounded-card border border-graphite/12 bg-white"
        >
          <div
            className="logos-track flex w-max items-stretch gap-0"
            style={{ "--marquesina-duracion": `${marcasClientes.length * SEGUNDOS_POR_LOGO}s` } as React.CSSProperties}
            aria-label="Logos de clientes"
          >
            {repeated.map((logo, index) => (
              <div
                key={`${logo.file}-${index}`}
                className="flex h-[5.6rem] w-36 items-center justify-center border-r border-graphite/8 bg-transparent px-3 md:h-[7rem] md:w-44"
              >
                <div className="relative h-[3.25rem] w-[96%] md:h-[4.4rem]">
                  <Image
                    src={encodeURI(`/logos/clientes/cinta/${logo.file}`)}
                    alt={logo.name}
                    fill
                    // El slide mide 176px en mobile y 240px desde md. Sin esto
                    // `fill` asume 100vw y Next sirve la variante de 3840px.
                    sizes="(min-width: 768px) 176px, 144px"
                    className="object-contain object-center grayscale opacity-70 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
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
