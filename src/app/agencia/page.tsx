import type { Metadata } from "next";
import AgenciaContent from "@/components/agencia/AgenciaContent";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agencia",
  description:
    "Conoce al equipo multidisciplinario de Impakto Creative, su trayectoria de más de 20 años y su forma de acompañar marcas con criterio y compromiso.",
  alternates: {
    canonical: "/agencia",
  },
  openGraph: {
    url: "/agencia",
  },
};

const agenciaBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: `${siteUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Agencia",
      item: `${siteUrl}/agencia`,
    },
  ],
};

export default function AgenciaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agenciaBreadcrumbSchema) }}
      />
      <AgenciaContent />
    </>
  );
}
