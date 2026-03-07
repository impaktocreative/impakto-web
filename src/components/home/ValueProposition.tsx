"use client";

import { motion } from "framer-motion";

const values = [
    {
        title: "Dirección clara",
        description: "Ordenamos el enfoque general de la marca para que cada decisión visual, verbal y digital responda a una misma lógica."
    },
    {
        title: "Diseño con estándar",
        description: "Desarrollamos entornos y piezas que transmiten una percepción más cuidada, más sólida y más alineada con el valor real del negocio."
    },
    {
        title: "Estructura digital",
        description: "Construimos sitios y sistemas que mejoran la forma en que la marca se presenta, organiza su información y acompaña sus objetivos."
    },
    {
        title: "Comunicación mejor resuelta",
        description: "Escribimos y diseñamos contenidos con precisión, para que la marca pueda expresar su valor con más claridad y consistencia."
    }
];

export default function ValueProposition() {
    return (
        <section className="py-24 md:py-32 bg-background">
            <div className="container mx-auto px-6 md:px-12">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 md:mb-24 flex items-end justify-between border-b border-foreground/10 pb-8"
                >
                    <h2 className="font-heading italic text-4xl md:text-5xl text-foreground">Qué aportamos</h2>
                    <span className="text-sm tracking-widest uppercase font-medium text-foreground/40 hidden md:block">Propuesta de Valor</span>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-accent/30 p-10 md:p-12 hover:bg-accent/50 transition-colors duration-500 rounded-sm group"
                        >
                            <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6 group-hover:text-primary transition-colors">
                                {value.title}
                            </h3>
                            <p className="text-foreground/75 leading-relaxed text-lg">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
