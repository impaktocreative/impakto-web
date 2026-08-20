import type { Metadata } from "next";
import Image from "next/image";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos",
  description:
    "Términos de uso de Impakto Creative para el contenido informativo del sitio y alcance comercial de los servicios.",
  alternates: {
    canonical: "/terminos",
  },
  openGraph: {
    url: "/terminos",
  },
};

const terminosSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Términos de uso",
  description:
    "Términos de uso de Impakto Creative para el contenido informativo del sitio y alcance comercial de los servicios.",
  url: `${siteUrl}/terminos`,
  inLanguage: "es-AR",
  isPartOf: {
    "@type": "WebSite",
    name: "Impakto Creative",
    url: siteUrl,
  },
};

export default function TerminosPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(terminosSchema) }}
      />
      <section className="relative overflow-hidden border-b border-foreground/8 bg-background py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(142,155,147,0.12),transparent_32%)]" />
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <p className="flex items-center gap-2 text-eyebrow uppercase tracking-[0.2em] text-foreground/45">
            <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
            Legal
          </p>
          <h1 className="mt-4 font-heading text-display-lg tracking-[-0.02em] text-foreground">
            Términos de uso
          </h1>
        </div>
      </section>

      <section className="bg-band py-16 md:py-20">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <article className="max-w-4xl border border-foreground/10 bg-white p-7 shadow-premium-lift md:p-10">
            <h2 className="font-heading text-display-xs tracking-[-0.02em] text-foreground">Alcance informativo</h2>
            <p className="mt-5 text-body text-foreground/70">
              El contenido publicado en este sitio tiene fines informativos y de
              presentación de servicios de Impakto Creative.
            </p>
            <p className="mt-4 text-body text-foreground/70">
              Toda propuesta comercial, alcance final y condiciones de trabajo se
              define en instancias de contacto y acuerdo directo con cada cliente.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
