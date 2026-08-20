import type { Metadata } from "next";
import AgenciaContent from "@/components/agencia/AgenciaContent";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agencia",
  description:
    "Impakto Creative es un estudio de Buenos Aires con más de 20 años ordenando la comunicación de marcas que necesitaban dirección.",
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
