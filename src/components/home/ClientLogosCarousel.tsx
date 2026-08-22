"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Las marcas de la cinta.
 *
 * El orden no es alfabético ni cronológico: alterna rubros para que dos logos
 * del mismo sector no caigan pegados. En una cinta que corre, dos concesionarias
 * seguidas se leen como una sola.
 */
const logos = [
  { file: "cliente-01.jpg", name: "Vargas" },
  { file: "chevrolet.webp", name: "Chevrolet" },
  { file: "cliente-02.jpg", name: "Restorando" },
  { file: "grupo-san-nicolas-salud.webp", name: "Grupo San Nicolás Salud" },
  { file: "salomon.webp", name: "Salomon" },
  { file: "cliente-04.jpg", name: "Carballal Propiedades" },
  { file: "little-ranch-hotel-spa.webp", name: "Little Ranch Hotel & Spa" },
  { file: "cliente-05.jpg", name: "Venfarma" },
  { file: "llongueras.webp", name: "Llongueras" },
  { file: "3m-supermercados.webp", name: "3M Supermercados" },
  { file: "cliente-03.jpg", name: "Black Donkey" },
  { file: "san-jorge-automoviles.webp", name: "San Jorge Automóviles" },
  { file: "the-nails-bar.webp", name: "The Nails Bar" },
  { file: "cliente-07.jpg", name: "Red Argentina de Salud" },
  { file: "terra-nostra.webp", name: "Terra Nostra" },
  { file: "multipasta.webp", name: "Multipasta" },
  { file: "cliente-06.jpg", name: "Neicha" },
  { file: "si-turismo-bariloche.webp", name: "Sí Turismo Bariloche" },
  { file: "doctor-k.webp", name: "Doctor K" },
  { file: "cliente-08.jpg", name: "Honky Tonk" },
  { file: "regala.webp", name: "Regala" },
  { file: "la-crockery.webp", name: "La Crockery" },
  { file: "thaun.webp", name: "Thaun" },
  { file: "you-mujer.webp", name: "You Mujer" },
  { file: "cliente-09.jpg", name: "Hotel San Martín" },
  { file: "buttonia.webp", name: "Buttonia" },
  { file: "cirse.webp", name: "Cirse" },
  { file: "doris-machin.webp", name: "Doris Machin" },
  { file: "san-carlos.webp", name: "San Carlos" },
  { file: "rebecca.webp", name: "Rebecca" },
  { file: "honky-tonk-woman.webp", name: "Honky Tonk Woman" },
];

// §Marquesinas Blueprint — duplicación estructural para loop infinito sin corte
const repeated = [...logos, ...logos];

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
            Marcas que confiaron en Impakto
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
            style={{ "--marquesina-duracion": `${logos.length * SEGUNDOS_POR_LOGO}s` } as React.CSSProperties}
            aria-label="Logos de clientes"
          >
            {repeated.map((logo, index) => (
              <div
                key={`${logo.file}-${index}`}
                className="flex h-[6.2rem] w-44 items-center justify-center border-r border-graphite/8 bg-transparent px-5 md:h-[8.1rem] md:w-60 md:px-4"
              >
                <div className="relative h-[3.25rem] w-[94%] md:h-[5.2rem] md:w-[96%]">
                  <Image
                    src={encodeURI(`/logos/clientes/${logo.file}`)}
                    alt={logo.name}
                    fill
                    // El slide mide 176px en mobile y 240px desde md. Sin esto
                    // `fill` asume 100vw y Next sirve la variante de 3840px.
                    sizes="(min-width: 768px) 240px, 176px"
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
