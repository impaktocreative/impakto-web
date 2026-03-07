"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
            {/* Background abstract elements for premium feel (reflow.ai inspired) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#afa385]/10 to-transparent blur-3xl rounded-full translate-x-1/4 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-[#9aa490]/10 to-transparent blur-3xl rounded-full -translate-x-1/4 translate-y-1/4" />
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl"
                >
                    <h1 className="font-heading italic text-5xl md:text-7xl lg:text-8xl text-foreground mb-8 leading-[1.1] tracking-tight">
                        Construimos presencia digital para marcas que valoran claridad, solidez y criterio.
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-xl text-foreground/75 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Impakto Creative desarrolla estructuras digitales, comunicación y diseño para marcas y negocios que necesitan una presencia mejor resuelta, más coherente y alineada con su verdadero nivel.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
                    >
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link href="/contacto">Agendar una reunión</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link href="/servicios">Ver servicios</Link>
                        </Button>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-sm tracking-widest uppercase font-medium text-foreground/50"
                    >
                        Estrategia, desarrollo web, comunicación y sistemas digitales con un estándar claro de calidad.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
