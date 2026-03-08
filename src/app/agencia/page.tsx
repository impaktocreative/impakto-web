import type { Metadata } from "next";
import AgenciaContent from "@/components/agencia/AgenciaContent";

export const metadata: Metadata = {
  title: "Agencia",
  description:
    "Conoce al equipo multidisciplinario de Impakto Creative, su trayectoria de más de 20 años y su forma de acompañar marcas con criterio y compromiso.",
  alternates: {
    canonical: "/agencia",
  },
};

export default function AgenciaPage() {
  return <AgenciaContent />;
}
