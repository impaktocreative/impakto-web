import { Inter } from "next/font/google";

// Una sola familia para todo el sitio.
//
// Los titulares iban en Fraunces, una serif cálida y librera. Funcionaba para
// editorial de revista y quedó corta para un estudio que vende precisión: al
// lado de las esculturas de filamentos, la serif sonaba a otra época.
//
// Inter en display se comporta distinto que en cuerpo: cuerpo grueso, tracking
// muy cerrado y interlineado apretado. La diferencia entre titular y texto la
// hacen el peso y el tamaño, no dos tipografías. Es más difícil de sostener y
// más nítido cuando sale bien.
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
