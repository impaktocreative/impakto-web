"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import CoherenceField from "@/components/home/CoherenceField";
import EsculturaViva from "@/components/visual/EsculturaViva";
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
          className={word.bold ? "font-semibold text-paper" : undefined}
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
      "Comenzamos con un diagnóstico de contexto, mensaje y objetivos para definir una **dirección estratégica clara** desde el inicio.",
  },
  {
    question: "¿El alcance contempla solo diseño o también estrategia comercial?",
    answer:
      "Trabajamos de forma integral: comunicación, marca y estructura comercial para sostener una presencia **sólida y coherente** en cada canal.",
  },
  {
    question: "¿Es posible mejorar conversión sin comprometer identidad de marca?",
    answer:
      "Sí. Ordenamos la comunicación para que tu propuesta gane claridad y se traduzca en una conversión **más consistente** sin perder identidad.",
  },
  {
    question: "¿Qué incluye el enfoque online y offline?",
    answer:
      "Alineamos todos los puntos de contacto para que tu marca se perciba **uniforme y confiable** online y offline.",
  },
  {
    question: "¿Cómo abordan captación, conversión y retención?",
    answer:
      "Diseñamos estrategias para atraer mejores oportunidades, convertir con mayor claridad y fortalecer relaciones **de largo plazo** con tus clientes.",
  },
  {
    question: "¿Integran IA y herramientas avanzadas en los proyectos?",
    answer:
      "Sí, siempre bajo criterio estratégico. La tecnología aporta valor cuando está integrada en una **estrategia bien definida**.",
  },
  {
    question: "¿El acompañamiento cubre todo el proceso o solo la etapa inicial?",
    answer:
      "Acompañamos cada etapa para sostener decisiones con mayor **seguridad y claridad** durante todo el proceso.",
  },
  {
    question: "¿Se puede iniciar sin un alcance completamente definido?",
    answer:
      "Sí. Definimos prioridades, alcance y hoja de ruta para construir una base **más firme para escalar**.",
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
    <section className="relative flex min-h-[92svh] flex-col justify-center overflow-hidden bg-paper pb-16 pt-[6.5rem] md:min-h-screen md:pb-24 md:pt-[9rem]">
      <CoherenceField />

      {/* La escultura, calculada cuadro a cuadro y no traída como imagen: gira
          con el puntero, se retuerce con el scroll y el eje de luz dorada la
          atraviesa desde donde está el cursor.

          Ocupa la sección entera y se desvanece hacia la izquierda con una
          máscara. Antes vivía en un contenedor al 58% y se veía el corte
          vertical a mitad de pantalla, como si la pieza estuviera recortada
          con tijera. */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          maskImage:
            'radial-gradient(120% 100% at 78% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0) 82%)',
          WebkitMaskImage:
            'radial-gradient(120% 100% at 78% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0) 82%)',
        }}
      >
        <EsculturaViva tono="claro" />
      </div>

      {/* El campo se apaga hacia el pie de la sección para que el texto de
          abajo no compita con él. Un degradado del propio papel, sin color. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,var(--color-paper))]" />

      {/* Los trazos cruzaban las letras del titular. Este velo del propio
          papel baja el campo justo detrás del texto, sin apagarlo del todo. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-paper)_88%,transparent)_0%,color-mix(in_srgb,var(--color-paper)_72%,transparent)_62%,transparent_100%)] lg:bg-[radial-gradient(120%_75%_at_18%_38%,var(--color-paper)_18%,color-mix(in_srgb,var(--color-paper)_62%,transparent)_52%,transparent_78%)]" />

      <div className="container relative z-10 mx-auto w-full max-w-[75rem] px-7 md:px-10 lg:px-12">
        {/* El titular manda: se lleva su propia fila y todo el ancho útil.
            Debajo, el cuerpo y la anotación se reparten en dos columnas. */}
        <p className="hero-rise flex items-center gap-3 text-eyebrow uppercase text-stone">
          <span className="hairline-gold inline-block h-px w-9" />
          Diseño y estructura digital
        </p>

        <h1 className="hero-rise hero-rise-delay-1 mt-6 max-w-[60rem] text-balance font-heading text-display-2xl text-ink md:mt-7">
          Construimos estrategias de comunicación para que tu marca{" "}
          <span className="gold-reflect">venda mejor, online y offline.</span>
        </h1>

        <div className="mt-11 grid gap-y-12 md:mt-14 lg:grid-cols-12 lg:items-end lg:gap-x-16">
          <div className="lg:col-span-6">
            <p className="hero-rise hero-rise-delay-2 max-w-[44ch] text-body-lg text-slate">
              Ordenamos el mensaje y la presencia de tu marca para que atraiga mejores
              oportunidades y las convierta con menos fricción. Después trabajamos para
              que esas relaciones duren.
            </p>

            <div className="hero-rise hero-rise-delay-3 mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Magnetic strength={1}>
                <Link href="/contacto" className="btn-ink sheen w-full sm:w-auto">
                  Pedir diagnóstico
                </Link>
              </Magnetic>
              <Magnetic strength={0.5}>
                <Link href="/servicios" className="btn-outline w-full sm:w-auto">
                  Ver servicios
                </Link>
              </Magnetic>
            </div>
          </div>

          {/* La conversación hace de anotación editorial sobre el campo, como
              las píldoras flotantes de la referencia. Separada por hairline,
              no por sombra. */}
          <div className="hero-rise hero-rise-delay-3 hidden lg:col-span-5 lg:col-start-8 lg:block">
            <div className="relative ml-auto w-full max-w-[24rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConversation}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.38 }}
                    className="ml-auto max-w-[21rem] rounded-card border border-graphite/20 bg-paper-lift/80 px-5 py-4 backdrop-blur-md"
                  >
                    <p className="text-body-sm text-slate">
                      <TypedText text={currentConversation.question} />
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.42, delay: 0.42 }}
                    className="relative rounded-card border border-ink bg-ink px-5 py-5 text-paper"
                  >
                    <span aria-hidden="true" className="hairline-gold absolute inset-x-5 top-0 h-px" />
                    <span className="mb-2.5 flex items-center gap-2 text-eyebrow uppercase text-fog">
                      <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={12} className="h-3 w-auto" />
                      Impakto
                    </span>
                    <p className="text-body-sm text-ash">
                      <TypedText text={currentConversation.answer} delay={0.5} stagger={0.016} />
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
