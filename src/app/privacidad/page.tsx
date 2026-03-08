import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad",
  alternates: {
    canonical: "/privacidad",
  },
};

export default function PrivacidadPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px] py-24 md:py-28">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <h1 className="font-heading italic text-5xl md:text-6xl mb-8">Politica de privacidad</h1>
        <p className="text-foreground/75 leading-relaxed mb-4">
          Impakto Creative utiliza los datos de contacto recibidos para responder
          consultas y coordinar conversaciones de trabajo.
        </p>
        <p className="text-foreground/75 leading-relaxed">
          No compartimos informacion personal con terceros sin consentimiento previo.
          Para solicitar la modificacion o eliminacion de sus datos, escriba a
          hola@impaktocreative.com.
        </p>
      </div>
    </main>
  );
}
