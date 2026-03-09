import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ClientLogosCarousel from "@/components/home/ClientLogosCarousel";
import IntroPanel from "@/components/home/IntroPanel";
import ValueProposition from "@/components/home/ValueProposition";
import ServicesOverview from "@/components/home/ServicesOverview";
import PainPoints from "@/components/home/PainPoints";
import Methodology from "@/components/home/Methodology";
import IdealClient from "@/components/home/IdealClient";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import ScrollStage from "@/components/ui/ScrollStage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Agencia estratégica para marcas que necesitan captar mejor, convertir con claridad y sostener crecimiento con estructura digital.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Impakto Creative",
  url: siteUrl,
  email: "hola@impaktocreative.com",
  telephone: ["+54 9 11 7842-1357", "+1 615 282 9799"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ciudad de Buenos Aires",
    addressCountry: "AR",
  },
  description:
    "Agencia de estrategia, comunicación y estructura digital para marcas que buscan una presencia más clara y sólida.",
};

export default function Home() {
  return (
    <main id="contenido-principal" className="flex-grow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Hero />
      <ScrollStage>
        <ClientLogosCarousel />
      </ScrollStage>
      <ScrollStage>
        <IntroPanel />
      </ScrollStage>
      <ScrollStage>
        <ValueProposition />
      </ScrollStage>
      <ScrollStage>
        <ServicesOverview />
      </ScrollStage>
      <ScrollStage>
        <PainPoints />
      </ScrollStage>
      <ScrollStage>
        <Methodology />
      </ScrollStage>
      <ScrollStage>
        <IdealClient />
      </ScrollStage>
      <ScrollStage>
        <FAQ />
      </ScrollStage>
      <ScrollStage>
        <FinalCTA />
      </ScrollStage>
    </main>
  );
}
