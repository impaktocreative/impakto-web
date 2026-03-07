"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="py-32 lg:py-48 bg-accent/30 relative overflow-hidden">
            {/* Decorative center element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/5 to-transparent blur-3xl rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="font-heading italic text-4xl md:text-5xl lg:text-7xl text-foreground mb-8 leading-tight">
                        Una presencia mejor resuelta cambia la forma en que una marca es percibida.
                    </h2>

                    <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        Si tu proyecto necesita una estructura más clara, una comunicación más sólida o una presencia digital más alineada con su nivel, podemos ayudarte a construir esa base con criterio y precisión.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link href="/contacto">Hablemos sobre tu proyecto</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link href="/contacto">Ir a contacto</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
