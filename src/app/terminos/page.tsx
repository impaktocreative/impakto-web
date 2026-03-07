import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminos",
  alternates: {
    canonical: "/terminos",
  },
};

export default function TerminosPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px] py-24 md:py-28">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <h1 className="font-heading italic text-5xl md:text-6xl mb-8">Terminos de uso</h1>
        <p className="text-foreground/75 leading-relaxed mb-4">
          El contenido publicado en este sitio tiene fines informativos y de
          presentacion de servicios de Impakto Creative.
        </p>
        <p className="text-foreground/75 leading-relaxed">
          Cualquier propuesta comercial se define en instancias de contacto y
          acuerdo directo con cada cliente.
        </p>
      </div>
    </main>
  );
}
