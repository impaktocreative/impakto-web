"use client";

import { motion } from "framer-motion";

export default function IntroPanel() {
    return (
        <section className="py-24 md:py-32 bg-foreground text-background">
            <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="font-heading italic text-4xl md:text-5xl lg:text-6xl mb-12 text-primary leading-tight"
                    >
                        La percepción de una marca se construye en cada decisión.
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 text-lg md:text-xl text-background/80 leading-relaxed font-light"
                    >
                        <div>
                            <p>
                                La forma en que una marca se presenta influye en cómo es entendida, valorada y recordada. Esa percepción no depende solo de una identidad visual o de un sitio correcto. Depende de la calidad del sistema completo.
                            </p>
                            <p className="mt-8 text-white font-medium">
                                Impakto Creative trabaja sobre esa base.
                            </p>
                        </div>
                        <div>
                            <p>
                                Desarrollamos sitios, mensajes, estructuras y piezas de comunicación que ordenan la presencia digital de una marca y le dan una expresión más clara, más sólida y mejor articulada. Cada proyecto se construye con criterio, precisión y una lógica que prioriza consistencia antes que volumen.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
