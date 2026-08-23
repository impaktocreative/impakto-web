import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Los que consultan en vivo para responder. Son los que citan. */
const RECUPERACION = [
  "Googlebot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Applebot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    /**
     * Dos familias, y se tratan distinto.
     *
     * Recuperación: van a buscar en vivo cuando alguien pregunta, y son los que
     * producen la citación. Permitidos.
     *
     * Entrenamiento (CCBot, Google-Extended, Applebot-Extended, Amazonbot,
     * Bytespider): alimentan corpus para modelos futuros, no aportan citación y
     * ceden el contenido de forma permanente. Quedan fuera hasta que haya una
     * instrucción explícita del dueño del sitio: es una decisión de derechos,
     * no técnica. Sin regla propia caen bajo el comodín, que hoy los permite;
     * para excluirlos hace falta agregarles un disallow.
     */
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
      ...RECUPERACION.map((agente) => ({
        userAgent: agente,
        allow: "/",
        disallow: ["/api/", "/admin/"],
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
