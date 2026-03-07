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

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Impakto Creative",
  url: "https://impaktocreative.com",
  email: "hola@impaktocreative.com",
  description:
    "Agencia de estrategia, comunicacion y estructura digital para marcas que buscan una presencia mas clara y solida.",
};

export default function Home() {
  return (
    <main id="contenido-principal" className="flex-grow">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Hero />
      <ClientLogosCarousel />
      <IntroPanel />
      <ValueProposition />
      <ServicesOverview />
      <PainPoints />
      <Methodology />
      <IdealClient />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
