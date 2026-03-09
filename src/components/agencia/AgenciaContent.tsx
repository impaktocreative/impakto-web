"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealLine } from "@/components/ui/Reveal";
import AnimatedMeshBackground from "@/components/home/AnimatedMeshBackground";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STAGGER_SLOW_CONTAINER = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.09,
    },
  },
};

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

const STAGGER_ITEM_SLOW = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.68, ease: EASE_LUXURY },
  },
};

const STAGGER_ITEM_MEDIUM = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.56, ease: EASE_LUXURY },
  },
};

const STAGGER_ITEM_FAST = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: EASE_LUXURY },
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
  { value: "+20", label: "Años" },
  { value: "360°", label: "Visión" },
  { value: "1", label: "Equipo" },
  { value: "24/7", label: "Compromiso" },
];

const directorBio = [
  "Rodrigo Zarza lidera la dirección creativa del estudio con una mirada que articula estrategia, sensibilidad estética y criterio de negocio.",
  "Su trabajo parte de una lectura profunda de cada marca para diseñar narrativas claras, sistemas visuales consistentes y decisiones con valor de largo plazo.",
  "Desde la primera sesión hasta la implementación final, acompaña cada proyecto junto al equipo para traducir objetivos comerciales en experiencias de alto impacto.",
];

const directorHighlights = ["Dirección estratégica", "Narrativa de marca", "Ejecución integral"];

export default function AgenciaContent() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="relative overflow-hidden border-b border-foreground/8 bg-background pb-22 pt-16 md:pb-28 md:pt-24 lg:pb-32 lg:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(164,154,130,0.13),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(142,155,147,0.12),transparent_32%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(245,246,242,0.5), rgba(245,246,242,0.68)), url('https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=2200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="pointer-events-none absolute inset-0">
          <AnimatedMeshBackground variant="full" className="opacity-[0.6]" />
        </div>
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            aria-hidden="true"
            className="absolute inset-[-12%]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 14% 18%, rgba(191,168,118,0.32) 0%, transparent 34%), radial-gradient(circle at 84% 24%, rgba(191,168,118,0.24) 0%, transparent 36%), radial-gradient(circle at 52% 78%, rgba(154,164,144,0.2) 0%, transparent 42%)",
              backgroundSize: "170% 170%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 18%", "16% 100%", "0% 0%"],
              opacity: [0.56, 0.82, 0.68, 0.56],
              scale: [1, 1.04, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(191,168,118,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(154,164,144,0.12) 1px, transparent 1px)",
              backgroundSize: "78px 78px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "70px 42px", "0px 0px"],
              opacity: [0.18, 0.38, 0.18],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 -left-1/3 w-2/3 bg-gradient-to-r from-transparent via-primary/25 to-transparent blur-3xl"
            animate={{ x: ["-8%", "210%"], opacity: [0, 0.6, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-[-18%] bg-[radial-gradient(circle_at_50%_50%,rgba(245,246,242,0),rgba(245,246,242,0.36)_74%,rgba(245,246,242,0.64)_100%)]"
            animate={{ rotate: [0, 3.2, -2.4, 0], scale: [1, 1.025, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-[6%] hidden w-px bg-gradient-to-b from-transparent via-foreground/15 to-transparent lg:block" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <motion.div initial="hidden" animate="show" variants={STAGGER_SLOW_CONTAINER} className="max-w-[50rem]">
              <motion.p variants={STAGGER_ITEM_SLOW} className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.2em] text-foreground/45">
                <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
                Estudio
              </motion.p>
              <motion.h1 variants={STAGGER_ITEM_SLOW} className="mt-5 max-w-[18ch] font-heading text-balance text-[clamp(2.2rem,6.4vw,5rem)] leading-[0.92] tracking-[-0.02em] text-foreground">
                Una historia de experiencia, <span className="gold-reflect gold-reflect-slow font-medium">evolución</span> y <span className="gold-reflect gold-reflect-slow font-medium">compromiso</span> con cada marca.
              </motion.h1>
              <motion.p variants={STAGGER_ITEM_SLOW} className="mt-7 max-w-[46rem] text-[1rem] leading-[1.72] text-foreground/68 md:text-[1.12rem]">
                Acompañamos compañías que necesitan elevar su posicionamiento con una dirección más clara, una ejecución más precisa y una presencia de marca más sólida.
              </motion.p>
              <motion.p variants={STAGGER_ITEM_SLOW} className="mt-6 flex w-full max-w-[48rem] flex-wrap items-center gap-x-2 gap-y-1 border border-foreground/12 bg-white/75 px-4 py-2 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-foreground/64 md:w-fit md:text-[0.68rem]">
                <span>+20 años de experiencia</span>
                <span className="text-foreground/30">/</span>
                <span>Equipo multidisciplinario</span>
                <span className="text-foreground/30">/</span>
                <span>Acompañamiento estratégico</span>
              </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-foreground/8 bg-[#1f2327] py-20 text-background md:py-28 lg:py-32">
        <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.14]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(164,154,130,0.14),transparent_42%)]" />
        <Image
          src="/logos/icono-2.svg"
          alt=""
          aria-hidden="true"
          width={220}
          height={260}
          className="pointer-events-none absolute -right-8 bottom-8 hidden h-auto w-36 opacity-[0.08] lg:block"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f7f7f4] via-[#f7f7f4]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent via-[#f8f8f6]/30 to-[#f8f8f6]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <p className="text-[0.66rem] uppercase tracking-[0.2em] text-primary/75">Quiénes somos</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 max-w-[16ch] font-heading text-balance text-[clamp(2rem,4.2vw,4.1rem)] leading-[0.92] tracking-[-0.02em] text-background">
              Un estudio que combina <span className="gold-reflect gold-reflect-light gold-reflect-slow font-medium">sensibilidad estratégica</span> y <span className="gold-reflect gold-reflect-light gold-reflect-slow font-medium">ejecución real</span>.
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
                className="border border-white/12 bg-white/[0.03] p-6 md:p-7"
              >
                <p className="mb-3 flex items-center gap-2 text-[0.56rem] uppercase tracking-[0.2em] text-primary/76">
                  <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={8} height={10} className="h-2.5 w-auto" />
                  Capitulo {index + 1}
                </p>
                <p className="text-[1.02rem] leading-[1.74] text-background/84">{chapter}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-glow border-b border-foreground/8 bg-white py-20 md:py-26 lg:py-32">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-6">
              <p className="text-[0.66rem] uppercase tracking-[0.2em] text-foreground/45">Cómo estamos conformados</p>
              <h2 className="mt-4 font-heading text-balance text-[clamp(2rem,4vw,4.2rem)] leading-[0.92] tracking-[-0.02em] text-foreground">
                Un equipo integral para abordar marcas desde <span className="gold-reflect gold-reflect-slow font-medium">múltiples frentes</span>.
              </h2>
            </Reveal>
            <Reveal className="max-w-[36rem] text-[1rem] leading-[1.72] text-foreground/62 lg:col-span-6 lg:justify-self-end md:text-[1.08rem]" delay={0.1}>
              Reunimos perfiles estratégicos, creativos y técnicos que se articulan según la necesidad de cada proyecto para construir soluciones más completas y mejor resueltas.
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
                whileHover={{ y: -5, boxShadow: "0 26px 42px -30px rgba(50,50,47,0.46)" }}
                transition={{ duration: 0.45, ease: EASE_LUXURY }}
                className="premium-grid-light relative border border-foreground/10 bg-white/88 p-7 shadow-[0_26px_38px_-34px_rgba(50,50,47,0.45)] md:p-8"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
                <p className="mb-3 flex items-center gap-2 text-[0.56rem] uppercase tracking-[0.2em] text-foreground/48">
                  <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={8} height={10} className="h-2.5 w-auto opacity-65" />
                  Eje {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="font-heading text-[1.9rem] leading-[0.96] tracking-[-0.02em] text-foreground/92">{axis.title}</h3>
                <p className="mt-4 text-[1.03rem] leading-[1.72] text-foreground/74">{axis.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-foreground/8 bg-[#f4f2ed] py-20 md:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_16%,rgba(142,155,147,0.16),transparent_34%),radial-gradient(circle_at_12%_76%,rgba(164,154,130,0.14),transparent_38%)]" />
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
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-foreground/12 bg-white shadow-[0_35px_50px_-38px_rgba(41,39,36,0.55)]">
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
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/82">Rodrigo Zarza</p>
                  <p className="mt-0.5 text-[0.64rem] uppercase tracking-[0.14em] text-white/72">Director creativo</p>
                </div>
              </div>
            </motion.div>

            <Reveal className="lg:col-span-7" delay={0.08}>
              <article>
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-foreground/45">Dirección creativa</p>
                <h2 className="mt-4 max-w-[16ch] font-heading text-balance text-[clamp(2rem,4.4vw,4.1rem)] leading-[0.92] tracking-[-0.02em] text-foreground">
                  Rodrigo Zarza
                </h2>
                <p className="mt-2 text-[0.74rem] uppercase tracking-[0.16em] text-foreground/52">Director creativo</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {directorHighlights.map((highlight, index) => (
                    <motion.span
                      key={highlight}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.55, delay: 0.18 + index * 0.05, ease: EASE_LUXURY }}
                      className="border border-foreground/14 bg-white/72 px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-foreground/58"
                    >
                      {highlight}
                    </motion.span>
                  ))}
                </div>

                <div className="mt-7 space-y-4 text-[1rem] leading-[1.76] text-foreground/72 md:text-[1.08rem]">
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
                  className="mt-8 border-l-2 border-foreground/22 pl-4 text-[0.95rem] italic leading-[1.7] text-foreground/64 md:text-[1rem]"
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
                  <Button asChild size="lg" className="btn-tide whitespace-normal text-center sm:whitespace-nowrap">
                    <Link href="/contacto">Agendar una reunión con Rodrigo</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-foreground/45 bg-white/55 text-foreground/86 hover:bg-white hover:text-foreground">
                    <Link href="/contacto">Contanos tu proyecto</Link>
                  </Button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.56, ease: EASE_LUXURY }}
                  className="mt-8 inline-flex border border-foreground/15 bg-white/75 px-4 py-2 text-[0.62rem] uppercase tracking-[0.15em] text-foreground/60"
                >
                  Biografía editorial en actualización
                </motion.p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-foreground/8 bg-[#f7f8f5] py-16 md:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(164,154,130,0.11),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(142,155,147,0.1),transparent_36%)]" />
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
                className="relative border border-foreground/10 bg-white p-5 text-center shadow-[0_16px_30px_-30px_rgba(50,50,47,0.5)] md:p-6"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <p className="font-heading text-[2.4rem] leading-[0.92] tracking-[-0.03em] text-foreground/92 md:text-[3rem]">{signal.value}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-foreground/48">{signal.label}</p>
              </motion.article>
            ))}
          </motion.div>

          <Reveal delay={0.14}>
            <div className="mt-8 border border-foreground/10 bg-white p-4 md:p-6">
              <p className="mb-4 flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.2em] text-foreground/48">
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
                    className="flex h-[6rem] items-center justify-center border border-foreground/8 bg-[#fbfcf8] px-4"
                  >
                    <div className="relative h-[3.4rem] w-full max-w-[182px]">
                      <Image
                        src={encodeURI(`/logos/clientes/${logo.file}`)}
                        alt={logo.name}
                        fill
                        className={`object-contain object-center grayscale opacity-75 ${logoOpticalScale[logo.file] ?? "scale-100"}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#24282d] py-20 text-background md:py-24 lg:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(31,35,39,0.82), rgba(31,35,39,0.92)), url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.14]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f7f8f5] via-[#f7f8f5]/50 to-transparent" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <div className="border border-white/14 bg-white/[0.03] p-9 md:p-12 lg:p-14">
              <p className="text-[0.66rem] uppercase tracking-[0.2em] text-primary/78">Compromiso Impakto</p>
              <h2 className="mt-4 max-w-[15ch] font-heading text-balance text-[clamp(2rem,4vw,4rem)] leading-[0.92] tracking-[-0.02em] text-background">
                Nos involucramos de verdad en cada marca para que avance con <span className="gold-reflect gold-reflect-light gold-reflect-slow font-medium">más seguridad</span>.
              </h2>
              <p className="mt-7 max-w-[44rem] text-[1rem] leading-[1.72] text-background/78 md:text-[1.1rem]">
                Acompañamos todo el proceso con consultoría ejecutiva y dirección creativa para convertir decisiones estratégicas en resultados sostenibles.
              </p>

              <p className="mt-5 inline-flex items-center gap-2 border border-white/24 bg-white/8 px-4 py-2 text-[0.58rem] uppercase tracking-[0.16em] text-white/82">
                <span>Sesiones de diagnóstico</span>
                <span className="text-white/45">/</span>
                <span>Respuesta inicial en 24h hábiles</span>
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="btn-tide whitespace-normal border border-primary/65 bg-primary text-foreground shadow-[0_16px_28px_-20px_rgba(191,168,118,0.65)] [&::after]:bg-background hover:text-foreground sm:whitespace-nowrap"
                >
                  <Link href="/contacto">Solicitar sesión estratégica</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="cta-secondary-dark"
                >
                  <Link href="/servicios">Explorar servicios estratégicos</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
