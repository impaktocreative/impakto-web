import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const principles = [
  {
    title: "Claridad",
    description:
      "Una marca comunica mejor cuando su direccion esta definida y su mensaje esta ordenado.",
  },
  {
    title: "Criterio",
    description:
      "La calidad del resultado depende de decisiones precisas, no de acumulacion de recursos.",
  },
  {
    title: "Consistencia",
    description:
      "Cada punto de contacto sostiene la misma logica visual, verbal y estructural.",
  },
  {
    title: "Funcion",
    description:
      "Diseno y comunicacion ganan valor cuando cumplen una funcion clara dentro del proyecto.",
  },
  {
    title: "Estandar",
    description:
      "Trabajamos con un criterio definido de calidad en la forma de pensar y de ejecutar.",
  },
];

export const metadata: Metadata = {
  title: "Agencia",
  description:
    "Conoce la vision, los principios y la metodologia de Impakto Creative para construir presencia digital con criterio.",
  alternates: {
    canonical: "/agencia",
  },
};

export default function AgenciaPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <span className="text-sm tracking-widest uppercase font-medium text-primary mb-5 block">
            Agencia
          </span>
          <h1 className="font-heading italic text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-foreground mb-8">
            Una agencia enfocada en construir presencia digital con estandar,
            estructura y criterio.
          </h1>
          <p className="text-lg md:text-xl text-foreground/75 leading-relaxed max-w-3xl">
            Impakto Creative desarrolla soluciones de comunicacion, diseno y
            estructura digital para marcas que necesitan una presencia mas clara,
            mas solida y mejor resuelta en cada nivel.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24 border-y border-foreground/8 bg-accent/15">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl grid gap-8 md:gap-10">
          <h2 className="font-heading italic text-4xl md:text-5xl">
            La calidad se percibe cuando todo esta bien articulado.
          </h2>
          <p className="text-foreground/75 leading-relaxed text-lg">
            Una marca se fortalece cuando su manera de presentarse tiene
            coherencia. El sitio, el mensaje, la estructura, el tono y la
            experiencia forman parte de una misma percepcion. Cada decision
            responde a una intencion concreta y cada elemento debe cumplir una
            funcion dentro de un sistema claro.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <h2 className="font-heading italic text-4xl md:text-5xl mb-12 md:mb-14">
            Principios que sostienen nuestra forma de construir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map((principle) => (
              <article key={principle.title} className="border border-foreground/10 p-8 bg-background">
                <h3 className="font-heading text-3xl mb-4">{principle.title}</h3>
                <p className="text-foreground/75 leading-relaxed">{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28 bg-foreground text-background">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="font-heading italic text-4xl md:text-5xl mb-8 text-primary">
            Una dinamica profesional mejora cada etapa del proyecto.
          </h2>
          <p className="text-background/80 leading-relaxed text-lg mb-12 max-w-3xl">
            Priorizamos relaciones de trabajo claras, procesos bien orientados y
            una construccion basada en dialogo, analisis y decisiones consistentes.
            Buscamos proyectos con apertura para pensar con profundidad y una
            intencion real de construir una solucion bien resuelta. Nuestra
            metodologia integra tres pilares de crecimiento: captacion,
            conversion y retencion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/servicios">Ver servicios</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-background/40 bg-transparent hover:bg-background hover:text-foreground">
              <Link href="/contacto">Contactar</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
