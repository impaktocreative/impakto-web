"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealLine } from "@/components/ui/Reveal";
import CoherenceField from "@/components/home/CoherenceField";
import { bioDirector, ejesDelEquipo, firmaTecnica, relatoDeAgencia } from "@/content/sitio";

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
  const inView = useInView(ref, { once: true, margin: "0px 0px -70px 0px" });
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
              <div className="hero-rise hero-rise-delay-3 mt-9 max-w-[44rem] border-t border-graphite/15 pt-4">
                <p className="flex flex-col gap-x-10 gap-y-2.5 text-eyebrow uppercase text-stone sm:flex-row sm:flex-wrap">
                  {["+20 años de experiencia", "Trabajo multidisciplinario", "Acompañamiento estratégico"].map(
                    (credencial) => (
                      <span key={credencial} className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="h-px w-4 shrink-0 bg-gold/70" />
                        {credencial}
                      </span>
                    ),
                  )}
                </p>
              </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-graphite/8 bg-surface-muted py-4">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="border-y border-graphite/12">
            <div className="cinta-difuminada overflow-hidden py-2.5">
              <motion.div
                className="flex w-max items-center gap-9"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                {[...firmaTecnica, ...firmaTecnica].map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-3 text-eyebrow uppercase text-stone">
                    <span className="h-px w-4 bg-gold/65" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>
            <div
              aria-hidden="true"
              className="cinta-reflejo overflow-hidden"
            >
              <motion.div
                className="flex w-max items-center gap-9"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                {[...firmaTecnica, ...firmaTecnica].map((item, index) => (
                  <span key={`${item}-eco-${index}`} className="inline-flex items-center gap-3 text-eyebrow uppercase text-stone">
                    <span className="h-px w-4 bg-gold/65" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/70 via-white/12 to-transparent" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <p className="text-eyebrow uppercase text-gold/85">Quiénes somos</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 max-w-[16ch] font-heading text-balance text-display-lg text-paper">
              Un estudio que diseña y también <span className="gold-reflect gold-reflect-light gold-reflect-slow font-medium">implementa</span>.
            </h2>
          </Reveal>
          <RevealLine className="mt-6 block h-px w-28 bg-gradient-to-r from-gold/85 to-transparent" delay={0.12} />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -90px 0px" }}
            variants={STAGGER_MEDIUM_CONTAINER}
            className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3"
          >
            {relatoDeAgencia.map((chapter, index) => (
              <motion.article
                key={chapter}
                variants={STAGGER_ITEM_MEDIUM}
                transition={{ duration: 0.45, ease: EASE_LUXURY }}
                className="group relative pt-6"
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/80 to-white/10"
                  initial={{ scaleX: 0, opacity: 0.2 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: EASE_LUXURY }}
                  style={{ transformOrigin: "left center" }}
                />
                <p className="mb-3 flex items-center gap-2 text-eyebrow uppercase text-gold/85">
                  <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={8} height={10} className="h-2.5 w-auto" />
                  Capítulo {index + 1}
                </p>
                <p className="relative z-10 text-body text-ash">{chapter}</p>
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
            viewport={{ once: true, margin: "0px 0px -90px 0px" }}
            variants={STAGGER_MEDIUM_CONTAINER}
            className="grid grid-cols-1 gap-x-12 gap-y-0 md:grid-cols-2"
          >
            {ejesDelEquipo.map((axis, index) => (
              <motion.article
                key={axis.title}
                variants={STAGGER_ITEM_MEDIUM}
                className="indice-eje group relative grid grid-cols-[auto_1fr] gap-x-5 py-7 md:gap-x-7 md:py-9"
              >
                <span className="indice-filete" aria-hidden="true" />
                <p className="indice-cifra font-heading text-display-sm tabular-nums leading-none text-graphite/22 transition-colors duration-slow group-hover:text-primary-ink">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-heading text-display-xs text-ink">{axis.title}</h3>
                  <p className="mt-3 max-w-[34rem] text-body text-slate">{axis.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-graphite/8 bg-surface-muted py-16 md:py-18 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
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
                      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                      transition={{ duration: 0.55, delay: 0.18 + index * 0.05, ease: EASE_LUXURY }}
                      className="inline-flex items-center gap-3 text-eyebrow uppercase text-stone"
                    >
                      {index > 0 && (
                        <span className="hairline-gold h-px w-6" aria-hidden="true" />
                      )}
                      {highlight}
                    </motion.span>
                  ))}
                </div>

                <div className="mt-7 space-y-4 text-body text-slate">
                  {bioDirector.map((paragraph, index) => (
                    <motion.p
                      key={paragraph}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                      transition={{ duration: 0.65, delay: 0.2 + index * 0.07, ease: EASE_LUXURY }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                <motion.blockquote
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 0.7, delay: 0.38, ease: EASE_LUXURY }}
                  className="mt-8 border-l-2 border-graphite/20 pl-4 text-body italic text-stone"
                >
                  &ldquo;La creatividad solo genera valor cuando tiene dirección, intención y una ejecución impecable.&rdquo;
                </motion.blockquote>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
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
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 0.6, delay: 0.56, ease: EASE_LUXURY }}
                  className="mt-8 border-t border-graphite/12 pt-3 text-caption text-stone/70"
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
            viewport={{ once: true, margin: "0px 0px -90px 0px" }}
            variants={STAGGER_MEDIUM_CONTAINER}
            className="grid grid-cols-2 border-t border-graphite/14 md:grid-cols-4"
          >
            {decisionSignals.map((signal, index) => (
              <motion.article
                key={signal.label}
                variants={STAGGER_ITEM_MEDIUM}
                transition={{ duration: 0.4, ease: EASE_LUXURY }}
                className={`relative py-7 md:py-8 ${index % 2 === 1 ? "pl-6 md:pl-0" : ""} ${
                  index === 0 ? "" : "md:pl-8"
                }`}
              >
                {index === 0 ? null : (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-6 left-0 hidden w-px bg-graphite/12 md:block"
                  />
                )}
                <p className="font-heading text-display-md tabular-nums text-ink">
                  <CountUp to={signal.value} prefix={signal.prefix} suffix={signal.suffix} />
                </p>
                <p className="mt-2 flex items-center gap-2.5 text-eyebrow uppercase text-stone">
                  <span className="h-px w-4 bg-gold/70" />
                  {signal.label}
                </p>
              </motion.article>
            ))}
          </motion.div>

          <Reveal delay={0.14}>
            <div className="mt-14 border-t border-graphite/14 pt-8">
              <p className="mb-6 flex items-center gap-2 text-eyebrow uppercase text-stone">
                <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={8} height={10} className="h-2.5 w-auto" />
                Marcas que confiaron en Impakto
              </p>
              <div className="-mx-7 border-y border-graphite/10 bg-white px-7 py-8 md:-mx-12 md:px-12 lg:-mx-14 lg:px-14 xl:-mx-16 xl:px-16">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "0px 0px -90px 0px" }}
                variants={STAGGER_FAST_CONTAINER}
                className="grid grid-cols-2 gap-x-10 gap-y-2 md:grid-cols-4"
              >
                {trustLogos.map((logo) => (
                  <motion.div
                    key={logo.file}
                    variants={STAGGER_ITEM_FAST}
                    transition={{ duration: 0.38, ease: EASE_LUXURY }}
                    className="group flex h-[6.5rem] items-center justify-center"
                  >
                    <div className="relative h-[3.4rem] w-full max-w-[182px]">
                      <Image
                        src={encodeURI(`/logos/clientes/${logo.file}`)}
                        alt={logo.name}
                        fill
                        // La celda topea en 182px de ancho.
                        sizes="182px"
                        className={`object-contain object-center grayscale opacity-60 mix-blend-multiply transition-opacity duration-slow group-hover:opacity-100 ${logoOpticalScale[logo.file] ?? "scale-100"}`}
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night-soft py-16 text-paper md:py-18 lg:py-16">
        {/* Segundo hotlink a Unsplash de 2200px, a opacity 0.12 y debajo de un
            overlay de 0.82-0.92: no llegaba a verse. Queda la grilla. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/70 via-white/12 to-transparent" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
              <p className="text-eyebrow uppercase text-gold/85">Compromiso Impakto</p>
              <h2 className="mt-4 max-w-[15ch] font-heading text-balance text-display-lg text-paper">
                Nos involucramos de verdad en cada marca para que avance con <span className="gold-reflect gold-reflect-light gold-reflect-slow font-medium">más seguridad</span>.
              </h2>
              <p className="mt-7 max-w-[44rem] text-body text-ash md:text-body-lg">
                Acompañamos todo el proceso con consultoría ejecutiva y dirección creativa para convertir decisiones estratégicas en resultados sostenibles.
              </p>

              <p className="mt-6 inline-flex flex-wrap items-center gap-3 text-eyebrow uppercase text-paper/70">
                <span className="hairline-gold h-px w-8" aria-hidden="true" />
                <span>Sesiones de diagnóstico</span>
                <span className="text-paper/30" aria-hidden="true">·</span>
                <span>Respuesta inicial en 24h hábiles</span>
              </p>

              </div>

              <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9">
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
