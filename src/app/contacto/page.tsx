import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

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
      <section className="py-24 md:py-32 border-b border-foreground/8">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <span className="text-sm tracking-widest uppercase font-medium text-primary mb-5 block">
            Contacto
          </span>
          <h1 className="font-heading italic text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-foreground mb-8">
            Iniciemos una conversacion sobre su proyecto.
          </h1>
          <p className="text-lg md:text-xl text-foreground/75 leading-relaxed max-w-3xl">
            Si su marca necesita una presencia mas clara, una comunicacion mejor
            resuelta o una estructura digital mas solida, escribanos para evaluar
            el mejor punto de partida.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4">
            <h2 className="font-heading italic text-4xl mb-6">
              Un planteo claro facilita una mejor construccion.
            </h2>
            <p className="text-foreground/75 leading-relaxed mb-8">
              Comparta brevemente su marca, su situacion actual y lo que
              necesita resolver. Esa informacion nos permite responder con mayor
              precision.
            </p>
            <div className="border border-foreground/12 bg-accent/15 p-6 space-y-3">
              <h3 className="text-sm tracking-widest uppercase font-medium text-foreground/70">
                Contacto directo
              </h3>
              <a href="mailto:hola@impaktocreative.com" className="text-foreground hover:text-primary transition-colors">
                hola@impaktocreative.com
              </a>
              <a href="https://wa.me/5491169244656" target="_blank" rel="noreferrer" className="block text-foreground hover:text-primary transition-colors">
                Argentina (mensajes / WhatsApp): +54 9 11 6924-4656
              </a>
              <a href="tel:+16152829799" className="block text-foreground hover:text-primary transition-colors">
                Exterior: +1 615 282 9799
              </a>
              <p className="text-foreground/70">Oficinas en Ciudad de Buenos Aires.</p>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="border border-foreground/10 p-6 md:p-8 bg-background">
              <h2 className="font-heading italic text-3xl md:text-4xl mb-6">
                Formulario de contacto
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-foreground text-background">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <h2 className="font-heading italic text-4xl md:text-5xl mb-7 text-primary">
            Trabajamos mejor con proyectos que valoran calidad, criterio y proceso.
          </h2>
          <p className="text-background/80 leading-relaxed text-lg max-w-4xl">
            Priorizamos relaciones profesionales, bien orientadas y con una
            intencion real de construir soluciones solidas. Cuando existe buena
            alineacion entre necesidad, enfoque y forma de trabajo, el resultado
            crece en claridad, consistencia y nivel.
          </p>
        </div>
      </section>
    </main>
  );
}
