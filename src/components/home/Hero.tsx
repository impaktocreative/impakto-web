"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import AnimatedMeshBackground from "@/components/home/AnimatedMeshBackground";
import Magnetic from "@/components/ui/Magnetic";

type Conversation = {
  question: string;
  answer: string;
};

type MarkedWord = {
  text: string;
  bold: boolean;
};

function parseMarkedWords(text: string): MarkedWord[] {
  const words: MarkedWord[] = [];
  const regex = /(\*\*[^*]+\*\*)|([^*]+)/g;
  const matches = text.match(regex) ?? [];

  matches.forEach((segment) => {
    const isBold = segment.startsWith("**") && segment.endsWith("**");
    const cleanSegment = isBold ? segment.slice(2, -2) : segment;

    cleanSegment
      .split(" ")
      .filter(Boolean)
      .forEach((word) => words.push({ text: word, bold: isBold }));
  });

  return words;
}

function TypedText({
  text,
  delay = 0,
  stagger = 0.018,
}: {
  text: string;
  delay?: number;
  stagger?: number;
}) {
  const words = parseMarkedWords(text);

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word.text}-${index}`}
          variants={{
            hidden: { opacity: 0, y: 3, filter: "blur(2px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className={word.bold ? "font-semibold text-foreground/88" : undefined}
        >
          {word.text}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

const conversations: Conversation[] = [
  {
    question: "Si la marca necesita reorganizar su presencia, ¿por dónde conviene empezar?",
    answer:
      "Comenzamos con un diagnostico de contexto, mensaje y objetivos para definir una **direccion estrategica clara** desde el inicio.",
  },
  {
    question: "¿El alcance contempla solo diseño o también estrategia comercial?",
    answer:
      "Trabajamos de forma integral: comunicacion, marca y estructura comercial para sostener una presencia **solida y coherente** en cada canal.",
  },
  {
    question: "¿Es posible mejorar conversión sin comprometer identidad de marca?",
    answer:
      "Si. Ordenamos la comunicacion para que su propuesta gane claridad y se traduzca en una conversion **mas consistente** sin perder identidad.",
  },
  {
    question: "¿Qué incluye el enfoque online y offline?",
    answer:
      "Alineamos todos los puntos de contacto para que su marca se perciba **uniforme y confiable** online y offline.",
  },
  {
    question: "¿Cómo abordan captación, conversión y retención?",
    answer:
      "Diseñamos estrategias para atraer mejores oportunidades, convertir con mayor claridad y fortalecer relaciones **de largo plazo** con sus clientes.",
  },
  {
    question: "¿Integran IA y herramientas avanzadas en los proyectos?",
    answer:
      "Si, siempre bajo criterio estrategico. La tecnologia aporta valor cuando esta integrada en una **estrategia bien definida**.",
  },
  {
    question: "¿El acompañamiento cubre todo el proceso o solo la etapa inicial?",
    answer:
      "Acompanamos cada etapa para sostener decisiones con mayor **seguridad y claridad** durante todo el proceso.",
  },
  {
    question: "¿Se puede iniciar sin un alcance completamente definido?",
    answer:
      "Si. Definimos prioridades, alcance y hoja de ruta para construir una base **mas firme para escalar**.",
  },
];

export default function Hero() {
  const [activeConversation, setActiveConversation] = useState(0);
  const currentConversation =
    conversations[activeConversation] ?? conversations[0] ?? { question: "", answer: "" };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveConversation((previous) => (previous + 1) % conversations.length);
    }, 8600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[88svh] overflow-hidden border-b border-foreground/5 bg-background pt-[5rem] md:min-h-[100svh] md:pt-[8.2rem]">
      <div className="pointer-events-none absolute inset-y-0 left-[4%] hidden w-px bg-foreground/5 xl:block" />
      <div className="pointer-events-none absolute inset-y-0 right-[4%] hidden w-px bg-foreground/5 xl:block" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(142,155,147,0.07),transparent_28%),radial-gradient(circle_at_left_center,rgba(164,154,130,0.07),transparent_26%)]" />
      <AnimatedMeshBackground />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 py-5 md:min-h-[calc(100svh-8.2rem)] md:px-12 md:py-8 lg:px-14 lg:py-10 xl:px-16">
        <div className="grid h-full items-center gap-8 md:gap-10 lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-18">
          <div className="relative z-20 lg:max-w-[50vw] lg:pr-6 xl:pr-8">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-5 text-[0.66rem] uppercase tracking-[0.19em] text-foreground/40 md:mb-7 md:text-sm"
            >
              Estrategia, diseño y estructura digital
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 26, filter: "blur(7px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.05, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[15ch] text-balance font-heading text-[clamp(1.62rem,8.2vw,1.8rem)] font-normal leading-[0.99] tracking-[-0.01em] text-foreground sm:text-[2.8rem] md:text-[3.2rem] lg:max-w-[20ch] lg:text-[3.05rem] xl:max-w-[21ch] xl:text-[3.35rem] 2xl:text-[3.55rem]"
            >
              Construimos estrategias de comunicacion para que su marca{" "}
              <span className="gold-reflect font-medium">venda mejor,</span>{" "}
              <span className="gold-reflect font-medium">online y offline.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18 }}
              className="mt-4 max-w-[39rem] font-sans text-[clamp(0.84rem,4.35vw,0.9rem)] font-normal leading-[1.52] text-foreground/70 md:mt-6 md:text-[1.12rem] md:leading-[1.68] lg:mt-7 lg:max-w-[34rem]"
            >
              Asi trabajamos en Impakto: alineamos mensaje, direccion y presencia de
              marca para atraer mejores oportunidades, convertir con mayor claridad y
              sostener relaciones mas solidas con sus clientes.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.24 }}
              className="mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 border border-foreground/10 bg-white/55 px-3.5 py-1.5 text-[0.54rem] uppercase tracking-[0.09em] text-foreground/58 md:mt-5 md:px-4 md:py-2 md:text-[0.64rem] md:tracking-[0.16em]"
            >
              3 pilares de trabajo
              <span className="text-foreground/35">/</span>
              Captación
              <span className="text-foreground/35">/</span>
              Conversión
              <span className="text-foreground/35">/</span>
              Retención
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-5 hidden items-center gap-3 xl:inline-flex"
            >
              <span className="h-px w-12 bg-foreground/18" />
              <Image
                src="/logos/icono-2.svg"
                alt=""
                aria-hidden="true"
                width={10}
                height={12}
                className="h-3.5 w-auto opacity-45"
              />
              <span className="h-px w-12 bg-foreground/18" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.28 }}
              className="mt-5 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-start lg:mt-9 lg:gap-6"
            >
              <Magnetic strength={1}>
                <Link
                  href="/contacto"
                  className="relative inline-flex min-h-[2.95rem] w-full items-center justify-center rounded-full bg-primary px-8 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-background shadow-premium-soft transition-all duration-300 hover:scale-[1.03] hover:bg-foreground hover:text-background hover:shadow-premium-glow sm:min-h-[3.3rem] sm:w-auto sm:px-9 sm:py-3 sm:text-[0.75rem] sm:tracking-[0.15em]"
                >
                  Agendar una reunión
                </Link>
              </Magnetic>
              <Magnetic strength={0.5}>
                <Link
                  href="/servicios"
                  className="inline-flex min-h-[2.95rem] w-full items-center justify-center rounded-full border border-foreground/14 bg-background/85 px-8 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-foreground/78 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:border-foreground/26 hover:bg-background hover:shadow-premium-soft sm:min-h-[3.3rem] sm:w-auto sm:px-9 sm:py-3 sm:text-[0.75rem] sm:tracking-[0.15em]"
                >
                  Ver servicios
                </Link>
              </Magnetic>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.22 }}
            className="relative z-10 hidden justify-end lg:flex lg:items-center lg:pl-4"
          >
            <div className="relative ml-auto min-h-[18.25rem] w-full max-w-[27.25rem] xl:max-w-[28rem]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-[-1] h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,246,242,0.82),transparent_70%)] blur-2xl" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConversation}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -22, y: 6 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -16, y: -6 }}
                    transition={{ duration: 0.38 }}
                    className="mr-8 rounded-[1.15rem] rounded-bl-[0.3rem] border border-white/60 bg-white/95 px-6 py-4 shadow-premium-deep backdrop-blur-md"
                  >
                    <p className="text-[1rem] leading-[1.45] text-foreground/78">
                      <TypedText text={currentConversation.question} />
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 22, y: 6 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 16, y: -6 }}
                    transition={{ duration: 0.42, delay: 0.42 }}
                    className="relative ml-8 rounded-[1.2rem] rounded-br-[0.3rem] border border-white/60 bg-white/95 px-6 py-5 shadow-premium-deep backdrop-blur-md"
                  >
                    <span className="absolute -left-3 -top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/65 bg-foreground shadow-[0_10px_20px_rgba(54,53,49,0.22)]">
                      <Image src="/logos/icono-2.svg" alt="Impakto" width={10} height={13} className="h-3.5 w-auto" />
                    </span>
                    <p className="text-[0.98rem] leading-[1.6] text-foreground/76">
                      <TypedText text={currentConversation.answer} delay={0.5} stagger={0.016} />
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
