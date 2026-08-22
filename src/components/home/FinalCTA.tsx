"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20 bg-surface-muted border-t border-graphite/8">
      {/* Acá había un <video> con hotlink a videos.pexels.com. Devolvía 403,
          así que nunca se veía, y arrastraba cookies de terceros de Cloudflare
          y errores de consola que bajaban Best Practices a 73. */}
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--color-surface)_90%,transparent),color-mix(in_srgb,var(--color-surface)_82%,transparent))]" />
      </div>
      <div className="pointer-events-none absolute right-[8%] top-10 hidden lg:block opacity-[0.08]">
        <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={62} height={76} className="h-16 w-auto" />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75 }}
          className="relative pt-12 md:pt-16"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/70 via-graphite/12 to-transparent" />
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p className="mb-5 flex items-center gap-2 text-eyebrow uppercase text-stone">
                <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
                Impakto Creative
              </p>
              <h2 className="mb-7 text-balance font-heading text-display-xl text-foreground">
                Una presencia <span className="gold-reflect">mejor resuelta</span> cambia la forma en que una marca es
                percibida.
              </h2>
              <p className="max-w-[38rem] text-body-sm text-slate md:text-body-lg">
                Si tu proyecto necesita una estructura más clara o una presencia digital
                que esté a la altura de lo que vendés, esa base la construimos nosotros.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9">
              <Button
                asChild
                size="lg"
                className="min-h-[3.55rem] w-full rounded-card px-7 text-eyebrow whitespace-normal text-center md:px-10 md:whitespace-nowrap"
              >
                <Link href="/contacto" className="text-center leading-tight">
                  Pedir diagnóstico
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full min-h-[3.35rem] rounded-card px-9 md:px-11 text-eyebrow"
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
