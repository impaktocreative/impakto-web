"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealLine } from "@/components/ui/Reveal";
// El campo de flechas dice dirección; acá el titular habla de estructura,
// así que la pieza son módulos que encajan en retícula al acercarse el cursor.
import Estructuras from "@/components/visual/Estructuras";
import { areasDeTrabajo, ejesDeCrecimiento, perfilesDeColaboracion, programasEstrategicos, senalesDeClienteIdeal } from "@/content/sitio";
import { ArrowRight } from "lucide-react";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STAGGER_MEDIUM = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.07,
    },
  },
};

const STAGGER_FAST = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.02,
      staggerChildren: 0.04,
    },
  },
};

const ITEM_MEDIUM = {
  hidden: { opacity: 0, y: 24, scale: 0.988, filter: "blur(7px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.74, ease: EASE_LUXURY },
  },
};

const ITEM_FAST = {
  hidden: { opacity: 0, y: 16, scale: 0.992, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.54, ease: EASE_LUXURY },
  },
};

const stageCtas = [
  {
    stage: "Captación",
    need: "Necesito atraer mejores oportunidades",
    action: "Mejorar captación",
  },
  {
    stage: "Conversión",
    need: "Necesito convertir mejor lo que ya llega",
    action: "Mejorar conversión",
  },
  {
    stage: "Retención",
    need: "Necesito sostener y escalar relaciones",
    action: "Mejorar retención",
  },
];

export default function ServiciosContent() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="relative overflow-hidden border-b border-graphite/8 bg-paper pb-16 pt-16 md:pb-24 md:pt-24 lg:pb-26 lg:pt-28">
        <div className="pointer-events-none absolute inset-0">
          <Estructuras />

        {/* Mismo velo que en el home: el campo es textura de fondo, no
            puede competir con el texto que lo cruza. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-paper)_86%,transparent)_0%,color-mix(in_srgb,var(--color-paper)_70%,transparent)_58%,transparent_100%)] lg:bg-[radial-gradient(115%_78%_at_16%_42%,var(--color-paper)_16%,color-mix(in_srgb,var(--color-paper)_60%,transparent)_50%,transparent_76%)]" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-[7%] hidden w-px bg-gradient-to-b from-transparent via-foreground/14 to-transparent lg:block" />

        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          {/* Hero above the fold: entrada por CSS, no por framer-motion.
              Con `initial="hidden"` el h1 y el párrafo se pintaban recién al
              hidratar y el LCP se iba a 3.1 s. */}
          <div className="max-w-[52rem]">
            <p className="hero-rise flex items-center gap-2 text-eyebrow uppercase text-stone">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
              Servicios estratégicos
            </p>
            <h1 className="hero-rise hero-rise-delay-1 mt-5 max-w-[18ch] font-heading text-balance text-display-xl text-foreground">
              Una estructura para captar, convertir y retener con mayor precisión.
            </h1>
            <p className="hero-rise hero-rise-delay-2 mt-7 max-w-[50rem] text-body text-slate md:text-body-lg">
              Acompañamos organizaciones orientadas a resultados. En lugar de ejecutar herramientas aisladas, diseñamos planes estratégicos integrales para mejorar percepción, rendimiento comercial y sostenibilidad del crecimiento.
            </p>
            <p className="hero-rise hero-rise-delay-3 mt-5 inline-flex flex-wrap items-center gap-2 text-eyebrow uppercase text-stone">
              Beneficios medibles
              <span className="text-stone">/</span>
              Dirección + implementación
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-graphite/8 bg-night py-16 text-paper md:py-16 lg:py-32">
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <h2 className="max-w-[18ch] font-heading text-balance text-display-lg">
              Marco estratégico en tres frentes de crecimiento.
            </h2>
          </Reveal>
          <RevealLine className="mt-6 block h-px w-28 bg-gradient-to-r from-gold/85 to-transparent" delay={0.06} />

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -90px 0px" }}
            variants={STAGGER_MEDIUM}
            className="mt-12 grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-3"
          >
            {ejesDeCrecimiento.map((category) => (
              <motion.article key={category.title} variants={ITEM_MEDIUM} className="bloque-noche group relative py-8 md:py-9">
                <span className="bloque-filete" aria-hidden="true" />
                <p className="text-eyebrow uppercase tabular-nums text-gold/85">{category.id}</p>
                <h3 className="mt-3 font-heading text-display-xs">{category.title}</h3>
                <p className="mt-4 text-body text-ash">{category.promise}</p>
                <ul className="mt-6">
                  {category.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 border-t border-white/10 py-2.5 text-body-sm text-ash last:border-b last:border-white/10">
                      <span className="mt-2.5 h-px w-3 shrink-0 bg-gold/70" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-graphite/8 bg-white py-16 md:py-18">
        <div className="container mx-auto grid max-w-[1320px] gap-8 px-7 md:px-12 lg:grid-cols-12 lg:items-end lg:px-14 xl:px-16">
          <Reveal className="lg:col-span-7">
            <h2 className="font-heading text-balance text-display-lg text-foreground">
              Programas diseñados para impacto comercial medible.
            </h2>
          </Reveal>
          <Reveal className="max-w-[34rem] text-body text-stone lg:col-span-5 lg:justify-self-end" delay={0.08}>
            Priorizamos decisiones según retorno estratégico: qué activar primero, qué ordenar después y qué consolidar para sostener resultados.
          </Reveal>
        </div>
      </section>

      <section className="section-glow relative overflow-hidden border-b border-graphite/8 bg-band py-18 md:py-22">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -100px 0px" }} variants={STAGGER_MEDIUM} className="border-b border-graphite/12">
            {programasEstrategicos.map((program, index) => (
              <motion.article
                key={program.title}
                variants={ITEM_MEDIUM}
                className="bloque-programa group relative py-10 md:py-14"
              >
                <span className="bloque-filete" aria-hidden="true" />
                <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-7">
                    <p className="flex items-center gap-3 text-eyebrow uppercase text-stone">
                      <span className="h-px w-6 bg-gold/70 transition-all duration-slow group-hover:w-10" />
                      Programa {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 max-w-[18ch] font-heading text-balance text-display-md text-ink">
                      {program.title}
                    </h3>
                    <p className="mt-4 max-w-[44rem] text-body text-slate md:text-body-lg">{program.outcome}</p>
                  </div>

                  <div className="lg:col-span-4 lg:col-start-9">
                    <p className="text-eyebrow uppercase text-stone">Incluye</p>
                    <ul className="mt-4">
                      {program.scope.map((item) => (
                        <li key={item} className="flex items-start gap-3 border-t border-graphite/10 py-2.5 last:border-b last:border-graphite/10">
                          <span className="mt-2.5 h-px w-3 shrink-0 bg-gold/70" />
                          <span className="text-body-sm text-slate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="text-eyebrow uppercase text-stone/80">Implementación por etapas según prioridad de negocio</p>
                  <Link
                    href="/contacto"
                    className="enlace-flecha inline-flex items-center gap-2 text-body-sm font-medium text-ink"
                  >
                    {program.cta}
                    <ArrowRight size={15} className="transition-transform duration-base" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-graphite/8 bg-white py-22 md:py-22">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-5">
              <p className="text-eyebrow uppercase text-stone">En qué trabajamos puntualmente</p>
              <h2 className="mt-4 font-heading text-balance text-display-md text-foreground">
                Frentes de trabajo que integramos dentro de una estrategia de negocio.
              </h2>
            </Reveal>
            <Reveal className="max-w-[38rem] text-body text-stone lg:col-span-7 lg:justify-self-end md:text-body-lg" delay={0.08}>
              Estas capacidades se activan según etapa, contexto y objetivo. El valor no está en la herramienta aislada, sino en la integración correcta para mejorar captación, conversión y retención.
            </Reveal>
          </div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -90px 0px" }} variants={STAGGER_FAST} className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {areasDeTrabajo.map((domain) => (
              <motion.article key={domain.title} variants={ITEM_FAST} whileHover={{ y: -4 }} className="rounded-panel border border-graphite/12 bg-band p-6">
                <h3 className="font-heading text-display-xs text-slate">{domain.title}</h3>
                <ul className="mt-5 space-y-2.5 border-t border-graphite/12 pt-5">
                  {domain.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-body text-slate">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>

          <Reveal delay={0.12}>
            <div className="mt-8 rounded-card border border-graphite/12 bg-white p-5 md:p-6">
              <p className="text-eyebrow uppercase text-stone">Modalidad de colaboración</p>
              <p className="mt-3 max-w-[62rem] text-body text-stone">
                Podemos liderar el frente estratégico completo o integrarnos con equipos internos y agencias asociadas para ejecutar proyectos en conjunto, manteniendo dirección, criterio y estándar de implementación.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {perfilesDeColaboracion.map((profile) => (
                  <span key={profile} className="border border-graphite/12 bg-surface px-3.5 py-2 text-eyebrow uppercase text-stone">
                    {profile}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-graphite/8 bg-band py-22 md:py-22">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-6">
              <p className="text-eyebrow uppercase text-stone">Encaje de cliente</p>
              <h2 className="mt-4 font-heading text-balance text-display-lg text-foreground">
                Con qué tipo de marca funcionamos mejor.
              </h2>
            </Reveal>
            <Reveal className="max-w-[35rem] text-body text-stone lg:col-span-6 lg:justify-self-end md:text-body-lg" delay={0.08}>
              Este enfoque es ideal para compañías que buscan construir activos de marca y sistemas comerciales con lógica de crecimiento sostenido.
            </Reveal>
          </div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -90px 0px" }} variants={STAGGER_FAST} className="mt-12 grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-3">
            {senalesDeClienteIdeal.map((signal, index) => (
              <motion.article
                key={signal.title}
                variants={ITEM_FAST}
                className="bloque-programa group relative py-7 md:py-8"
              >
                <span className="bloque-filete" aria-hidden="true" />
                <p className="text-eyebrow uppercase text-stone/80 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-heading text-display-xs text-ink">{signal.title}</h3>
                <p className="mt-3 text-body-sm text-stone">{signal.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-graphite/8 bg-band py-22 md:py-22">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-6">
              <p className="text-eyebrow uppercase text-stone">Punto de partida</p>
              <h2 className="mt-4 font-heading text-balance text-display-lg text-foreground">
                Definí el frente que hoy necesita mayor impacto.
              </h2>
            </Reveal>
            <Reveal className="max-w-[35rem] text-body text-stone lg:col-span-6 lg:justify-self-end md:text-body-lg" delay={0.08}>
              Si aún no está claro por dónde empezar, lo definimos en una sesión estratégica inicial.
            </Reveal>
          </div>

          {/* Este bloque eran tarjetas dentro de otra tarjeta: tres columnas
              idénticas, cada una con su caja, su cita y su botón fantasma.
              Es el patrón de plantilla. La caja no se maquilla, se saca: la
              jerarquía la hacen el número, el tamaño de la cita y el espacio,
              y las columnas se separan con filete en lugar de borde. */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -90px 0px" }}
            variants={STAGGER_FAST}
            className="mt-16"
          >
            <div className="flex items-center gap-4">
              <span className="text-eyebrow uppercase text-stone">Frente prioritario</span>
              <span className="hairline-gold h-px flex-1" />
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3">
              {stageCtas.map((item, i) => (
                <motion.article
                  key={item.stage}
                  variants={ITEM_FAST}
                  className="group relative border-t border-graphite/12 pt-7 md:border-l md:border-t-0 md:pl-8 md:pt-0 md:first:border-l-0 md:first:pl-0 [&:not(:first-child)]:mt-9 md:[&:not(:first-child)]:mt-0"
                >
                  {/* El filete dorado se dibuja desde arriba al pasar por la
                      columna: marca dónde está el lector sin encerrarla. */}
                  <span className="pointer-events-none absolute -left-px top-0 hidden h-full w-px origin-top scale-y-0 bg-[linear-gradient(180deg,var(--color-gold),transparent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 md:block" />

                  <p className="text-eyebrow uppercase text-stone">Usted hoy dice</p>

                  <div className="mt-5 flex items-start gap-5">
                    <span className="font-heading text-display-md leading-none text-cloud tabular-nums">
                      0{i + 1}
                    </span>
                    <p className="font-heading text-display-sm text-ink">
                      &ldquo;{item.need}&rdquo;
                    </p>
                  </div>

                  <p className="mt-6 text-eyebrow uppercase text-primary-ink">{item.stage}</p>

                  {/* El botón deja de ser una píldora dentro de una caja y pasa
                      a ser enlace con filete que se dibuja: tres píldoras
                      iguales en fila eran la marca más clara de plantilla. */}
                  <Link
                    href="/contacto"
                    className="group/enlace mt-4 inline-flex items-center gap-2 pb-1 text-body-sm font-medium text-ink"
                  >
                    <span className="relative">
                      {item.action}
                      <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--hairline-gold)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/enlace:scale-x-100" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-primary-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/enlace:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </Link>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night-soft py-18 text-paper md:py-20">
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <div className="relative grid grid-cols-1 items-end gap-10 pt-12 lg:grid-cols-12 lg:gap-14">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/75 via-white/12 to-transparent" />
              <div className="lg:col-span-7">
              <p className="text-eyebrow uppercase text-gold/85">Siguiente paso</p>
              <h2 className="mt-4 max-w-[15ch] font-heading text-balance text-display-lg text-paper">
                Definimos qué frentes priorizar para acelerar resultados con control.
              </h2>
              <p className="mt-8 max-w-[40rem] text-body text-ash">
                Si hoy la marca necesita mejorar captación, conversión o retención, una sesión estratégica permite ordenar el mapa de decisiones y establecer una hoja de ruta concreta.
              </p>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-4 lg:col-start-9">
                <Button
                  asChild
                  size="lg"
                  variant="invert"
                  className="h-auto min-h-14 w-full text-center leading-tight whitespace-normal sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
                >
                  <Link href="/contacto">Pedir diagnóstico</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="invert-outline"
                  className="h-auto min-h-14 w-full px-6 py-4 text-center leading-tight whitespace-normal sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
                >
                  <Link href="/agencia">Conocer el estudio</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
