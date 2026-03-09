import type { Metadata } from "next";
import ServiciosContent from "@/components/servicios/ServiciosContent";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Servicios Estratégicos",
  description:
    "Servicios estratégicos para captar, convertir y retener mejor. Impakto integra marca, comunicación, desarrollo y sistemas en planes de crecimiento de alto valor.",
  alternates: {
    canonical: "/servicios",
  },
  openGraph: {
    url: "/servicios",
  },
};

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Servicios estratégicos de marca y crecimiento",
  provider: {
    "@type": "Organization",
    name: "Impakto Creative",
    url: siteUrl,
  },
  areaServed: ["Argentina", "Estados Unidos"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios de Impakto Creative",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Dirección de marca y posicionamiento" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ecosistema digital para captación y conversión" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Comunicación comercial y contenido" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automatización, IA y optimización de procesos" } },
    ],
  },
  url: `${siteUrl}/servicios`,
};

const serviciosBreadcrumbSchema = {
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
      name: "Servicios estratégicos",
      item: `${siteUrl}/servicios`,
    },
  ],
};

export default function ServiciosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviciosBreadcrumbSchema) }}
      />
      <ServiciosContent />
    </>
  );
}
