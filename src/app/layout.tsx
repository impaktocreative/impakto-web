import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impakto Creative | Agencia de Posicionamiento y Crecimiento",
  description: "Impakto Creative ayuda a negocios y marcas a comunicar mejor, verse con más solidez y construir una presencia digital más enfocada.",
  metadataBase: new URL("https://impaktocreative.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased selection:bg-foreground selection:text-primary min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
