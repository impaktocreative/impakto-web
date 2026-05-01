import type { Metadata } from "next";
import ContactoContent from "@/components/contact/ContactoContent";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Inicie una conversación con Impakto Creative para evaluar su proyecto y definir una dirección clara.",
  alternates: {
    canonical: "/contacto",
  },
  openGraph: {
    url: "/contacto",
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Impakto Creative",
  url: `${siteUrl}/contacto`,
  areaServed: ["AR", "US"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hola@impaktocreative.com",
      availableLanguage: ["es", "en"],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+54 9 11 7842-1357",
      availableLanguage: ["es"],
    },
  ],
};

const contactoBreadcrumbSchema = {
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
      name: "Contacto",
      item: `${siteUrl}/contacto`,
    },
  ],
};

export default function ContactoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactoBreadcrumbSchema) }}
      />
      <ContactoContent />
    </>
  );
}
