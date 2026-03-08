import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import CustomCursor from "@/components/ui/CustomCursor";
import SmoothScroll from "@/components/layout/SmoothScroll";

export const metadata: Metadata = {
  title: {
    default: "Impakto Creative | Agencia de Posicionamiento y Crecimiento",
    template: "%s | Impakto Creative",
  },
  description:
    "Impakto Creative ayuda a marcas y negocios a ordenar su presencia digital con estrategia, diseño, estructura y comunicación orientada a resultados.",
  metadataBase: new URL("https://impaktocreative.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Impakto Creative | Agencia de Posicionamiento y Crecimiento",
    description:
      "Estrategia, diseño y estructura digital para marcas que buscan una presencia más clara, más sólida y mejor resuelta.",
    url: "https://impaktocreative.com",
    siteName: "Impakto Creative",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impakto Creative",
    description:
      "Agencia de posicionamiento, diseño y estructura digital para marcas con foco en claridad y crecimiento.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-foreground selection:text-primary min-h-screen flex flex-col font-sans text-foreground bg-background">
        <SmoothScroll>
          <CustomCursor />
          <a
            href="#contenido-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:bg-foreground focus:text-background focus:px-4 focus:py-2"
          >
            Ir al contenido principal
          </a>
          <Navbar />
          {children}
          <WhatsAppFloating />
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
