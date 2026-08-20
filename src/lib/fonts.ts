import { Instrument_Serif, Inter } from "next/font/google";

// Titulares. Instrument Serif solo tiene un peso; el italic se usa en destacados.
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

// Cuerpo. Variable, cubre todos los pesos sin pedir archivos extra.
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
