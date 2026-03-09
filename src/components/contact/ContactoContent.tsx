"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ContactForm from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealLine } from "@/components/ui/Reveal";
import AnimatedMeshBackground from "@/components/home/AnimatedMeshBackground";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const process = [
  {
    step: "01",
    title: "Contexto de negocio",
    description: "Revisamos situación actual, objetivos y restricciones para entender dónde está hoy el mayor punto de fricción.",
  },
  {
    step: "02",
    title: "Prioridades estratégicas",
    description: "Definimos qué conviene resolver primero para generar impacto real con criterio comercial y operativo.",
  },
  {
    step: "03",
    title: "Hoja de ruta",
    description: "Proponemos una estructura de trabajo clara, con etapas, alcance y próximos pasos para ejecutar con control.",
  },
];

export default function ContactoContent() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="relative overflow-hidden border-b border-foreground/8 bg-background pb-22 pt-16 md:pb-30 md:pt-24 lg:pb-34 lg:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(164,154,130,0.13),transparent_32%),radial-gradient(circle_at_90%_14%,rgba(142,155,147,0.12),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0">
          <AnimatedMeshBackground variant="hero" className="opacity-[0.46]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_78%,rgba(245,246,242,0),rgba(245,246,242,0.58)_72%,rgba(245,246,242,0.82)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-[7%] hidden w-px bg-gradient-to-b from-transparent via-foreground/14 to-transparent lg:block" />

        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <p className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.2em] text-foreground/45">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
              Contacto estratégico
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-5 max-w-[17ch] font-heading text-balance text-[clamp(2.2rem,6.2vw,4.9rem)] leading-[0.92] tracking-[-0.02em] text-foreground">
              Conversemos sobre el próximo paso de su marca.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[47rem] text-[1.05rem] leading-[1.74] text-foreground/70 md:text-[1.14rem]">
              Si su organización necesita mejorar posicionamiento, rendimiento comercial o estructura digital, este es el punto de partida para definir un plan de acción serio y viable.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 inline-flex flex-wrap items-center gap-2 border border-foreground/12 bg-white/75 px-4 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-foreground/62 md:text-[0.66rem]">
              Respuesta inicial en 24h hábiles
              <span className="text-foreground/30">/</span>
              Sesión de diagnóstico
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-foreground/8 bg-[#f7f8f5] py-20 md:py-26">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(164,154,130,0.08),transparent_30%)]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <Reveal>
                <h2 className="font-heading text-balance text-[clamp(1.95rem,3.3vw,3.3rem)] leading-[0.94] tracking-[-0.02em] text-foreground">
                  Una conversación clara acelera mejores decisiones.
                </h2>
                <p className="mt-6 text-[1.02rem] leading-[1.72] text-foreground/68">
                  Comparta su contexto y su prioridad actual. Con esa base, respondemos con una orientación concreta y próximos pasos con criterio de implementación.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="premium-grid-light mt-8 rounded-[1rem] border border-foreground/10 bg-white/82 p-6 shadow-[0_22px_36px_-34px_rgba(50,50,47,0.5)]">
                  <h3 className="text-[0.64rem] uppercase tracking-[0.2em] text-foreground/48">Contacto directo</h3>
                  <div className="mt-4 space-y-3 text-[0.98rem] text-foreground/78">
                    <a href="mailto:hola@impaktocreative.com" className="block transition-colors hover:text-primary">
                      hola@impaktocreative.com
                    </a>
                    <a href="https://wa.me/5491178421357" target="_blank" rel="noreferrer" className="block transition-colors hover:text-primary">
                      Argentina (WhatsApp): +54 9 11 7842-1357
                    </a>
                    <a href="tel:+16152829799" className="block transition-colors hover:text-primary">
                      Exterior: +1 615 282 9799
                    </a>
                    <p className="text-foreground/62">Ciudad de Buenos Aires, Argentina.</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="mt-8 space-y-4 border-t border-foreground/12 pt-6">
                  {process.map((item) => (
                    <motion.article
                      key={item.step}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.55, ease: EASE_LUXURY }}
                      className="grid grid-cols-[2.8rem_1fr] gap-3 rounded-[0.9rem] border border-foreground/10 bg-white/65 p-4"
                    >
                      <p className="font-heading text-[1.7rem] leading-none text-foreground/20">{item.step}</p>
                      <div>
                        <h3 className="font-heading text-[1.3rem] leading-[1] tracking-[-0.01em] text-foreground/90">{item.title}</h3>
                        <p className="mt-2 text-[0.96rem] leading-[1.62] text-foreground/66">{item.description}</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal>
                <div id="brief-contacto" className="relative overflow-hidden rounded-[1.15rem] border border-foreground/10 bg-white p-6 shadow-[0_30px_44px_-34px_rgba(50,50,47,0.52)] md:p-9">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                  <div className="pointer-events-none absolute -right-24 top-8 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-foreground/46">Brief inicial</p>
                  <h2 className="mt-4 font-heading text-[clamp(1.95rem,3vw,3.2rem)] leading-[0.94] tracking-[-0.02em] text-foreground">
                    Formulario de contacto
                  </h2>
                  <p className="mt-4 text-[1rem] leading-[1.7] text-foreground/64">
                    Comparta la información clave del proyecto para responder con una propuesta clara, realista y alineada con su objetivo.
                  </p>
                  <RevealLine className="mt-6 block h-px w-24 bg-gradient-to-r from-primary/80 to-transparent" />
                  <div className="mt-7 border-t border-foreground/10 pt-7">
                    <ContactForm />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#24282d] py-24 text-background md:py-30">
        <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.14]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(164,154,130,0.2),transparent_35%)]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <div className="mx-auto max-w-[1120px] border border-white/18 bg-white/[0.035] p-9 shadow-[0_40px_70px_-48px_rgba(0,0,0,0.7)] md:p-12">
              <p className="text-[0.66rem] uppercase tracking-[0.2em] text-primary/76">Perfil de trabajo</p>
              <h2 className="mt-4 max-w-[16ch] font-heading text-balance text-[clamp(2rem,3.8vw,3.8rem)] leading-[0.92] tracking-[-0.02em] text-background">
                Trabajamos mejor con proyectos que valoran criterio, proceso y ejecución.
              </h2>
              <p className="mt-7 max-w-[40rem] text-[1rem] leading-[1.74] text-background/84 md:text-[1.08rem]">
                Priorizamos relaciones profesionales con objetivos definidos y decisiones oportunas. Esa alineación permite construir soluciones con mayor coherencia, calidad y sostenibilidad.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Button
                  asChild
                  size="lg"
                  className="btn-tide h-auto min-h-14 w-full border border-white/60 bg-white text-center leading-tight whitespace-normal text-foreground shadow-[0_18px_34px_-26px_rgba(0,0,0,0.7)] hover:text-foreground [&::after]:bg-primary/42 sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
                >
                  <Link href="#brief-contacto">Solicitar diagnóstico inicial</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="cta-secondary-dark h-auto min-h-14 w-full px-6 py-4 text-center leading-tight whitespace-normal sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
                >
                  <Link href="/servicios">Ver soluciones por objetivo</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
