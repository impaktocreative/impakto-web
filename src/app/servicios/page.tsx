import type { Metadata } from "next";
import ServiciosContent from "@/components/servicios/ServiciosContent";

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

export default function ServiciosPage() {
  return <ServiciosContent />;
}
