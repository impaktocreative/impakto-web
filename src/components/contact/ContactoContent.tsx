"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ContactForm from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealLine } from "@/components/ui/Reveal";
import CoherenceField from "@/components/home/CoherenceField";
import { procesoDeDiagnostico } from "@/content/sitio";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const PROCESS_CONTAINER = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.08,
    },
  },
};

const PROCESS_ITEM = {
  hidden: { opacity: 0, y: 16, scale: 0.992, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: EASE_LUXURY },
  },
};

export default function ContactoContent() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="relative overflow-hidden border-b border-graphite/8 bg-paper pb-16 pt-16 md:pb-24 md:pt-24 lg:pb-26 lg:pt-28">
        <div className="pointer-events-none absolute inset-0">
          <CoherenceField />

        {/* Mismo velo que en el home: el campo es textura de fondo, no
            puede competir con el texto que lo cruza. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-paper)_86%,transparent)_0%,color-mix(in_srgb,var(--color-paper)_70%,transparent)_58%,transparent_100%)] lg:bg-[radial-gradient(115%_78%_at_16%_42%,var(--color-paper)_16%,color-mix(in_srgb,var(--color-paper)_60%,transparent)_50%,transparent_76%)]" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-[7%] hidden w-px bg-gradient-to-b from-transparent via-foreground/14 to-transparent lg:block" />

        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          {/* Hero above the fold: entrada por CSS en vez de Reveal, que gatea
              la opacidad detrás de la hidratación y retrasa el LCP. */}
          <p className="hero-rise flex items-center gap-2 text-eyebrow uppercase text-stone">
            <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
            Contacto estratégico
          </p>
          <h1 className="hero-rise hero-rise-delay-1 mt-5 max-w-[17ch] font-heading text-balance text-display-xl text-foreground">
            Contanos en qué está tu marca y te decimos por dónde conviene empezar.
          </h1>
          <p className="hero-rise hero-rise-delay-2 mt-7 max-w-[47rem] text-body text-slate md:text-body-lg">
            Si tu organización necesita mejorar posicionamiento, rendimiento comercial o estructura digital, este es el punto de partida para definir un plan de acción serio y viable.
          </p>
          <p className="hero-rise hero-rise-delay-3 mt-6 inline-flex flex-wrap items-center gap-3 text-eyebrow uppercase text-stone">
            Respuesta inicial en 24h hábiles
            <span className="text-stone">/</span>
            Sesión de diagnóstico
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-graphite/8 bg-band py-16 md:py-22">
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <Reveal>
                <h2 className="font-heading text-balance text-display-md text-foreground">
                  Una conversación clara acelera mejores decisiones.
                </h2>
                <p className="mt-6 text-body text-stone">
                  Contanos tu contexto y tu prioridad actual. Con esa base, respondemos con una orientación concreta y próximos pasos con criterio de implementación.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="mt-10 border-t border-graphite/14 pt-6">
                  <h3 className="flex items-center gap-3 text-eyebrow uppercase text-stone"><span className="h-px w-5 bg-gold/70" />Contacto directo</h3>
                  <div className="mt-4 space-y-2.5 text-body text-slate">
                    <a href="mailto:impaktoagency@gmail.com" className="block transition-colors hover:text-ink">
                      impaktoagency@gmail.com
                    </a>
                    <a href="https://wa.me/5491178421357" target="_blank" rel="noreferrer" className="block transition-colors hover:text-ink">
                      Argentina: +54 9 11 7842-1357
                    </a>
                    <a href="tel:+16152829799" className="block transition-colors hover:text-ink">
                      Exterior: +1 615 282 9799
                    </a>
                    <p className="text-stone">Ciudad de Buenos Aires, Argentina.</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <motion.div
                  className="mt-10"
                  variants={PROCESS_CONTAINER}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                >
                  {procesoDeDiagnostico.map((item) => (
                    <motion.article
                      key={item.step}
                      variants={PROCESS_ITEM}
                      className="bloque-programa group relative grid grid-cols-[2.8rem_1fr] gap-4 py-5"
                    >
                      <span className="bloque-filete" aria-hidden="true" />
                      <p className="font-heading text-display-xs tabular-nums leading-none text-graphite/25 transition-colors duration-slow group-hover:text-primary-ink">
                        {item.step}
                      </p>
                      <div>
                        <h3 className="font-heading text-lead text-ink">{item.title}</h3>
                        <p className="mt-2 text-body-sm text-stone">{item.description}</p>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </Reveal>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal>
                <div id="brief-contacto" className="relative pt-8">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/75 via-graphite/12 to-transparent" />
                  <p className="text-eyebrow uppercase text-stone">Brief inicial</p>
                  <h2 className="mt-4 font-heading text-display-md text-foreground">
                    Formulario de contacto
                  </h2>
                  <p className="mt-4 text-body text-stone">
                    Dejanos la información clave del proyecto para responder con una propuesta clara, realista y alineada con tu objetivo.
                  </p>
                  <RevealLine className="mt-6 block h-px w-24 bg-gradient-to-r from-gold/85 to-transparent" />
                  <div className="mt-7 border-t border-graphite/12 pt-7">
                    <ContactForm />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night-soft py-18 text-paper md:py-20">
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <div className="relative grid grid-cols-1 items-end gap-10 pt-12 lg:grid-cols-12 lg:gap-14">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/75 via-white/12 to-transparent" />
              <div className="lg:col-span-7">
              <p className="text-eyebrow uppercase text-gold/85">Perfil de trabajo</p>
              <h2 className="mt-4 max-w-[16ch] font-heading text-balance text-display-lg text-paper">
                Trabajamos con empresas que ya decidieron invertir en resolverlo bien.
              </h2>
              <p className="mt-7 max-w-[40rem] text-body text-ash">
                No somos la opción más barata y no intentamos serlo: acá se paga la decisión además de la ejecución. Esa es la diferencia entre un proveedor y un socio.
              </p>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-4 lg:col-start-9">
                <Button
                  asChild
                  size="lg"
                  variant="invert"
                  className="h-auto min-h-14 w-full text-center leading-tight whitespace-normal sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
                >
                  <Link href="#brief-contacto">Ir al formulario</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="invert-outline"
                  className="h-auto min-h-14 w-full px-6 py-4 text-center leading-tight whitespace-normal sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
                >
                  <Link href="/servicios">Ver servicios</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
