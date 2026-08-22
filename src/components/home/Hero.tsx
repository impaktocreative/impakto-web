"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import CampoArmonico from "@/components/visual/CampoArmonico";
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
  cursor = false,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  /** Caret dorado que parpadea mientras se escribe y se apaga al terminar. */
  cursor?: boolean;
}) {
  const words = parseMarkedWords(text);
  // Cuándo termina de entrar la última palabra. Se calcula acá porque es el
  // único lugar que conoce el escalonado real; pasarlo desde afuera se
  // desincroniza en cuanto alguien cambia el stagger.
  const finDelTipeo = delay + Math.max(0, words.length - 1) * stagger + 0.14;

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
          {/* El separador mira la palabra siguiente. Cuando el texto marcado
              termina justo antes de un signo, ese signo queda como palabra
              aparte y se leía "escriba ." con el espacio adelante. */}
          {index < words.length - 1 && !/^[.,;:!?)\]]/.test(words[index + 1]!.text) ? " " : ""}
        </motion.span>
      ))}
      {cursor ? (
        <motion.span
          aria-hidden="true"
          className="cursor-tipeo"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: finDelTipeo + 0.6, duration: 0.35 }}
        >
          <span className="cursor-tipeo-barra" />
        </motion.span>
      ) : null}
    </motion.span>
  );
}

/**
 * El guion del hero.
 *
 * Es una conversación real, no un carrusel de argumentos. Las preguntas son
 * las que hace alguien que ya evaluó proveedores y llega con reparos, no las
 * que le convendría hacer al vendedor. Cada respuesta arranca con un criterio
 * concreto, una distinción o un límite, porque eso es lo único que demuestra
 * oficio en dos líneas. Un adjetivo no demuestra nada.
 *
 * Regla al agregar una: si la respuesta se puede copiar y pegar en el sitio de
 * cualquier otra agencia sin cambiarle una palabra, no sirve.
 */
const conversations: Conversation[] = [
  {
    question: "Ya trabajamos con una agencia. ¿Qué harían distinto?",
    answer:
      "Revisamos las decisiones antes que las piezas. Rara vez el problema es el volumen de producción; casi siempre es que **el criterio cambia según quién ejecute**.",
  },
  {
    question: "¿Cómo determinan si el problema es la web o es nuestra propuesta?",
    answer:
      "Lo evaluamos en dos planos: qué perfil llega y qué claridad encuentra al llegar. Si el perfil no es el correcto, el sitio no lo resuelve. Si lo es y no avanza, **el problema está en el sitio**.",
  },
  {
    question: "¿Por qué empiezan por estrategia y no directamente por diseño?",
    answer:
      "Porque el diseño expresa una decisión ya tomada. Cuando esa decisión no existe, el diseño la define por defecto y la marca queda **sin argumento para sostenerla** ante su directorio.",
  },
  {
    question: "Tenemos varias unidades de negocio y cada una comunica distinto.",
    answer:
      "Eso se resuelve con jerarquía, no con un manual. Definimos qué determina la marca madre y qué queda a criterio de cada unidad. Sin ese límite explícito, **el manual deja de aplicarse** en semanas.",
  },
  {
    question: "¿En cuánto tiempo se ven resultados?",
    answer:
      "La percepción cambia desde la salida. El impacto comercial depende del volumen de oportunidades que maneje la compañía: con ciclos de venta largos, **un trimestre no es muestra suficiente** para concluir.",
  },
  {
    question: "¿Trabajan con nuestro equipo interno o lo reemplazan?",
    answer:
      "Trabajamos con el equipo. Aportamos dirección y criterio externo; **el conocimiento del negocio ya está adentro** y es lo más difícil de reconstruir desde afuera.",
  },
  {
    question: "¿Qué necesitan de nuestra parte para comenzar?",
    answer:
      "Un interlocutor con capacidad de decisión. Es la única condición que no se puede delegar, y **define el ritmo del proyecto** más que cualquier otro factor.",
  },
  {
    question: "¿Cómo definen la inversión de un proyecto?",
    answer:
      "Por alcance, y el alcance surge del diagnóstico, que no tiene costo. Anticipar una cifra antes de esa conversación **sería un número sin respaldo**.",
  },
];


/** Cuánto queda en pantalla cada turno, ya con la respuesta escrita. */
const DURACION_TURNO = 10200;

type Fase = "pregunta" | "pensando" | "respuesta";

export default function Hero() {
  // Índice y fase viajan juntos en un solo estado. Separados hacía falta un
  // efecto que reseteara la fase al cambiar de turno, y un efecto que escribe
  // estado de forma síncrona renderiza dos veces cada vez.
  const [turno, setTurno] = useState<{ indice: number; fase: Fase }>({
    indice: 0,
    fase: "pregunta",
  });
  const [pausado, setPausado] = useState(false);
  const menosMovimiento = useReducedMotion();

  const activeConversation = turno.indice;
  const fase: Fase = menosMovimiento ? "respuesta" : turno.fase;
  const currentConversation =
    conversations[activeConversation] ?? conversations[0] ?? { question: "", answer: "" };

  // Lo que hace que se lea como dos personas y no como un carrusel: la
  // pregunta se termina de escribir, pasa un momento, aparecen los tres puntos
  // y recién entonces contesta Impakto. Sin esa espera las dos burbujas caen
  // juntas y queda claro que es una animación, no una conversación.
  useEffect(() => {
    if (menosMovimiento) return;
    const aPensar = window.setTimeout(
      () => setTurno((t) => ({ ...t, fase: "pensando" })),
      1650,
    );
    const aResponder = window.setTimeout(
      () => setTurno((t) => ({ ...t, fase: "respuesta" })),
      2750,
    );
    return () => {
      window.clearTimeout(aPensar);
      window.clearTimeout(aResponder);
    };
  }, [activeConversation, menosMovimiento]);

  // El turno no avanza mientras el visitante tiene el bloque encima. Antes
  // rotaba cada 8,6 s pasara lo que pasara, así que cambiaba justo a mitad de
  // la respuesta que alguien estaba leyendo.
  useEffect(() => {
    if (pausado) return;
    const siguiente = window.setTimeout(() => {
      setTurno((t) => ({ indice: (t.indice + 1) % conversations.length, fase: "pregunta" }));
    }, DURACION_TURNO);
    return () => window.clearTimeout(siguiente);
  }, [activeConversation, pausado]);

  return (
    <section className="relative flex min-h-[92svh] flex-col justify-center overflow-hidden bg-paper pb-16 pt-[6.5rem] md:min-h-screen md:pb-24 md:pt-[9rem]">

      {/* Filotaxis áurea encendida por una figura de Chladni. El detalle de
          por qué esas dos matemáticas y no otras está en el componente.

          Reemplaza a la escultura de cintas, que a esta escala y sobre papel
          se leía como una maraña gris: mucha densidad y ninguna estructura
          visible, justo lo contrario de lo que tiene que decir un estudio que
          vende criterio. */}
      <div className="pointer-events-none absolute inset-0">
        <CampoArmonico />
      </div>

      {/* El campo se apaga hacia el pie de la sección para que el texto de
          abajo no compita con él. Un degradado del propio papel, sin color. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,var(--color-paper))]" />

      {/* Los trazos cruzaban las letras del titular. Este velo del propio
          papel baja el campo justo detrás del texto, sin apagarlo del todo. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-paper)_72%,transparent)_0%,color-mix(in_srgb,var(--color-paper)_46%,transparent)_62%,transparent_100%)] lg:bg-[radial-gradient(105%_68%_at_16%_36%,color-mix(in_srgb,var(--color-paper)_88%,transparent)_12%,color-mix(in_srgb,var(--color-paper)_38%,transparent)_50%,transparent_76%)]" />

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

          {/* La conversación.
              Estaba oculta por debajo de lg, así que en teléfono no existía y
              media audiencia nunca la veía. Ahora baja debajo de los botones.

              El visitante va a la derecha y Impakto a la izquierda, ninguno a
              todo el ancho: esa asimetría es lo que hace que se lea como dos
              personas hablando y no como una ficha con pregunta y respuesta. */}
          <div
            className="hero-rise hero-rise-delay-3 lg:col-span-5 lg:col-start-8"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocusCapture={() => setPausado(true)}
            onBlurCapture={() => setPausado(false)}
          >
            <div className="relative w-full lg:ml-auto lg:max-w-[24rem]">
              {/* Luz dorada muy baja detrás de la conversación. Sobre papel se
                  lee como calidez, no como color, y es lo que hace que el ojo
                  vaya ahí después del titular. */}
              <div aria-hidden="true" className="aura-conversacion pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10" />
              <p className="mb-4 flex items-center gap-2.5 text-eyebrow uppercase text-stone">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
                </span>
                Consultas reales
              </p>

              {/* Alto reservado: sin esto la sección salta de tamaño cada vez
                  que entra una respuesta más larga que la anterior. */}
              <div className="min-h-[15.5rem] sm:min-h-[13.5rem] lg:min-h-[15rem]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeConversation}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.38 }}
                      className="ml-auto w-fit max-w-[19rem] rounded-card rounded-br-sm border border-graphite/15 bg-paper-lift/85 px-4 py-3 backdrop-blur-md sm:max-w-[21rem]"
                    >
                      <p className="text-body-sm text-slate">
                        <TypedText text={currentConversation.question} />
                      </p>
                    </motion.div>

                    {fase !== "pregunta" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.34 }}
                        className="burbuja-impakto relative z-10 -mt-1 mr-auto w-fit max-w-[20.5rem] rounded-card rounded-bl-sm border border-ink bg-ink px-4 py-4 text-paper sm:max-w-[22rem]"
                      >
                        {/* El filete se dibuja de izquierda a derecha justo
                            cuando aparece la burbuja, en vez de estar puesto
                            desde el principio. Es lo que hace que la respuesta
                            se sienta emitida y no revelada. */}
                        <motion.span
                          aria-hidden="true"
                          className="hairline-gold absolute inset-x-4 top-0 h-px origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                        />
                        <span className="mb-2 flex items-center gap-2 text-eyebrow uppercase text-fog">
                          <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={12} className="h-3 w-auto" />
                          Impakto
                        </span>
                        {fase === "pensando" ? (
                          <span className="asesor-pensando" aria-label="Escribiendo">
                            <span />
                            <span />
                            <span />
                          </span>
                        ) : (
                          <p className="text-body-sm text-ash">
                            <TypedText text={currentConversation.answer} stagger={0.015} cursor />
                          </p>
                        )}
                      </motion.div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sin esto nadie sabe que hay más de una conversación. Además se
                  puede saltar a cualquiera, que es la razón de que sean botones
                  y no adornos. */}
              <div className="mt-5 flex items-center gap-1.5">
                {conversations.map((c, indice) => (
                  <button
                    key={c.question}
                    type="button"
                    onClick={() => setTurno({ indice, fase: "pregunta" })}
                    aria-label={`Ver consulta ${indice + 1} de ${conversations.length}`}
                    aria-current={indice === activeConversation}
                    className={`h-px py-2 transition-all duration-slow ${
                      indice === activeConversation ? "w-7" : "w-3.5"
                    }`}
                  >
                    <span className="relative block h-px w-full overflow-hidden bg-graphite/25">
                      {indice === activeConversation ? (
                        <motion.span
                          key={`${activeConversation}-${pausado}`}
                          className="absolute inset-0 origin-left bg-gold"
                          initial={{ scaleX: pausado ? 1 : 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: pausado ? 0 : DURACION_TURNO / 1000, ease: "linear" }}
                        />
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
