"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealLine } from "@/components/ui/Reveal";
import TechNodes from "@/components/ui/TechNodes";
import AnimatedMeshBackground from "@/components/home/AnimatedMeshBackground";

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

const growthCategories = [
  {
    id: "01",
    title: "Captación",
    promise: "Atraer mejores oportunidades con una presencia más clara, sólida y confiable.",
    benefits: [
      "Posicionamiento más claro frente al cliente correcto",
      "Mayor calidad de consultas y prospectos",
      "Percepción premium alineada al nivel real del negocio",
    ],
  },
  {
    id: "02",
    title: "Conversión",
    promise: "Transformar interés en decisiones concretas con menos fricción y más claridad comercial.",
    benefits: [
      "Mensajes que explican valor sin ruido",
      "Recorridos digitales orientados a acción",
      "Mejor rendimiento comercial de web, landings y materiales",
    ],
  },
  {
    id: "03",
    title: "Retención",
    promise: "Sostener relaciones más consistentes para mejorar recurrencia, confianza y recomendación.",
    benefits: [
      "Comunicación coherente en todos los puntos de contacto",
      "Sistemas y procesos que mejoran experiencia del cliente",
      "Mayor estabilidad del crecimiento en el tiempo",
    ],
  },
];

const strategicPrograms = [
  {
    title: "Dirección de marca y posicionamiento",
    outcome:
      "Define una base estratégica para que cada decisión visual, verbal y comercial responda a una misma lógica.",
    scope: [
      "Diagnóstico de marca y contexto competitivo",
      "Propuesta de valor y enfoque comunicacional",
      "Criterios de identidad verbal y visual",
      "Hoja de ruta por etapas de negocio",
    ],
    cta: "Pedir diagnóstico",
  },
  {
    title: "Ecosistema digital para captación y conversión",
    outcome:
      "Construye una presencia digital con estándar high ticket para atraer, convertir y sostener mejor el valor percibido.",
    scope: [
      "Diseño y desarrollo web institucional",
      "Landing pages orientadas a objetivo comercial",
      "Sistemas web y aplicaciones a medida",
      "Arquitectura de contenidos y experiencia",
    ],
    cta: "Pedir diagnóstico",
  },
  {
    title: "Comunicación comercial y contenido",
    outcome:
      "Ordena mensajes, piezas y narrativa para que la marca comunique con precisión y cierre con más claridad.",
    scope: [
      "Copy comercial para web y campañas",
      "Diseño publicitario y editorial",
      "Contenido para puntos de venta y canales digitales",
      "Estrategias de comunicación por etapa",
    ],
    cta: "Pedir diagnóstico",
  },
  {
    title: "Automatización, IA y optimización de procesos",
    outcome:
      "Mejora velocidad operativa y consistencia comercial sin perder control estratégico.",
    scope: [
      "Automatizaciones y flujos operativos",
      "Integración de IA aplicada a tareas clave",
      "Sistemas de seguimiento y respuesta",
      "Optimización continua basada en datos",
    ],
    cta: "Pedir diagnóstico",
  },
];

const workDomains = [
  {
    title: "Marca y comunicación",
    items: [
      "Diseño de marcas y branding",
      "Identidad visual y dirección de arte",
      "Estrategias de comunicación",
      "Comunicación comercial y publicitaria",
      "Diseño editorial y punto de venta",
    ],
  },
  {
    title: "Marketing y contenido",
    items: [
      "Marketing orientado a objetivos de negocio",
      "Generación de contenidos",
      "Copy para captación y conversión",
      "Estrategias de venta",
      "Diseño de piezas para campañas",
    ],
  },
  {
    title: "Desarrollo digital",
    items: [
      "Desarrollo web institucional",
      "Landing pages de alto rendimiento",
      "Desarrollo de sistemas web",
      "Desarrollo de aplicaciones",
      "Arquitectura de experiencia y contenidos",
    ],
  },
  {
    title: "IA, automatización y operación",
    items: [
      "Automatizaciones de procesos",
      "Inteligencia artificial aplicada",
      "Integración de canales y datos",
      "Optimización operativa continua",
      "Sistemas para seguimiento comercial",
    ],
  },
];

const collaborationProfiles = [
  "Empresas que buscan resultados sostenibles",
  "Equipos internos con foco en crecimiento",
  "Direcciones y liderazgos con necesidad de orden",
  "Agencias y partners para proyectos en conjunto",
];

const idealClientSignals = [
  {
    title: "Valoran dirección, no volumen",
    description:
      "Empresas que priorizan decisiones con criterio por encima de producción masiva sin estrategia.",
  },
  {
    title: "Buscan elevar percepción y rendimiento",
    description:
      "Marcas que necesitan alinear su nivel comercial con una presencia digital y comunicacional más sólida.",
  },
  {
    title: "Entienden el valor del proceso",
    description:
      "Equipos que quieren una relación profesional, ordenada y orientada a resultados sostenibles.",
  },
];

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
      <section className="relative overflow-hidden border-b border-foreground/8 bg-background pb-22 pt-16 md:pb-30 md:pt-24 lg:pb-34 lg:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(164,154,130,0.13),transparent_32%),radial-gradient(circle_at_88%_16%,rgba(142,155,147,0.12),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0">
          <AnimatedMeshBackground variant="full" className="opacity-[0.52]" />
        </div>
        <TechNodes className="pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_78%,rgba(245,246,242,0),rgba(245,246,242,0.55)_70%,rgba(245,246,242,0.82)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-[7%] hidden w-px bg-gradient-to-b from-transparent via-foreground/14 to-transparent lg:block" />

        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          {/* Hero above the fold: entrada por CSS, no por framer-motion.
              Con `initial="hidden"` el h1 y el párrafo se pintaban recién al
              hidratar y el LCP se iba a 3.1 s. */}
          <div className="max-w-[52rem]">
            <p className="hero-rise flex items-center gap-2 text-eyebrow uppercase tracking-[0.2em] text-foreground/45">
              <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
              Servicios estratégicos
            </p>
            <h1 className="hero-rise hero-rise-delay-1 mt-5 max-w-[18ch] font-heading text-balance text-display-xl tracking-[-0.02em] text-foreground">
              Una estructura para captar, convertir y retener con mayor precisión.
            </h1>
            <p className="hero-rise hero-rise-delay-2 mt-7 max-w-[50rem] text-body text-foreground/70 md:text-body-lg">
              Acompañamos organizaciones orientadas a resultados. En lugar de ejecutar herramientas aisladas, diseñamos planes estratégicos integrales para mejorar percepción, rendimiento comercial y sostenibilidad del crecimiento.
            </p>
            <p className="hero-rise hero-rise-delay-3 mt-5 inline-flex flex-wrap items-center gap-2 border border-foreground/12 bg-white/75 px-4 py-2 text-eyebrow uppercase tracking-[0.14em] text-foreground/60">
              Beneficios medibles
              <span className="text-foreground/30">/</span>
              Dirección + implementación
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-foreground/8 bg-night py-20 text-background md:py-28 lg:py-32">
        <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.13]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(164,154,130,0.14),transparent_42%)]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <h2 className="max-w-[18ch] font-heading text-balance text-display-lg tracking-[-0.02em]">
              Marco estratégico en tres frentes de crecimiento.
            </h2>
          </Reveal>
          <RevealLine className="mt-6 block h-px w-28 bg-gradient-to-r from-primary/80 to-transparent" delay={0.06} />

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-90px" }}
            variants={STAGGER_MEDIUM}
            className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {growthCategories.map((category) => (
              <motion.article key={category.title} variants={ITEM_MEDIUM} whileHover={{ y: -5 }} className="rounded-panel border border-white/16 bg-white/[0.035] p-6 shadow-premium-night md:p-7">
                <p className="text-eyebrow uppercase tracking-[0.2em] text-primary/76">{category.id}</p>
                <h3 className="mt-3 font-heading text-display-xs tracking-[-0.02em]">{category.title}</h3>
                <p className="mt-4 text-body text-background/82">{category.promise}</p>
                <ul className="mt-6 space-y-2.5 border-t border-white/12 pt-5">
                  {category.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-body text-background/76">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/75" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-foreground/8 bg-white py-20 md:py-24">
        <div className="container mx-auto grid max-w-[1320px] gap-8 px-7 md:px-12 lg:grid-cols-12 lg:items-end lg:px-14 xl:px-16">
          <Reveal className="lg:col-span-7">
            <h2 className="font-heading text-balance text-display-lg tracking-[-0.02em] text-foreground">
              Programas diseñados para impacto comercial medible.
            </h2>
          </Reveal>
          <Reveal className="max-w-[34rem] text-body text-foreground/62 lg:col-span-5 lg:justify-self-end" delay={0.08}>
            Priorizamos decisiones según retorno estratégico: qué activar primero, qué ordenar después y qué consolidar para sostener resultados.
          </Reveal>
        </div>
      </section>

      <section className="section-glow relative overflow-hidden border-b border-foreground/8 bg-band py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(164,154,130,0.09),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(142,155,147,0.08),transparent_34%)]" />
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_MEDIUM} className="space-y-5 md:space-y-6">
            {strategicPrograms.map((program, index) => (
              <motion.article
                key={program.title}
                variants={ITEM_MEDIUM}
                whileHover={{ y: -4 }}
                className={`relative overflow-hidden rounded-panel border border-foreground/12 p-6 md:p-8 lg:p-9 ${
                  index % 2 === 0
                    ? "bg-[linear-gradient(148deg,rgba(255,255,255,0.96),rgba(246,247,242,0.9))]"
                    : "bg-[linear-gradient(148deg,rgba(250,251,247,0.96),rgba(241,243,237,0.9))]"
                } shadow-premium-lift`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
                <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-7">
                    <p className="text-eyebrow uppercase tracking-[0.2em] text-foreground/42">Programa {String(index + 1).padStart(2, "0")}</p>
                    <h3 className="mt-3 max-w-[18ch] font-heading text-balance text-display-md tracking-[-0.02em] text-foreground/92">
                      {program.title}
                    </h3>
                    <p className="mt-4 max-w-[44rem] text-body text-foreground/72 md:text-body-lg">{program.outcome}</p>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-card border border-foreground/10 bg-white/78 p-4 md:p-5">
                      <p className="text-eyebrow uppercase tracking-[0.2em] text-foreground/44">Incluye</p>
                      <ul className="mt-4 space-y-2.5">
                        {program.scope.map((item) => (
                          <li key={item} className="flex items-start gap-3 border-t border-foreground/8 pt-2.5 first:border-t-0 first:pt-0">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/75" />
                            <span className="text-body text-foreground/74">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-eyebrow uppercase tracking-[0.13em] text-foreground/48">Implementación por etapas según prioridad de negocio</p>
                  <Button asChild variant="outline" className="w-full border-foreground/30 bg-white/70 text-center whitespace-normal sm:w-auto sm:min-w-[16rem]">
                    <Link href="/contacto">{program.cta}</Link>
                  </Button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-foreground/8 bg-white py-22 md:py-26">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-5">
              <p className="text-eyebrow uppercase tracking-[0.2em] text-foreground/42">En qué trabajamos puntualmente</p>
              <h2 className="mt-4 font-heading text-balance text-display-md tracking-[-0.02em] text-foreground">
                Frentes de trabajo que integramos dentro de una estrategia de negocio.
              </h2>
            </Reveal>
            <Reveal className="max-w-[38rem] text-body text-foreground/64 lg:col-span-7 lg:justify-self-end md:text-body-lg" delay={0.08}>
              Estas capacidades se activan según etapa, contexto y objetivo. El valor no está en la herramienta aislada, sino en la integración correcta para mejorar captación, conversión y retención.
            </Reveal>
          </div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }} variants={STAGGER_FAST} className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {workDomains.map((domain) => (
              <motion.article key={domain.title} variants={ITEM_FAST} whileHover={{ y: -4 }} className="rounded-panel border border-foreground/10 bg-band p-6 shadow-premium-lift">
                <h3 className="font-heading text-display-xs tracking-[-0.02em] text-foreground/86">{domain.title}</h3>
                <ul className="mt-5 space-y-2.5 border-t border-foreground/10 pt-5">
                  {domain.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-body text-foreground/72">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/75" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>

          <Reveal delay={0.12}>
            <div className="mt-8 rounded-card border border-foreground/10 bg-white p-5 shadow-premium-lift md:p-6">
              <p className="text-eyebrow uppercase tracking-[0.2em] text-foreground/46">Modalidad de colaboración</p>
              <p className="mt-3 max-w-[62rem] text-body text-foreground/66">
                Podemos liderar el frente estratégico completo o integrarnos con equipos internos y agencias asociadas para ejecutar proyectos en conjunto, manteniendo dirección, criterio y estándar de implementación.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {collaborationProfiles.map((profile) => (
                  <span key={profile} className="border border-foreground/12 bg-surface px-3.5 py-2 text-eyebrow uppercase tracking-[0.12em] text-foreground/58">
                    {profile}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-foreground/8 bg-band py-22 md:py-26">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-6">
              <p className="text-eyebrow uppercase tracking-[0.2em] text-foreground/42">Encaje de cliente</p>
              <h2 className="mt-4 font-heading text-balance text-display-lg tracking-[-0.02em] text-foreground">
                Con qué tipo de marca funcionamos mejor.
              </h2>
            </Reveal>
            <Reveal className="max-w-[35rem] text-body text-foreground/64 lg:col-span-6 lg:justify-self-end md:text-body-lg" delay={0.08}>
              Este enfoque es ideal para compañías que buscan construir activos de marca y sistemas comerciales con lógica de crecimiento sostenido.
            </Reveal>
          </div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }} variants={STAGGER_FAST} className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {idealClientSignals.map((signal) => (
              <motion.article key={signal.title} variants={ITEM_FAST} whileHover={{ y: -4 }} className="rounded-card border border-foreground/10 bg-white p-6 shadow-premium-lift">
                <h3 className="font-heading text-display-xs tracking-[-0.02em] text-foreground/86">{signal.title}</h3>
                <p className="mt-4 text-body text-foreground/68">{signal.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-foreground/8 bg-band py-22 md:py-26">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-6">
              <p className="text-eyebrow uppercase tracking-[0.2em] text-foreground/42">Punto de partida</p>
              <h2 className="mt-4 font-heading text-balance text-display-lg tracking-[-0.02em] text-foreground">
                Definí el frente que hoy necesita mayor impacto.
              </h2>
            </Reveal>
            <Reveal className="max-w-[35rem] text-body text-foreground/64 lg:col-span-6 lg:justify-self-end md:text-body-lg" delay={0.08}>
              Si aún no está claro por dónde empezar, lo definimos en una sesión estratégica inicial.
            </Reveal>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-90px" }}
            variants={STAGGER_FAST}
            className="mt-10 rounded-panel border border-foreground/10 bg-[linear-gradient(160deg,#ffffff_0%,#f5f7f1_100%)] p-4 shadow-premium-lift md:p-5"
          >
            <div className="pointer-events-none mb-4 hidden items-center px-3 md:flex">
              <span className="h-px flex-1 bg-foreground/14" />
              <span className="mx-3 text-eyebrow uppercase tracking-[0.2em] text-foreground/38">Frente prioritario</span>
              <span className="h-px flex-1 bg-foreground/14" />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {stageCtas.map((item, i) => (
                <motion.article
                  key={item.stage}
                  variants={ITEM_FAST}
                  whileHover={{ y: -3 }}
                className="edge-scan-card group relative overflow-hidden rounded-card border border-foreground/10 bg-white/85 p-5 transition-colors duration-300 hover:bg-white md:p-6"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-eyebrow uppercase tracking-[0.2em] text-foreground/38">Usted hoy dice</p>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-foreground/14 px-1.5 text-eyebrow uppercase tracking-[0.16em] text-foreground/38">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-4 border-l border-primary/45 pl-4 font-heading text-display-xs tracking-[-0.02em] text-foreground/86">
                    &ldquo;{item.need}&rdquo;
                  </p>
                  <p className="mt-4 text-eyebrow uppercase tracking-[0.2em] text-foreground/42">{item.stage}</p>
                  <Button
                    asChild
                    className="mt-6 w-full border-foreground/22 bg-white/86 text-center text-foreground hover:border-foreground/34 hover:bg-white"
                    variant="outline"
                  >
                    <Link href="/contacto">{item.action}</Link>
                  </Button>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night-soft py-24 text-background md:py-30">
        <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.15]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(164,154,130,0.2),transparent_35%)]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <Reveal>
            <div className="mx-auto max-w-[1120px] border border-white/18 bg-white/[0.035] p-9 shadow-premium-night md:p-12">
              <p className="text-eyebrow uppercase tracking-[0.2em] text-primary/76">Siguiente paso</p>
              <h2 className="mt-4 max-w-[15ch] font-heading text-balance text-display-lg tracking-[-0.02em] text-background">
                Definimos qué frentes priorizar para acelerar resultados con control.
              </h2>
              <p className="mt-8 max-w-[40rem] text-body text-background/84">
                Si hoy la marca necesita mejorar captación, conversión o retención, una sesión estratégica permite ordenar el mapa de decisiones y establecer una hoja de ruta concreta.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="btn-gold-sweep-light btn-tide h-auto min-h-14 w-full border border-white/55 bg-white text-center leading-tight whitespace-normal text-foreground shadow-premium-night hover:text-foreground [&::after]:bg-primary/42 sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
                >
                  <Link href="/contacto">Pedir diagnóstico</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="cta-secondary-dark h-auto min-h-14 w-full px-6 py-4 text-center leading-tight whitespace-normal sm:h-14 sm:w-auto sm:px-12 sm:py-0 sm:whitespace-nowrap"
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
