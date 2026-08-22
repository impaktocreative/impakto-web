const FALLBACK_SITE_URL = "https://impaktocreative.com";

function withProtocol(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

function stripTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!envUrl) {
    return FALLBACK_SITE_URL;
  }

  return stripTrailingSlash(withProtocol(envUrl));
}

export const siteUrl = getSiteUrl();

/**
 * La imagen de las tarjetas de compartir.
 *
 * Vive acá y no en el layout porque cada página tiene que poder repetirla. En
 * Next, cuando una ruta declara `openGraph`, ese objeto REEMPLAZA al del layout
 * en lugar de fusionarse: si la página no repite `images`, se pierde. Twitter
 * no se veía afectado porque ninguna página lo redefine, así que el sitio
 * compartía bien en Twitter y sin imagen en LinkedIn, Facebook y WhatsApp.
 */
export const imagenCompartir = "/share.jpg";

/** El bloque openGraph de una ruta, ya con la imagen puesta. */
export function openGraphDeRuta(ruta: string) {
  return {
    url: ruta,
    images: [
      {
        url: imagenCompartir,
        width: 1200,
        height: 630,
        alt: "Impakto Creative",
      },
    ],
  };
}
