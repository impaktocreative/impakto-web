import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terminos",
  alternates: {
    canonical: "/terminos",
  },
};

export default function TerminosPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <section className="relative overflow-hidden border-b border-foreground/8 bg-background py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(142,155,147,0.12),transparent_32%)]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <p className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-foreground/45">
            <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
            Legal
          </p>
          <h1 className="mt-4 font-heading text-[clamp(2rem,4.3vw,4.1rem)] leading-[0.92] tracking-[-0.02em] text-foreground">
            Terminos de uso
          </h1>
        </div>
      </section>

      <section className="bg-[#f7f8f5] py-16 md:py-20">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <article className="max-w-4xl border border-foreground/10 bg-white p-7 shadow-[0_18px_32px_-30px_rgba(50,50,47,0.45)] md:p-10">
            <h2 className="font-heading text-[1.9rem] leading-[0.98] tracking-[-0.02em] text-foreground">Alcance informativo</h2>
            <p className="mt-5 text-[1rem] leading-[1.72] text-foreground/70">
              El contenido publicado en este sitio tiene fines informativos y de
              presentacion de servicios de Impakto Creative.
            </p>
            <p className="mt-4 text-[1rem] leading-[1.72] text-foreground/70">
              Toda propuesta comercial, alcance final y condiciones de trabajo se
              define en instancias de contacto y acuerdo directo con cada cliente.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
