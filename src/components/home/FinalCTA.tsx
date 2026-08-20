"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 bg-surface-muted border-t border-foreground/8">
      {/* Acá había un <video> con hotlink a videos.pexels.com. Devolvía 403,
          así que nunca se veía, y arrastraba cookies de terceros de Cloudflare
          y errores de consola que bajaban Best Practices a 73. La textura de
          la sección la dan tech-grid-soft, cta-flow-bg y los orbes de abajo. */}
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-surface)_90%,transparent),color-mix(in_srgb,var(--color-surface)_82%,transparent))]" />
      </div>
      <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 hidden lg:block cta-flow-bg opacity-[0.24]" />
      <div className="pointer-events-none absolute right-[8%] top-10 hidden lg:block opacity-[0.08]">
        <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={62} height={76} className="h-16 w-auto" />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 top-10 bottom-10 hidden rounded-panel bg-[radial-gradient(circle_at_20%_40%,rgba(164,154,130,0.2),transparent_52%),radial-gradient(circle_at_80%_65%,rgba(142,155,147,0.18),transparent_55%)] blur-2xl lg:block"
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
          className="relative mx-auto max-w-5xl border border-foreground/12 bg-white/84 p-9 md:p-14 lg:p-16 backdrop-blur-sm shadow-premium-lift"
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 hidden h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent lg:block" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="mb-5 flex items-center gap-2 text-eyebrow uppercase tracking-[0.2em] text-foreground/44">
                <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
                Impakto Creative
              </p>
              <h2 className="mb-6 max-w-[10.5ch] text-balance font-heading text-display-lg font-normal tracking-[-0.01em] text-foreground md:max-w-none md:tracking-[-0.02em]">
                Una presencia <span className="gold-reflect">mejor resuelta</span> cambia la forma en que una marca es
                percibida.
              </h2>
              <p className="max-w-3xl text-body-sm text-foreground/74 md:text-body">
                Si tu proyecto necesita una estructura más clara o una presencia digital
                que esté a la altura de lo que vendés, esa base la construimos nosotros.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4 lg:pl-4">
              <Button
                asChild
                size="lg"
                className="btn-gold-sweep-primary min-h-[3.55rem] w-full rounded-card px-7 text-eyebrow tracking-[0.06em] whitespace-normal text-center shadow-premium-lift md:px-10 md:tracking-[0.08em] md:whitespace-nowrap"
              >
                <Link href="/contacto" className="text-center leading-tight">
                  Pedir diagnóstico
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full min-h-[3.35rem] rounded-card px-9 md:px-11 text-eyebrow tracking-[0.08em]"
              >
                <Link href="/servicios" className="text-center leading-tight">
                  Ver servicios
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
