"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 bg-accent/18 border-t border-foreground/8">
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
          <source src="https://videos.pexels.com/video-files/3194277/3194277-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(250,241,231,0.9),rgba(250,241,231,0.82))]" />
      </div>
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.08]" />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75 }}
          className="mx-auto max-w-5xl border border-foreground/12 bg-background/78 p-9 md:p-14 lg:p-16 backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <h2 className="font-heading font-normal text-4xl md:text-[3.8rem] leading-[0.92] tracking-[-0.02em] text-foreground mb-6 text-balance">
                Una presencia mejor resuelta cambia la forma en que una marca es
                percibida.
              </h2>
              <p className="text-[1.05rem] text-foreground/72 leading-[1.66] max-w-3xl">
                Si tu proyecto necesita una estructura mas clara, una comunicacion
                mas solida o una presencia digital mas alineada con su nivel,
                podemos ayudarte a construir esa base con criterio y precision.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <Button asChild size="lg" className="w-full rounded-[0.45rem]">
                <Link href="/contacto">Hablemos sobre tu proyecto</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full rounded-[0.45rem]">
                <Link href="/contacto">Ir a contacto</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
