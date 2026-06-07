export const SITE_URL = "https://mariee.vn";

/** Build a canonical/og:url for a given pathname. */
export function canonical(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** Ensure an image URL is absolute (required by social crawlers). */
export function absoluteImage(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return `${SITE_URL}${src}`;
  return `${SITE_URL}/${src}`;
}