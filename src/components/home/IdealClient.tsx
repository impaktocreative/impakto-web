"use client";

import { motion } from "framer-motion";

const blocks = [
    {
        title: "Valoran claridad",
        description: "Entienden que una presencia fuerte necesita dirección, no solo producción."
    },
    {
        title: "Buscan solidez",
        description: "Quieren una marca mejor presentada, mejor articulada y más consistente en cada punto de contacto."
    },
    {
        title: "Reconocen el valor del proceso",
        description: "Saben que un buen resultado depende de decisiones bien pensadas y una ejecución cuidada."
    },
    {
        title: "Priorizan calidad",
        description: "Buscan una agencia con criterio, no solo una resolución rápida."
    }
];

export default function IdealClient() {
    return (
        <section className="py-24 md:py-32 bg-accent/20">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-heading italic text-4xl md:text-5xl lg:text-5xl text-foreground mb-8 leading-tight">
                            Trabajamos mejor con marcas y negocios que buscan una construcción seria y bien resuelta.
                        </h2>
                        <div className="space-y-6 text-foreground/75 leading-relaxed text-lg font-light">
                            <p>
                                Nuestros mejores proyectos surgen cuando existe intención real de ordenar la presencia de una marca, elevar su percepción y construir una base digital más sólida.
                            </p>
                            <p>
                                Impakto Creative conecta especialmente bien con empresas, marcas y equipos que valoran el criterio, la calidad y una dinámica de trabajo profesional.
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {blocks.map((block, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-background p-8 border border-foreground/5 rounded-sm hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300"
                            >
                                <h3 className="font-heading text-2xl text-foreground mb-4">
                                    {block.title}
                                </h3>
                                <p className="text-foreground/70 text-sm leading-relaxed">
                                    {block.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
