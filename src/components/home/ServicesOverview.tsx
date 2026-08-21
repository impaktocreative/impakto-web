"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SECTION_STAGGER = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.09,
    },
  },
};

const SECTION_ITEM = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.82, ease: EASE_LUXURY },
  },
};

const CARDS_STAGGER = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.14,
      staggerChildren: 0.11,
    },
  },
};

const CARD_ITEM = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.66, ease: EASE_LUXURY },
  },
};

const services = [
  {
    title: "Estrategia y posicionamiento",
    description:
      "Dirección comunicacional y criterio de marca para organizaciones que requieren una base estratégica clara para escalar.",
  },
  {
    title: "Diseño y desarrollo web",
    description:
      "Sitios y plataformas orientados a proyectar autoridad, ordenar la experiencia digital y mejorar desempeño comercial.",
  },
  {
    title: "Comunicación y contenido comercial",
    description:
      "Mensajes, piezas y materiales desarrollados para expresar valor con precisión ejecutiva en cada punto de contacto.",
  },
  {
    title: "Sistemas digitales y automatización",
    description:
      "Estructuras funcionales que fortalecen procesos, contacto y eficiencia operativa a escala.",
  },
];

export default function ServicesOverview() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20 bg-night-soft text-paper border-t border-white/8">
      <div className="pointer-events-none absolute right-8 bottom-10 hidden opacity-[0.06] xl:block">
        <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={160} height={200} className="h-36 w-auto" />
      </div>
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-14"
          variants={SECTION_STAGGER}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
        >
          <motion.div
            variants={SECTION_ITEM}
            className="lg:col-span-4 lg:pr-8"
          >
            <motion.span variants={SECTION_ITEM} className="mb-6 flex items-center gap-2 text-eyebrow font-medium uppercase text-primary/82">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-65" />
              Áreas principales
            </motion.span>
            <motion.h2 variants={SECTION_ITEM} className="font-heading font-normal text-display-lg mb-8 text-paper text-balance">
              Áreas principales de trabajo
            </motion.h2>
            <motion.p variants={SECTION_ITEM} className="text-ash mb-10 text-body">
              La oferta se organiza en áreas definidas para construir presencia,
              orden y consistencia en distintos niveles del negocio.
            </motion.p>
            <motion.div
              variants={SECTION_ITEM}
              whileHover={{ scale: 1.01 }}
              className="mb-10 hidden lg:block overflow-hidden border border-white/14"
            >
              <div className="h-44 w-full bg-[linear-gradient(rgba(54,53,49,0.35),rgba(54,53,49,0.35)),url('/media/servicios-web.webp')] bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]" />
            </motion.div>
            <motion.div variants={SECTION_ITEM}>
              <Button asChild variant="outline" className="hidden lg:inline-flex border-white/35 bg-white text-foreground hover:border-white hover:bg-white hover:text-foreground">
              <Link href="/servicios">Ver servicios</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div className="lg:col-span-7 lg:col-start-6" variants={CARDS_STAGGER}>
            <div className="flex flex-col">
              {services.map((service) => (
                <motion.article
                  key={service.title}
                  variants={CARD_ITEM}
                  className="group relative border-b border-white/12 py-11 md:py-16 bg-transparent transition-colors duration-500 hover:bg-white/[0.04] px-6 -mx-6"
                >
                  <span className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-primary/0 via-primary/60 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <h3 className="font-heading font-normal text-display-sm text-paper group-hover:text-primary/95 transition-colors duration-300">{service.title}</h3>
                    <motion.div
                      whileHover={{ scale: 1.1, x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ArrowRight className="text-primary/55 -rotate-45 transition-all duration-300 group-hover:text-primary group-hover:rotate-0 w-8 h-8" />
                    </motion.div>
                  </div>
                  <p className="text-ash max-w-xl text-body group-hover:text-paper transition-colors duration-300">{service.description}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <Button asChild variant="outline" className="w-full border-white/35 bg-white text-foreground hover:border-white hover:bg-white hover:text-foreground">
                <Link href="/servicios">Ver servicios</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section >
  );
}
