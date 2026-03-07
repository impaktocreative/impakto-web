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
    <section className="py-32 md:py-40 bg-background border-t border-foreground/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 lg:pr-8"
          >
            <span className="text-[0.8rem] tracking-[0.2em] uppercase font-medium text-primary mb-6 block">
              Áreas principales
            </span>
            <h2 className="font-heading italic text-5xl md:text-[4.5rem] mb-8 text-foreground leading-[1.05]">
              Áreas principales de trabajo
            </h2>
            <p className="text-foreground/60 font-light leading-[1.7] mb-12 text-lg">
              Nuestra oferta se organiza en áreas definidas para construir
              presencia, orden y consistencia en distintos niveles del proyecto.
            </p>
            <Button asChild variant="outline" className="hidden lg:inline-flex">
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
                  className="group border-b border-foreground/5 py-10 md:py-14 bg-transparent transition-colors duration-500 hover:bg-white/40 px-6 -mx-6 rounded-2xl"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <h3 className="font-heading font-medium text-4xl md:text-[3rem] text-foreground/90 group-hover:text-foreground transition-colors duration-300 leading-[1.1]">{service.title}</h3>
                    <motion.div
                      whileHover={{ scale: 1.1, x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ArrowRight className="text-primary/40 -rotate-45 transition-all duration-300 group-hover:text-primary group-hover:rotate-0 w-8 h-8" />
                    </motion.div>
                  </div>
                  <p className="text-foreground/60 font-light leading-[1.6] max-w-xl text-lg group-hover:text-foreground/80 transition-colors duration-300">{service.description}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <Button asChild variant="outline" className="w-full">
                <Link href="/servicios">Explorar servicios</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
}
