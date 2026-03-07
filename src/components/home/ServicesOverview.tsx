import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Estrategia y posicionamiento",
    description:
      "Dirección comunicacional y criterio de marca para proyectos que necesitan una base más clara sobre la cual construir.",
  },
  {
    title: "Diseño y desarrollo web",
    description:
      "Sitios y landing pages pensados para proyectar mejor el nivel de la marca y ordenar su presencia digital.",
  },
  {
    title: "Comunicación y contenido comercial",
    description:
      "Textos, piezas y materiales desarrollados para expresar el valor del negocio con mayor precisión.",
  },
  {
    title: "Sistemas digitales y automatización",
    description:
      "Estructuras funcionales que mejoran procesos, contacto y organización operativa.",
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-foreground/8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8">
          <div className="lg:col-span-4 lg:pr-8">
            <span className="text-sm tracking-[0.16em] uppercase font-medium text-primary mb-5 block">
              Áreas principales
            </span>
            <h2 className="font-heading italic text-4xl md:text-5xl mb-6 text-foreground">
              Áreas principales de trabajo
            </h2>
            <p className="text-foreground/75 leading-relaxed mb-10 text-lg">
              Nuestra oferta se organiza en áreas definidas para construir
              presencia, orden y consistencia en distintos niveles del proyecto.
            </p>
            <Button asChild variant="outline" className="hidden lg:inline-flex">
              <Link href="/servicios">Explorar servicios</Link>
            </Button>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="flex flex-col">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="group border-b border-foreground/10 py-7 md:py-8 bg-background transition-colors duration-300"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="font-heading text-3xl text-foreground">{service.title}</h3>
                    <ArrowRight className="text-foreground/25 -rotate-45 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-0" />
                  </div>
                  <p className="text-foreground/72 leading-relaxed max-w-xl">{service.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <Button asChild variant="outline" className="w-full">
                <Link href="/servicios">Explorar servicios</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
