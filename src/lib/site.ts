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
