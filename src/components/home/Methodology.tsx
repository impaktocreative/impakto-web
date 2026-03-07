"use client";

import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Diagnóstico",
        description: "Analizamos el contexto, identificamos el punto real del proyecto y definimos qué necesita ser resuelto."
    },
    {
        number: "02",
        title: "Dirección",
        description: "Establecemos una base conceptual, verbal y estructural que ordena el trabajo posterior."
    },
    {
        number: "03",
        title: "Desarrollo",
        description: "Diseñamos y construimos los elementos necesarios con una lógica coherente y bien articulada."
    },
    {
        number: "04",
        title: "Implementación",
        description: "Llevamos la solución a su versión final con precisión visual, técnica y comunicacional."
    },
    {
        number: "05",
        title: "Optimización",
        description: "Ajustamos lo necesario para que la experiencia final responda mejor al uso real y al estándar esperado."
    }
];

export default function Methodology() {
    return (
        <section className="py-24 md:py-32 bg-foreground text-background">
            <div className="container mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mb-20"
                >
                    <span className="text-sm tracking-widest uppercase font-medium text-primary mb-6 block">Método de trabajo</span>
                    <h2 className="font-heading italic text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
                        Una estructura clara mejora el resultado.
                    </h2>
                    <p className="text-xl text-background/70 font-light leading-relaxed">
                        Cada proyecto se desarrolla a partir de una lógica ordenada. Esa estructura permite tomar mejores decisiones, sostener más consistencia y construir resultados con mayor solidez.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative">
                    {/* Connecting line for desktop */}
                    <div className="hidden lg:block absolute top-[28px] left-0 w-full h-[1px] bg-background/10 z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative z-10 p-6 md:p-8 border border-background/10 lg:border-none lg:p-0 bg-foreground group"
                        >
                            <div className="text-sm font-medium tracking-wider text-primary mb-6 lg:mb-10 lg:bg-foreground lg:inline-block lg:pr-4">
                                Paso {step.number}
                            </div>
                            <h3 className="font-heading text-2xl mb-4 text-white group-hover:text-primary transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-background/60 leading-relaxed text-sm md:text-base">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
