import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const services = [
  {
    title: "Estrategia y posicionamiento",
    subtitle:
      "Direccion para marcas que necesitan ordenar como se presentan y como quieren ser percibidas.",
    description:
      "Trabajamos sobre el enfoque general de la marca, su propuesta de valor y la direccion verbal y visual necesaria para proyectar mas consistencia.",
    includes: [
      "Analisis de presencia actual",
      "Definicion de enfoque comunicacional",
      "Ajuste de propuesta de valor",
      "Lineamientos verbales y visuales",
    ],
    cta: "Consultar este servicio",
  },
  {
    title: "Diseno y desarrollo web",
    subtitle:
      "Sitios y landing pages concebidos como parte central de la percepcion de una marca.",
    description:
      "Disenamos y desarrollamos sitios institucionales y landing pages con foco en arquitectura, legibilidad, experiencia y funcion comercial.",
    includes: [
      "Estructura de contenidos",
      "Redaccion estrategica",
      "Diseno visual de paginas",
      "Desarrollo responsive",
    ],
    cta: "Hablar sobre desarrollo web",
  },
  {
    title: "Comunicacion y contenido comercial",
    subtitle:
      "Mensajes, textos y piezas para expresar el valor de la marca con mayor claridad.",
    description:
      "Desarrollamos contenidos y materiales que mejoran la forma en que la marca se presenta, explica su propuesta y sostiene coherencia entre canales.",
    includes: [
      "Redaccion de sitios web",
      "Textos comerciales",
      "Mensajes de marca",
      "Piezas para soportes y campanas",
    ],
    cta: "Consultar sobre comunicacion",
  },
  {
    title: "Sistemas digitales y automatizacion",
    subtitle:
      "Procesos y herramientas para mejorar contacto, seguimiento y funcionamiento general.",
    description:
      "Desarrollamos soluciones funcionales para ordenar la capa operativa con claridad, utilidad y criterio.",
    includes: [
      "Formularios estrategicos",
      "Automatizaciones basicas",
      "Organizacion de canales de contacto",
      "Mejoras operativas orientadas a eficiencia",
    ],
    cta: "Hablar sobre sistemas digitales",
  },
];

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Servicios de estrategia, desarrollo web, comunicacion y sistemas digitales para construir marcas mas claras y solidas.",
  alternates: {
    canonical: "/servicios",
  },
};

export default function ServiciosPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <span className="text-sm tracking-widest uppercase font-medium text-primary mb-5 block">
            Servicios
          </span>
          <h1 className="font-heading italic text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-foreground mb-8">
            Servicios orientados a construir marcas mas claras, mas solidas y mejor
            resueltas.
          </h1>
          <p className="text-lg md:text-xl text-foreground/75 leading-relaxed max-w-3xl">
            Cada area existe para resolver necesidades concretas de direccion,
            diseno, estructura digital y comunicacion.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24 border-y border-foreground/8 bg-accent/15">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="font-heading italic text-4xl md:text-5xl mb-6">
            Cada servicio responde a una necesidad concreta de construccion.
          </h2>
          <p className="text-foreground/75 text-lg leading-relaxed max-w-4xl">
            El enfoque no parte de tareas sueltas. Parte de detectar que necesita
            orden, que necesita estructura y que necesita una mejor resolucion.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl space-y-12">
          {services.map((service) => (
            <article key={service.title} className="border border-foreground/10 p-8 md:p-10 bg-background">
              <h2 className="font-heading italic text-4xl md:text-5xl mb-4">{service.title}</h2>
              <p className="text-foreground/80 mb-5 text-lg leading-relaxed">{service.subtitle}</p>
              <p className="text-foreground/70 mb-6 leading-relaxed max-w-4xl">{service.description}</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-foreground/75">
                {service.includes.map((item) => (
                  <li key={item} className="border border-foreground/8 px-4 py-3 bg-accent/10">
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline">
                <Link href="/contacto">{service.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-28 bg-foreground text-background">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="font-heading italic text-4xl md:text-5xl mb-8 text-primary">
            Cada proyecto requiere una lectura precisa.
          </h2>
          <p className="text-background/80 leading-relaxed text-lg mb-10">
            Algunas marcas llegan con una necesidad completamente definida. Otras
            necesitan ordenar primero el punto de partida. En ambos casos, una
            conversacion inicial permite detectar que hace falta y cual es la mejor
            forma de construirlo.
          </p>
          <Button asChild size="lg">
            <Link href="/contacto">Coordinar reunion estrategica</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
