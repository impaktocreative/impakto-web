"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

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
    <section className="relative overflow-hidden py-28 md:py-36 bg-[#24282d] text-background border-t border-white/8">
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.14]" />
      <div className="ambient-orb pointer-events-none absolute -left-24 bottom-16 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
      <div className="ambient-orb pointer-events-none absolute right-8 top-14 h-64 w-64 rounded-full bg-secondary/12 blur-3xl" />
      <div className="pointer-events-none absolute right-8 bottom-10 hidden opacity-[0.06] xl:block">
        <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={160} height={200} className="h-36 w-auto" />
      </div>
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 lg:pr-8"
          >
            <span className="mb-6 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary/82">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-65" />
              Áreas principales
            </span>
            <h2 className="font-heading font-normal text-[2.7rem] md:text-[4.2rem] mb-8 text-background leading-[0.92] tracking-[-0.02em] text-balance">
              Áreas principales de trabajo
            </h2>
            <p className="text-background/80 leading-[1.68] mb-10 text-[1rem] md:text-[1.04rem]">
              La oferta se organiza en áreas definidas para construir presencia,
              orden y consistencia en distintos niveles del negocio.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="mb-10 hidden lg:block overflow-hidden border border-white/14"
            >
              <div className="h-44 w-full bg-[linear-gradient(rgba(54,53,49,0.35),rgba(54,53,49,0.35)),url('https://images.unsplash.com/photo-1553028826-f4804a6dba3b?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]" />
            </motion.div>
            <Button asChild variant="outline" className="hidden lg:inline-flex border-white/35 bg-white text-foreground hover:border-white hover:bg-white hover:text-foreground">
              <Link href="/servicios">Ver soluciones por objetivo</Link>
            </Button>
          </motion.div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="flex flex-col">
              {services.map((service, i) => (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="group relative border-b border-white/12 py-11 md:py-16 bg-transparent transition-colors duration-500 hover:bg-white/[0.04] px-6 -mx-6"
                >
                  <span className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-primary/0 via-primary/60 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <h3 className="font-heading font-normal text-[2.2rem] md:text-[2.55rem] text-background group-hover:text-primary/95 transition-colors duration-300 leading-[1.02] tracking-[-0.01em]">{service.title}</h3>
                    <motion.div
                      whileHover={{ scale: 1.1, x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ArrowRight className="text-primary/55 -rotate-45 transition-all duration-300 group-hover:text-primary group-hover:rotate-0 w-8 h-8" />
                    </motion.div>
                  </div>
                  <p className="text-background/80 leading-[1.68] max-w-xl text-[1.02rem] md:text-[1.06rem] group-hover:text-background transition-colors duration-300">{service.description}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <Button asChild variant="outline" className="w-full border-white/35 bg-white text-foreground hover:border-white hover:bg-white hover:text-foreground">
                <Link href="/servicios">Ver soluciones por objetivo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
}
