"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Estrategia y posicionamiento",
    description:
      "Dirección comunicacional y criterio de marca para proyectos que necesitan una base más clara sobre la cual construir.",
  },
  {
    title: "Diseño y desarrollo web",
    description:
      "Sitios y landing pages pensados para proyectar mejor el nivel de la marca y ordenar su presencia digital.",
  },
  {
    title: "Comunicación y contenido comercial",
    description:
      "Textos, piezas y materiales desarrollados para expresar el valor del negocio con mayor precisión.",
  },
  {
    title: "Sistemas digitales y automatización",
    description:
      "Estructuras funcionales que mejoran procesos, contacto y organización operativa.",
  },
];

export default function ServicesOverview() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 bg-foreground text-background border-t border-white/8">
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.14]" />
      <div className="ambient-orb pointer-events-none absolute -left-24 bottom-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 lg:pr-8"
          >
            <span className="text-[0.72rem] tracking-[0.18em] uppercase font-medium text-primary/82 mb-6 block">
              Áreas principales
            </span>
            <h2 className="font-heading font-normal text-5xl md:text-[4.2rem] mb-8 text-background leading-[0.92] tracking-[-0.02em] text-balance">
              Áreas principales de trabajo
            </h2>
            <p className="text-background/72 leading-[1.68] mb-10 text-[1.04rem]">
              Nuestra oferta se organiza en áreas definidas para construir
              presencia, orden y consistencia en distintos niveles del proyecto.
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
            <Button asChild variant="outline" className="hidden lg:inline-flex border-white/26 text-background hover:bg-background hover:text-foreground">
              <Link href="/servicios">Explorar servicios</Link>
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
                  className="group border-b border-white/12 py-11 md:py-16 bg-transparent transition-colors duration-500 hover:bg-white/[0.04] px-6 -mx-6"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <h3 className="font-heading font-normal text-4xl md:text-[2.9rem] text-background group-hover:text-primary/95 transition-colors duration-300 leading-[1] tracking-[-0.01em]">{service.title}</h3>
                    <motion.div
                      whileHover={{ scale: 1.1, x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ArrowRight className="text-primary/55 -rotate-45 transition-all duration-300 group-hover:text-primary group-hover:rotate-0 w-8 h-8" />
                    </motion.div>
                  </div>
                  <p className="text-background/72 leading-[1.68] max-w-xl text-[1.06rem] group-hover:text-background transition-colors duration-300">{service.description}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <Button asChild variant="outline" className="w-full border-white/26 text-background hover:bg-background hover:text-foreground">
                <Link href="/servicios">Explorar servicios</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
}
