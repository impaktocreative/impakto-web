import { Fraunces, Inter } from "next/font/google";

// Titulares. Fraunces es el sustituto que el propio style guide de la
// referencia indica para Gestura. Variable: un solo archivo cubre todos
// los pesos. Sin los ejes SOFT/WONK/opsz, que no usamos y solo sumaban
// bytes al archivo.
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

// Cuerpo, navegación, botones, formularios. Todo lo funcional.
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
