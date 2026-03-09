"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 bg-[#ecefe9] border-t border-foreground/8">
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
          <source src="https://videos.pexels.com/video-files/3194277/3194277-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(248,249,246,0.9),rgba(248,249,246,0.82))]" />
      </div>
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 hidden lg:block cta-flow-bg opacity-[0.24]" />
      <div className="pointer-events-none absolute right-[8%] top-10 hidden lg:block opacity-[0.08]">
        <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={62} height={76} className="h-16 w-auto" />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 top-10 bottom-10 hidden rounded-[2rem] bg-[radial-gradient(circle_at_20%_40%,rgba(164,154,130,0.2),transparent_52%),radial-gradient(circle_at_80%_65%,rgba(142,155,147,0.18),transparent_55%)] blur-2xl lg:block"
          animate={{ opacity: [0.34, 0.54, 0.38, 0.34] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 top-16 hidden h-56 w-56 rounded-full bg-primary/18 blur-3xl lg:block"
          animate={{ x: [0, 16, -6, 0], y: [0, -14, 8, 0], opacity: [0.36, 0.55, 0.42, 0.36] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 bottom-20 hidden h-64 w-64 rounded-full bg-secondary/16 blur-3xl lg:block"
          animate={{ x: [0, -14, 10, 0], y: [0, 10, -12, 0], opacity: [0.28, 0.44, 0.32, 0.28] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75 }}
          className="relative mx-auto max-w-5xl border border-foreground/12 bg-white/84 p-9 md:p-14 lg:p-16 backdrop-blur-sm shadow-[0_34px_54px_-36px_rgba(50,50,47,0.48)]"
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 hidden h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent lg:block" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="mb-5 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-foreground/44">
                <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
                Impakto Creative
              </p>
              <h2 className="mb-6 max-w-[10.5ch] text-balance font-heading text-[clamp(2rem,10.2vw,2.24rem)] font-normal leading-[0.98] tracking-[-0.01em] text-foreground md:max-w-none md:text-[3.8rem] md:leading-[0.92] md:tracking-[-0.02em]">
                Una presencia <span className="gold-reflect">mejor resuelta</span> cambia la forma en que una marca es
                percibida.
              </h2>
              <p className="max-w-3xl text-[0.92rem] leading-[1.58] text-foreground/74 md:text-[1.05rem] md:leading-[1.66]">
                Si su proyecto necesita una estructura más clara, una comunicación
                más sólida o una presencia digital mejor alineada con su nivel,
                desarrollamos esa base con criterio, precisión y foco en resultados.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4 lg:pl-4">
              <Button
                asChild
                size="lg"
                className="min-h-[3.55rem] w-full rounded-[0.86rem] px-7 text-[0.53rem] tracking-[0.07em] whitespace-normal text-center leading-[1.3] shadow-[0_18px_30px_-24px_rgba(50,50,47,0.52)] md:px-10 md:text-[0.62rem] md:tracking-[0.09em] md:whitespace-nowrap"
              >
                <Link href="/contacto" className="text-center leading-tight">
                  Solicitar diagnóstico inicial
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full min-h-[3.35rem] rounded-[0.82rem] px-9 md:px-11 text-[0.58rem] md:text-[0.62rem] tracking-[0.1em]"
              >
                <Link href="/contacto" className="text-center leading-tight">
                  Contar el objetivo del proyecto
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
