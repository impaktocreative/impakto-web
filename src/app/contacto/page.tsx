import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import Image from "next/image";

const process = [
  {
    step: "01",
    title: "Contexto",
    description: "Revisamos su situacion actual, objetivos y restricciones para entender el problema real.",
  },
  {
    step: "02",
    title: "Prioridades",
    description: "Definimos que conviene resolver primero para generar impacto con criterio de negocio.",
  },
  {
    step: "03",
    title: "Hoja de ruta",
    description: "Proponemos una estructura de trabajo clara, con etapas, alcance y proximos pasos.",
  },
];

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Inicie una conversacion con Impakto Creative para evaluar su proyecto y definir una direccion clara.",
  alternates: {
    canonical: "/contacto",
  },
};

export default function ContactoPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="relative overflow-hidden border-b border-foreground/8 bg-background py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(164,154,130,0.12),transparent_30%),radial-gradient(circle_at_90%_14%,rgba(142,155,147,0.11),transparent_34%)]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <p className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.2em] text-foreground/45">
            <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={10} height={12} className="h-3 w-auto opacity-55" />
            Contacto estrategico
          </p>
          <h1 className="mt-5 max-w-[17ch] font-heading text-balance text-[clamp(2.2rem,6.2vw,4.9rem)] leading-[0.92] tracking-[-0.02em] text-foreground">
            Iniciemos una conversacion para ordenar su proximo paso.
          </h1>
          <p className="mt-7 max-w-[46rem] text-[1rem] leading-[1.72] text-foreground/68 md:text-[1.1rem]">
            Si su marca necesita mayor claridad comercial, una comunicacion mejor
            resuelta o una estructura digital mas solida, este es el punto de inicio.
          </p>
        </div>
      </section>

      <section className="border-b border-foreground/8 bg-[#f7f8f5] py-20 md:py-24">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <h2 className="font-heading text-balance text-[clamp(1.9rem,3.3vw,3.3rem)] leading-[0.94] tracking-[-0.02em] text-foreground">
                Un planteo claro acelera una mejor construccion.
              </h2>
              <p className="mt-6 text-[1rem] leading-[1.7] text-foreground/68">
                Comparta su contexto y necesidad principal. Con esa base,
                respondemos con una orientacion concreta y con criterios de prioridad.
              </p>

              <div className="premium-grid-light mt-8 border border-foreground/10 bg-white/80 p-6">
                <h3 className="text-[0.64rem] uppercase tracking-[0.2em] text-foreground/48">
                  Contacto directo
                </h3>
                <div className="mt-4 space-y-3 text-[0.96rem] text-foreground/78">
                  <a href="mailto:hola@impaktocreative.com" className="block transition-colors hover:text-primary">
                    hola@impaktocreative.com
                  </a>
                  <a href="https://wa.me/5491169244656" target="_blank" rel="noreferrer" className="block transition-colors hover:text-primary">
                    Argentina (WhatsApp): +54 9 11 6924-4656
                  </a>
                  <a href="tel:+16152829799" className="block transition-colors hover:text-primary">
                    Exterior: +1 615 282 9799
                  </a>
                  <p className="text-foreground/62">Ciudad de Buenos Aires, Argentina.</p>
                </div>
              </div>

              <div className="mt-8 space-y-4 border-t border-foreground/12 pt-6">
                {process.map((item) => (
                  <article key={item.step} className="grid grid-cols-[2.8rem_1fr] gap-3">
                    <p className="font-heading text-[1.7rem] leading-none text-foreground/18">{item.step}</p>
                    <div>
                      <h3 className="font-heading text-[1.3rem] leading-[1] tracking-[-0.01em] text-foreground/90">{item.title}</h3>
                      <p className="mt-2 text-[0.94rem] leading-[1.6] text-foreground/66">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              <div className="border border-foreground/10 bg-white p-6 shadow-[0_26px_36px_-30px_rgba(50,50,47,0.45)] md:p-9">
                <h2 className="font-heading text-[clamp(1.9rem,3vw,3.2rem)] leading-[0.94] tracking-[-0.02em] text-foreground">
                  Formulario de contacto
                </h2>
                <p className="mt-4 text-[0.98rem] leading-[1.68] text-foreground/64">
                  Complete estos datos para que podamos darle una respuesta clara,
                  realista y alineada con su objetivo.
                </p>
                <div className="mt-7 border-t border-foreground/10 pt-7">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#24282d] py-24 text-background md:py-28">
        <div className="pointer-events-none absolute inset-0 tech-grid-soft opacity-[0.14]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <div className="border border-white/14 bg-white/[0.03] p-9 md:p-12">
            <h2 className="max-w-[16ch] font-heading text-balance text-[clamp(2rem,3.8vw,3.8rem)] leading-[0.92] tracking-[-0.02em] text-background">
              Trabajamos mejor con proyectos que valoran criterio y proceso.
            </h2>
            <p className="mt-6 max-w-[44rem] text-[1rem] leading-[1.72] text-background/78 md:text-[1.08rem]">
              Priorizamos relaciones profesionales con objetivos definidos y
              decisiones oportunas. Esa alineacion permite construir soluciones
              con mayor coherencia, calidad y sostenibilidad en el tiempo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
