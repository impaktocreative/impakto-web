"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
    {
        title: "Estrategia y posicionamiento",
        description: "Dirección comunicacional y criterio de marca para proyectos que necesitan una base más clara sobre la cual construir."
    },
    {
        title: "Diseño y desarrollo web",
        description: "Sitios y landing pages pensados para proyectar mejor el nivel de la marca y ordenar su presencia digital."
    },
    {
        title: "Comunicación y contenido comercial",
        description: "Textos, piezas y materiales desarrollados para expresar el valor del negocio con más precisión."
    },
    {
        title: "Sistemas digitales y automatización",
        description: "Estructuras funcionales que mejoran procesos, contacto y organización operativa."
    }
];

export default function ServicesOverview() {
    return (
        <section className="py-24 md:py-32 bg-background border-t border-foreground/5">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-4 lg:pr-8"
                    >
                        <span className="text-sm tracking-widest uppercase font-medium text-primary mb-6 block">Áreas principales</span>
                        <h2 className="font-heading italic text-4xl mb-6 text-foreground">
                            Áreas principales de trabajo
                        </h2>
                        <p className="text-foreground/75 leading-relaxed mb-10 text-lg">
                            Nuestra oferta se organiza en áreas definidas que permiten construir presencia, orden y consistencia en distintos niveles del proyecto.
                        </p>
                        <Button asChild variant="outline" className="hidden lg:inline-flex">
                            <Link href="/servicios">Explorar servicios</Link>
                        </Button>
                    </motion.div>

                    {/* Service List */}
                    <div className="lg:col-span-7 lg:col-start-6">
                        <div className="flex flex-col gap-6">
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group block border border-foreground/10 p-8 hover:border-primary/50 transition-colors duration-300 rounded-sm bg-background"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-heading text-2xl text-foreground group-hover:text-primary transition-colors">
                                            {service.title}
                                        </h3>
                                        <ArrowRight className="text-foreground/20 group-hover:text-primary transition-colors -rotate-45 group-hover:rotate-0 duration-300" />
                                    </div>
                                    <p className="text-foreground/70 leading-relaxed max-w-xl">
                                        {service.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-10 lg:hidden"
                        >
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/servicios">Explorar servicios</Link>
                            </Button>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
