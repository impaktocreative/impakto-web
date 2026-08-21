"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealLine } from "@/components/ui/Reveal";
import CoherenceField from "@/components/home/CoherenceField";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STAGGER_MEDIUM_CONTAINER = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.065,
    },
  },
};

const STAGGER_FAST_CONTAINER = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.02,
      staggerChildren: 0.03,
    },
  },
};

const STAGGER_ITEM_MEDIUM = {
  hidden: { opacity: 0, y: 22, scale: 0.99, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.64, ease: EASE_LUXURY },
  },
};

const STAGGER_ITEM_FAST = {
  hidden: { opacity: 0, y: 16, scale: 0.992, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_LUXURY },
  },
};

const storyChapters = [
  "Impakto Creative nace desde una convicción clara: las marcas no escalan por volumen de acciones, escalan cuando existe dirección, criterio y consistencia en cada punto de contacto.",
  "Integramos estrategia, diseño, desarrollo y visión comercial en un mismo sistema de trabajo para tomar decisiones con profundidad y ejecutar con precisión.",
  "Combinamos experiencia senior con tecnología de vanguardia, incluida IA aplicada con criterio, para convertir contexto complejo en pasos concretos de crecimiento.",
];

const teamCapabilities = [
  {
    title: "Estrategia y comunicación",
    description:
      "Diagnóstico de contexto, posicionamiento y narrativa para definir decisiones de marca con foco y jerarquía.",
  },
  {
    title: "Diseño y desarrollo digital",
    description:
      "Diseño y sistema digital alineados para construir experiencias consistentes con el estándar de cada organización.",
  },
  {
    title: "Contenido y dirección editorial",
    description:
      "Arquitectura de mensajes, tono y contenido para sostener una comunicación sólida entre canales y etapas comerciales.",
  },
  {
    title: "Tecnología y mejora continua",
    description:
      "Optimización continua con herramientas de vanguardia para acelerar resultados sin perder criterio estratégico.",
  },
];

const trustLogos = [
  { file: "venfarma.jpeg", name: "Venfarma" },
  { file: "rebecca.webp", name: "Rebecca" },
  { file: "ras.png", name: "RAS" },
  { file: "neicha.jpg", name: "Neicha" },
  { file: "hsm.jpg", name: "HSM" },
  { file: "hk-logo.webp", name: "HK" },
  { file: "carballal-prop.jpg", name: "Carballal" },
  { file: "Floyd-logo.svg", name: "Floyd" },
];

const logoOpticalScale: Record<string, string> = {
  "venfarma.jpeg": "scale-[0.9]",
  "rebecca.webp": "scale-[0.92]",
  "ras.png": "scale-[0.84]",
  "neicha.jpg": "scale-[0.88]",
  "hsm.jpg": "scale-[0.86]",
  "hk-logo.webp": "scale-[0.9]",
  "carballal-prop.jpg": "scale-[0.87]",
  "Floyd-logo.svg": "scale-[0.94]",
};

const decisionSignals = [
  { value: 20, prefix: "+", suffix: "", label: "Años" },
  { value: 360, prefix: "", suffix: "°", label: "Visión" },
  { value: 4, prefix: "", suffix: "", label: "Frentes" },
  { value: 24, prefix: "", suffix: "/7", label: "Compromiso" },
];

const technicalSignature = [
  "Dirección estratégica",
  "Diseño editorial",
  "Motion systems",
  "Next.js 16",
  "React 19",
  "Framer Motion",
  "Automatización IA",
  "Arquitectura digital",
];

const directorBio = [
  "Rodrigo Zarza lidera la dirección creativa del estudio con una mirada que articula estrategia, sensibilidad estética y criterio de negocio.",
  "Su trabajo parte de una lectura profunda de cada marca para diseñar narrativas claras, sistemas visuales consistentes y decisiones con valor de largo plazo.",
  "Acompaña cada proyecto desde la primera sesión hasta la implementación, con los colaboradores que haga falta sumar en el camino.",
];

const directorHighlights = ["Dirección estratégica", "Narrativa de marca", "Ejecución integral"];

function CountUp({
  to,
  prefix = "",
  suffix = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let frame = 0;
    const start = performance.now();
    const duration = 1600;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

export default function AgenciaContent() {
  const mainRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 });
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], [0, prefersReducedMotion ? 0 : 80]);
  const heroOpacity = useTransform(heroProgress, [0, 0.95], [1, 0.74]);

  return (
    <main id="contenido-principal" ref={mainRef} className="flex-grow pt-[88px]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-[linear-gradient(90deg,rgba(154,154,154,0.18)_0%,rgba(194,173,122,0.95)_36%,rgba(152,152,152,0.5)_100%)]"
        style={{ scaleX: progressScale }}
      />

      <section ref={heroRef} className="relative overflow-hidden border-b border-graphite/8 bg-paper pb-16 pt-16 md:pb-28 md:pt-24 lg:pb-32 lg:pt-28">
        {/* Acá había un hotlink a Unsplash de 2200px con opacity 0.12 sobre dos
            gradientes: invisible en la práctica, pero era el elemento del LCP
            de esta página, a 8.2 s. La textura la aportan el mesh y TechNodes. */}
        <div className="pointer-events-none absolute inset-0">
          <CoherenceField />

        {/* Mismo velo que en el home: el campo es textura de fondo, no
            puede competir con el texto que lo cruza. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-paper)_86%,transparent)_0%,color-mix(in_srgb,var(--color-paper)_70%,transparent)_58%,transparent_100%)] lg:bg-[radial-gradient(115%_78%_at_16%_42%,var(--color-paper)_16%,color-mix(in_srgb,var(--color-paper)_60%,transparent)_50%,transparent_76%)]" />
        </div>
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(191,168,118,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(160,160,160,0.12) 1px, transparent 1px)",
              backgroundSize: "78px 78px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "70px 42px", "0px 0px"],
              opacity: [0.18, 0.38, 0.18],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-[6%] hidden w-px bg-gradient-to-b from-transparent via-foreground/15 to-transparent lg:block" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          {/* El wrapper conserva el parallax por scroll; la entrada pasa a CSS.
              Con los variants de framer el h1 arrancaba en opacity 0 + blur y
              el LCP no se registraba hasta después de hidratar. */}
          <motion.div className="max-w-[50rem]" style={{ y: heroY, opacity: heroOpacity }}>
              <p className="hero-rise flex items-center gap-2 text-eyebrow uppercase text-stone">
                <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
                Estudio
              </p>
              <h1 className="hero-rise hero-rise-delay-1 mt-5 max-w-[18ch] font-heading text-balance text-display-xl text-foreground">
                Veinte años ordenando marcas que <span className="gold-reflect gold-reflect-slow font-medium">necesitaban dirección</span>.
              </h1>
              <p className="hero-rise hero-rise-delay-2 mt-7 max-w-[46rem] text-body text-stone md:text-body-lg">
                Acompañamos compañías que necesitan elevar su posicionamiento con una dirección más clara, una ejecución más precisa y una presencia de marca más sólida.
              </p>
              <p className="hero-rise hero-rise-delay-3 mt-6 flex w-full max-w-[48rem] flex-wrap items-center gap-x-2 gap-y-1 border border-graphite/12 bg-paper-lift px-4 py-2 text-eyebrow font-medium uppercase text-stone md:w-fit">
                <span>+20 años de experiencia</span>
                <span className="text-stone">/</span>
                <span>Trabajo multidisciplinario</span>
                <span className="text-stone">/</span>
                <span>Acompañamiento estratégico</span>
              </p>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-graphite/8 bg-surface-muted py-4">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="overflow-hidden border border-graphite/12 bg-paper-lift py-2">
            <motion.div
              className="flex w-max items-center gap-8 px-5"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            >
              {[...technicalSignature, ...technicalSignature].map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-2 text-eyebrow uppercase text-stone">
                  <span className="h-1 w-1 rounded-full bg-primary/70" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
          <div className="mt-2 overflow-hidden border border-graphite/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.72),rgba(245,247,241,0.82))] py-1.5">
            <motion.div
              className="flex w-max items-center gap-10 px-6"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            >
              {[...technicalSignature, ...technicalSignature].map((item, index) => (
                <span key={`${item}-alt-${index}`} className="text-eyebrow uppercase text-stone">
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night py-16 text-paper md:py-16 lg:py-32">
        <Image
          src="/logos/icono-2.svg"
          alt=""
          aria-hidden="true"
          width={220}
          height={260}
          className="pointer-events-none absolute -right-8 bottom-8 hidden h-auto w-36 opacity-[0.08] lg:block"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-band via-band/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent via-band/30 to-band" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <p className="text-eyebrow uppercase text-primary/75">Quiénes somos</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 max-w-[16ch] font-heading text-balance text-display-lg text-paper">
              Un estudio que diseña y también <span className="gold-reflect gold-reflect-light gold-reflect-slow font-medium">implementa</span>.
            </h2>
          </Reveal>
          <RevealLine className="mt-6 block h-px w-28 bg-gradient-to-r from-primary/80 to-transparent" delay={0.12} />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-90px" }}
            variants={STAGGER_MEDIUM_CONTAINER}
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {storyChapters.map((chapter, index) => (
              <motion.article
                key={chapter}
                variants={STAGGER_ITEM_MEDIUM}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.45, ease: EASE_LUXURY }}
                className="edge-scan-card group relative overflow-hidden border border-white/12 bg-white/[0.03] p-6 md:p-7"
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
                  initial={{ scaleX: 0, opacity: 0.2 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: EASE_LUXURY }}
                  style={{ transformOrigin: "left center" }}
                />
                <p className="mb-3 flex items-center gap-2 text-eyebrow uppercase text-primary/76">
                  <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={8} height={10} className="h-2.5 w-auto" />
                  Capitulo {index + 1}
                </p>
                <p className="relative z-10 text-body text-ash">{chapter}</p>
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/18 blur-2xl"
                  animate={{ opacity: [0.1, 0.42, 0.1], scale: [0.92, 1.05, 0.92] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.24 }}
                />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-glow border-b border-graphite/8 bg-white py-16 md:py-22 lg:py-32">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-6">
              <p className="text-eyebrow uppercase text-stone">Cómo estamos conformados</p>
              <h2 className="mt-4 font-heading text-balance text-display-lg text-foreground">
                Cuatro frentes de trabajo bajo una misma <span className="gold-reflect gold-reflect-slow font-medium">dirección</span>.
              </h2>
            </Reveal>
            <Reveal className="max-w-[36rem] text-body text-stone lg:col-span-6 lg:justify-self-end" delay={0.1}>
              Cada proyecto se arma con los perfiles que necesita. La dirección es siempre la misma, así que las piezas terminan hablando entre sí.
            </Reveal>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-90px" }}
            variants={STAGGER_MEDIUM_CONTAINER}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {teamCapabilities.map((axis, index) => (
              <motion.article
                key={axis.title}
                variants={STAGGER_ITEM_MEDIUM}
                whileHover={{ y: -6, rotateX: 1.2, rotateY: -1.4, boxShadow: "0 32px 48px -30px rgba(50,50,47,0.46)" }}
                transition={{ duration: 0.45, ease: EASE_LUXURY }}
                className="edge-scan-card premium-grid-light relative border border-graphite/12 bg-paper-lift p-7 md:p-8"
                style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-gradient-to-b from-transparent via-primary/55 to-transparent"
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.16 }}
                />
                <p className="mb-3 flex items-center gap-2 text-eyebrow uppercase text-stone">
                  <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={8} height={10} className="h-2.5 w-auto opacity-65" />
                  Eje {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="font-heading text-display-xs text-ink">{axis.title}</h3>
                <p className="mt-4 text-body text-slate">{axis.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-graphite/8 bg-surface-muted py-16 md:py-18 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.85, ease: EASE_LUXURY }}
              className="lg:col-span-5"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-graphite/12 bg-white">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/18 via-black/6 to-transparent" />
                <Image
                  src="/team/rodrigo.jpg"
                  alt="Rodrigo Zarza, director creativo"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute bottom-4 left-4 border border-white/32 bg-black/45 px-3 py-2 backdrop-blur-sm">
                  <p className="text-eyebrow uppercase text-white/82">Rodrigo Zarza</p>
                  <p className="mt-0.5 text-eyebrow uppercase text-white/72">Director creativo</p>
                </div>
              </div>
            </motion.div>

            <Reveal className="lg:col-span-7" delay={0.08}>
              <article>
                <p className="text-eyebrow uppercase text-stone">Dirección creativa</p>
                <h3 className="mt-4 max-w-[16ch] font-heading text-balance text-display-lg text-foreground">
                  Rodrigo Zarza
                </h3>
                <p className="mt-2 text-eyebrow uppercase text-stone">Director creativo</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {directorHighlights.map((highlight, index) => (
                    <motion.span
                      key={highlight}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.55, delay: 0.18 + index * 0.05, ease: EASE_LUXURY }}
                      className="border border-graphite/12 bg-paper-lift px-3 py-1 text-eyebrow uppercase text-stone"
                    >
                      {highlight}
                    </motion.span>
                  ))}
                </div>

                <div className="mt-7 space-y-4 text-body text-slate">
                  {directorBio.map((paragraph, index) => (
                    <motion.p
                      key={paragraph}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.65, delay: 0.2 + index * 0.07, ease: EASE_LUXURY }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                <motion.blockquote
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.38, ease: EASE_LUXURY }}
                  className="mt-8 border-l-2 border-graphite/20 pl-4 text-body italic text-stone"
                >
                  &ldquo;La creatividad solo genera valor cuando tiene dirección, intención y una ejecución impecable.&rdquo;
                </motion.blockquote>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.48, ease: EASE_LUXURY }}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  <Button asChild size="lg" className="whitespace-normal text-center sm:whitespace-nowrap">
                    <Link href="/contacto">Pedir diagnóstico</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-graphite/30 bg-paper-lift text-slate hover:bg-white hover:text-foreground">
                    <Link href="/servicios">Ver servicios</Link>
                  </Button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.56, ease: EASE_LUXURY }}
                  className="mt-8 inline-flex border border-graphite/20 bg-paper-lift px-4 py-2 text-eyebrow uppercase text-stone"
                >
                  Biografía editorial en actualización
                </motion.p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-graphite/8 bg-band py-16 md:py-16 lg:py-18">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-90px" }}
            variants={STAGGER_MEDIUM_CONTAINER}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {decisionSignals.map((signal) => (
              <motion.article
                key={signal.label}
                variants={STAGGER_ITEM_MEDIUM}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: EASE_LUXURY }}
                className="relative border border-graphite/12 bg-white p-5 text-center md:p-6"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <p className="font-heading text-display-md text-ink">
                  <CountUp to={signal.value} prefix={signal.prefix} suffix={signal.suffix} />
                </p>
                <p className="mt-1 text-eyebrow uppercase text-stone">{signal.label}</p>
              </motion.article>
            ))}
          </motion.div>

          <Reveal delay={0.14}>
            <div className="mt-8 border border-graphite/12 bg-white p-4 md:p-6">
              <p className="mb-4 flex items-center gap-2 text-eyebrow uppercase text-stone">
                <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={8} height={10} className="h-2.5 w-auto opacity-65" />
                Marcas que confiaron en Impakto
              </p>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-90px" }}
                variants={STAGGER_FAST_CONTAINER}
                className="grid grid-cols-2 gap-3 md:grid-cols-4"
              >
                {trustLogos.map((logo) => (
                  <motion.div
                    key={logo.file}
                    variants={STAGGER_ITEM_FAST}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.38, ease: EASE_LUXURY }}
                    className="flex h-[6rem] items-center justify-center border border-graphite/8 bg-surface px-4"
                  >
                    <div className="relative h-[3.4rem] w-full max-w-[182px]">
                      <Image
                        src={encodeURI(`/logos/clientes/${logo.file}`)}
                        alt={logo.name}
                        fill
                        // La celda topea en 182px de ancho.
                        sizes="182px"
                        className={`object-contain object-center grayscale opacity-75 ${logoOpticalScale[logo.file] ?? "scale-100"}`}
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night-soft py-16 text-paper md:py-18 lg:py-16">
        {/* Segundo hotlink a Unsplash de 2200px, a opacity 0.12 y debajo de un
            overlay de 0.82-0.92: no llegaba a verse. Queda la grilla. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-band via-band/50 to-transparent" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <div className="border border-white/14 bg-white/[0.03] p-9 md:p-12 lg:p-14">
              <p className="text-eyebrow uppercase text-primary/78">Compromiso Impakto</p>
              <h2 className="mt-4 max-w-[15ch] font-heading text-balance text-display-lg text-paper">
                Nos involucramos de verdad en cada marca para que avance con <span className="gold-reflect gold-reflect-light gold-reflect-slow font-medium">más seguridad</span>.
              </h2>
              <p className="mt-7 max-w-[44rem] text-body text-ash md:text-body-lg">
                Acompañamos todo el proceso con consultoría ejecutiva y dirección creativa para convertir decisiones estratégicas en resultados sostenibles.
              </p>

              <p className="mt-5 inline-flex items-center gap-2 border border-white/24 bg-paper-lift px-4 py-2 text-eyebrow uppercase text-white/82">
                <span>Sesiones de diagnóstico</span>
                <span className="text-white/45">/</span>
                <span>Respuesta inicial en 24h hábiles</span>
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    variant="invert"
                    className="whitespace-normal text-center sm:whitespace-nowrap"
                >
                  <Link href="/contacto">Pedir diagnóstico</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="invert-outline"
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
