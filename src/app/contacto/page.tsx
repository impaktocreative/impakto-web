import type { Metadata } from "next";
import ContactoContent from "@/components/contact/ContactoContent";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Inicie una conversación con Impakto Creative para evaluar su proyecto y definir una dirección clara.",
  alternates: {
    canonical: "/contacto",
  },
};

export default function ContactoPage() {
  return <ContactoContent />;
}
