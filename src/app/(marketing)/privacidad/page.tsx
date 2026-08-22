import type { Metadata } from "next";
import Image from "next/image";
import { siteUrl, openGraphDeRuta } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Política de privacidad de Impakto Creative sobre tratamiento de datos de contacto y solicitudes de eliminación o modificación.",
  alternates: {
    canonical: "/privacidad",
  },
  openGraph: {
    ...openGraphDeRuta("/privacidad"),
  },
};

const privacidadSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Política de privacidad",
  description:
    "Política de privacidad de Impakto Creative sobre tratamiento de datos de contacto y solicitudes de eliminación o modificación.",
  url: `${siteUrl}/privacidad`,
  inLanguage: "es-AR",
  isPartOf: {
    "@type": "WebSite",
    name: "Impakto Creative",
    url: siteUrl,
  },
};

export default function PrivacidadPage() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacidadSchema) }}
      />
      <section className="relative overflow-hidden border-b border-graphite/8 bg-paper py-16 md:py-18">
        <div className="container relative mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <p className="flex items-center gap-2 text-eyebrow uppercase text-stone">
            <Image src="/logos/icono-2.svg" alt="" aria-hidden="true" width={9} height={11} className="h-3 w-auto opacity-55" />
            Legal
          </p>
          <h1 className="mt-4 font-heading text-display-lg text-foreground">
            Política de privacidad
          </h1>
        </div>
      </section>

      <section className="bg-band py-14 md:py-16">
        <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
          <article className="grid grid-cols-1 gap-6 border-t border-graphite/14 pt-8 lg:grid-cols-12 lg:gap-14">
            <h2 className="font-heading text-display-xs text-foreground lg:col-span-4">Tratamiento de datos</h2>
            <div className="lg:col-span-7 lg:col-start-6">
            <p className="text-body text-slate">
              Impakto Creative utiliza los datos de contacto recibidos para
              responder consultas, coordinar reuniones y dar seguimiento a
              conversaciones de trabajo solicitadas por el usuario.
            </p>
            <p className="mt-4 text-body text-slate">
              No compartimos información personal con terceros sin consentimiento
              previo. Para solicitar la modificación o eliminación de tus datos,
              escribinos a <a className="text-foreground underline underline-offset-4" href="mailto:hola@impaktocreative.com">hola@impaktocreative.com</a>.
            </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
