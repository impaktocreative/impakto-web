import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { siteUrl } from "@/lib/site";

const siteName = "Impakto Creative";
const defaultTitle = `${siteName} | Agencia de Posicionamiento y Crecimiento`;
const defaultDescription =
  "Impakto Creative ayuda a marcas y negocios a ordenar su presencia digital con estrategia, diseño, estructura y comunicación orientada a resultados.";
const shareImage = "/share.jpg";

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: "%s | Impakto Creative",
  },
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  icons: {
    icon: "/logos/icono.svg",
    shortcut: "/logos/icono.svg",
  },
  category: "marketing",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: shareImage,
        width: 1200,
        height: 630,
        alt: "Impakto Creative",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [shareImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
