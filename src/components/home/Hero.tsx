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
    question: "Si nuestra marca está desordenada, ¿por dónde empezamos?",
    answer:
      "Primero relevamos contexto, mensaje, percepción y objetivos. Desde ahí definimos una **dirección clara** para avanzar con criterio.",
  },
  {
    question: "¿Trabajan solo diseño o también estrategia comercial?",
    answer:
      "Trabajamos de forma integral: comunicación, marca y estructura comercial para construir una presencia **sólida y coherente**.",
  },
  {
    question: "¿Pueden ayudarnos a vender mejor sin perder identidad?",
    answer:
      "Sí. Ordenamos tu comunicación para que la propuesta se entienda mejor y se traduzca en una venta **más clara y consistente**.",
  },
  {
    question: "¿Qué incluye su enfoque online y offline?",
    answer:
      "Alineamos todos los puntos de contacto de la marca para sostener una percepción **uniforme y confiable** en cada canal.",
  },
  {
    question: "¿Cómo trabajan la captación, conversión y retención?",
    answer:
      "Diseñamos estrategias para atraer mejores oportunidades, convertir con más claridad y fortalecer relaciones **a largo plazo**.",
  },
  {
    question: "¿Usan IA y herramientas nuevas en los proyectos?",
    answer:
      "Sí, pero siempre con criterio. La tecnología suma cuando está integrada a una **estrategia bien pensada**.",
  },
  {
    question: "¿Acompañan durante todo el proceso o solo al inicio?",
    answer:
      "Acompañamos cada etapa con asesoramiento continuo para que tomes decisiones con más **seguridad y claridad**.",
  },
  {
    question: "¿Podemos avanzar aunque no tengamos todo definido?",
    answer:
      "Sí. Te ayudamos a ordenar prioridades, definir alcance y construir una base **más firme para crecer**.",
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
    <section className="relative overflow-hidden bg-background pt-[6.8rem] md:pt-[8.2rem] min-h-[100svh] border-b border-foreground/5">
      <div className="pointer-events-none absolute inset-y-0 left-[4%] hidden xl:block w-px bg-foreground/5" />
      <div className="pointer-events-none absolute inset-y-0 right-[4%] hidden xl:block w-px bg-foreground/5" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(154,164,144,0.05),transparent_28%),radial-gradient(circle_at_left_center,rgba(175,163,133,0.05),transparent_26%)]" />
      <AnimatedMeshBackground />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16 min-h-[calc(100svh-6.8rem)] md:min-h-[calc(100svh-8.2rem)] py-6 md:py-8 lg:py-10">
        <div className="grid h-full items-center lg:items-start gap-8 md:gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-18">
          <div className="relative z-20 lg:pt-4 xl:pt-6 lg:max-w-[50vw] lg:pr-6 xl:pr-8">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-7 text-xs md:text-sm tracking-[0.2em] uppercase text-foreground/40"
            >
              Estrategia, diseño y estructura digital
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 26, filter: "blur(7px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.05, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading font-normal text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.05rem] xl:text-[3.35rem] 2xl:text-[3.55rem] leading-[0.94] tracking-[-0.02em] text-foreground text-balance max-w-[15ch] lg:max-w-[20ch] xl:max-w-[21ch]"
            >
              <span className="hidden lg:block lg:-ml-1">
                Construimos estrategias de comunicación para que tu marca <span className="font-medium">venda mejor</span>, <span className="font-medium">online y offline</span>.
              </span>
              <span className="lg:hidden">
                Construimos estrategias de comunicación para que tu marca <span className="font-medium">venda mejor</span>, <span className="font-medium">online y offline</span>.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18 }}
              className="mt-6 lg:mt-7 max-w-[39rem] lg:max-w-[34rem] font-sans text-[18px] font-normal text-foreground/60 leading-[1.65]"
            >
              Alineamos mensaje, dirección y presencia de marca para ayudarte a
              atraer mejor, convertir con más claridad y sostener relaciones más
              sólidas con tus clientes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.28 }}
              className="mt-8 lg:mt-9 flex flex-col sm:flex-row gap-4 lg:gap-6 items-start"
            >
              <Magnetic strength={1}>
                <Link
                  href="/contacto"
                  className="relative group inline-flex min-h-[3.3rem] items-center justify-center rounded-full bg-primary px-9 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-background shadow-premium-soft transition-all duration-300 hover:bg-foreground hover:text-background hover:scale-[1.03] hover:shadow-premium-glow"
                >
                  Agendar una reunión
                </Link>
              </Magnetic>
              <Magnetic strength={0.5}>
                <Link
                  href="/servicios"
                  className="inline-flex min-h-[3.3rem] items-center justify-center rounded-full border border-foreground/14 bg-background/85 px-9 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-foreground/78 shadow-sm transition-all duration-300 hover:border-foreground/26 hover:bg-background hover:scale-[1.03] hover:shadow-premium-soft"
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
            className="relative z-10 hidden lg:flex justify-end lg:pt-10 xl:pt-12 lg:pl-4"
          >
            <div className="relative ml-auto w-full max-w-[27.25rem] xl:max-w-[28rem] min-h-[18.25rem]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(250,241,231,0.8),transparent_70%)] rounded-full blur-2xl pointer-events-none z-[-1]" />

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
                    className="mr-8 rounded-[1.15rem] rounded-bl-[0.3rem] bg-white/95 backdrop-blur-md px-6 py-4 shadow-premium-deep border border-white/60"
                  >
                    <p className="text-[1rem] text-foreground/78 leading-[1.45]">
                      <TypedText text={currentConversation.question} />
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 22, y: 6 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 16, y: -6 }}
                    transition={{ duration: 0.42, delay: 0.42 }}
                    className="relative ml-8 rounded-[1.2rem] rounded-br-[0.3rem] bg-white/95 backdrop-blur-md px-6 py-5 shadow-premium-deep border border-white/60"
                  >
                    <span className="absolute -top-3 -left-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground border border-primary/65 shadow-[0_10px_20px_rgba(54,53,49,0.22)]">
                      <Image src="/logos/icono.svg" alt="Impakto" width={10} height={13} className="h-3.5 w-auto" />
                    </span>
                    <p className="text-[0.98rem] text-foreground/76 leading-[1.6]">
                      <TypedText
                        text={currentConversation.answer}
                        delay={0.5}
                        stagger={0.016}
                      />
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div >
      </div >
    </section >
  );
}
