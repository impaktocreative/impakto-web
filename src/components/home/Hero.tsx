"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    question: "¿Cómo abordan una marca que quiere crecer, pero no tiene claridad?",
    answer:
      "Empezamos por entender el contexto completo y definir una **estrategia personalizada** con prioridades claras y objetivos concretos.",
  },
  {
    question: "¿Qué los diferencia de una agencia tradicional?",
    answer:
      "No trabajamos por partes aisladas. Integramos comunicación, posicionamiento y estructura para construir una presencia **coherente y sólida**.",
  },
  {
    question: "¿Cómo aseguran que la estrategia realmente funcione?",
    answer:
      "Conectamos cada decisión con objetivos de negocio y medimos avances para ajustar con **precisión** durante el proceso.",
  },
  {
    question: "¿Trabajan solo la imagen o también el rendimiento comercial?",
    answer:
      "Nuestra mirada es integral: fortalecemos percepción de marca y desempeño comercial dentro de un **mismo sistema**.",
  },
  {
    question: "¿Pueden adaptarse a distintos tipos de negocio?",
    answer:
      "Sí. Diseñamos estrategias a medida según etapa, contexto competitivo y metas de **crecimiento** de cada marca.",
  },
  {
    question: "¿Qué rol juega la innovación en su trabajo?",
    answer:
      "Aplicamos herramientas de vanguardia cuando aportan valor real, siempre al servicio de una **estrategia clara**.",
  },
  {
    question: "¿Qué resultado buscan con su metodología?",
    answer:
      "Que tu marca se vea más sólida, comunique con claridad y avance con dirección hacia sus **objetivos estratégicos**.",
  },
  {
    question: "¿Qué pasa después de definir la estrategia?",
    answer:
      "Acompañamos la implementación con criterio y consistencia para convertir la estrategia en **resultados sostenibles**.",
  },
  {
    question: "¿Podemos avanzar aunque no tengamos todo definido?",
    answer:
      "Sí. Te ayudamos a ordenar el contexto, definir alcance y tomar decisiones con **criterio** desde el inicio.",
  },
  {
    question: "¿Cómo cuidan que todo mantenga la misma línea?",
    answer:
      "Trabajamos con una lógica unificada para sostener **coherencia real** entre lo que la marca dice, muestra y proyecta.",
  },
];

export default function Hero() {
  const [activeConversation, setActiveConversation] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveConversation((previous) => (previous + 1) % conversations.length);
    }, 8600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background pt-[8rem] md:pt-[12rem] h-[100svh] min-h-[100svh] border-b border-foreground/5">
      <div className="pointer-events-none absolute inset-y-0 left-[4%] hidden xl:block w-px bg-foreground/5" />
      <div className="pointer-events-none absolute inset-y-0 right-[4%] hidden xl:block w-px bg-foreground/5" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(154,164,144,0.05),transparent_28%),radial-gradient(circle_at_left_center,rgba(175,163,133,0.05),transparent_26%)]" />
      <AnimatedMeshBackground />

      <div className="container relative z-10 mx-auto px-6 md:px-12 h-full py-6 md:py-8">
        <div className="grid h-full items-center gap-8 md:gap-10 lg:grid-cols-12">
          <div className="relative z-20 lg:col-span-8 xl:pr-10 lg:max-w-[50vw]">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-6 text-xs md:text-sm tracking-[0.2em] uppercase text-foreground/40"
            >
              Estrategia, diseño y estructura digital
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 26, filter: "blur(7px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.05, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading font-[470] text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[62px] xl:text-[62px] 2xl:text-[62px] leading-[0.95] tracking-[-0.01em] text-foreground max-w-[15ch] lg:max-w-none"
            >
              <span className="hidden lg:block lg:-ml-1">
                <span className="block whitespace-nowrap">Ordenamos tu presencia digital</span>
                <span className="block whitespace-nowrap">para que tu marca se <span className="font-medium italic">vea</span>,</span>
                <span className="block whitespace-nowrap">se <span className="font-medium italic">entienda</span> y se <span className="font-medium italic">elija mejor</span>.</span>
              </span>
              <span className="lg:hidden">
                Ordenamos tu presencia digital para que tu marca se <span className="font-medium italic">vea</span>, se <span className="font-medium italic">entienda</span> y se <span className="font-medium italic">elija mejor</span>.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18 }}
              className="mt-6 lg:mt-8 max-w-[39rem] font-sans text-[18px] font-normal text-foreground/60 leading-[1.65]"
            >
              Ordenamos la comunicación, la estructura digital y la forma en que
              una marca se presenta para que la percepción correcta se traduzca en
              más solidez, más claridad y mejores decisiones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.28 }}
              className="mt-9 flex flex-col sm:flex-row gap-4 lg:gap-6 items-start"
            >
              <Magnetic strength={1}>
                <Link
                  href="/contacto"
                  className="inline-flex min-h-[3.3rem] items-center justify-center rounded-full bg-primary px-9 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-background shadow-[0_10px_26px_rgba(54,53,49,0.14)] transition-all duration-300 hover:bg-foreground hover:text-background hover:scale-[1.03]"
                >
                  Agendar una reunión
                </Link>
              </Magnetic>
              <Magnetic strength={0.5}>
                <Link
                  href="/servicios"
                  className="inline-flex min-h-[3.3rem] items-center justify-center rounded-full border border-foreground/14 bg-white/70 px-9 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-foreground/78 transition-all duration-300 hover:border-foreground/26 hover:bg-white hover:scale-[1.03]"
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
            className="relative z-10 hidden lg:flex lg:col-span-4 justify-end xl:pl-8"
          >
            <div className="w-full max-w-[28rem] relative min-h-[17rem]">
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
                    className="mr-8 rounded-[1.15rem] rounded-bl-[0.3rem] bg-white px-6 py-4 shadow-[0_14px_34px_rgba(54,53,49,0.12)] border border-foreground/8"
                  >
                    <p className="text-[1rem] text-foreground/78 leading-[1.45]">
                      <TypedText text={conversations[activeConversation].question} />
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 22, y: 6 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 16, y: -6 }}
                    transition={{ duration: 0.42, delay: 0.42 }}
                    className="ml-8 rounded-[1.2rem] rounded-br-[0.3rem] bg-white px-6 py-5 shadow-[0_18px_42px_rgba(54,53,49,0.14)] border border-foreground/8"
                  >
                    <p className="text-[0.98rem] text-foreground/76 leading-[1.6]">
                      <TypedText
                        text={conversations[activeConversation].answer}
                        delay={0.5}
                        stagger={0.016}
                      />
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
