// Lightweight image CDN helper using Cloudflare's `/cdn-cgi/image/` resizer.
// The site is served behind Cloudflare (lovable.app + custom domains), which
// supports auto AVIF/WebP negotiation via `format=auto` and on-the-fly resizing.
// In dev (localhost) the endpoint is absent, so we pass through the original URL.

const ENABLED = import.meta.env.PROD;

export const DEFAULT_WIDTHS = [400, 640, 800, 1080, 1440, 1920] as const;

function isOptimizable(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:") || src.startsWith("blob:")) return false;
  // Cloudflare image resizing on lovable.app only proxies same-origin assets.
  // External URLs (e.g. Supabase storage) must be returned unchanged or they 404.
  if (!/^https?:\/\//.test(src)) return false;
  if (typeof window === "undefined") return false;
  try {
    return new URL(src).origin === window.location.origin;
  } catch {
    return false;
  }
}

export type CdnOpts = { width: number; quality?: number; height?: number; fit?: "cover" | "contain" | "scale-down" };

export function cdnSrc(src: string, opts: CdnOpts): string {
  if (!ENABLED || !isOptimizable(src)) return src;
  const { width, quality = 78, height, fit = "cover" } = opts;
  const parts = [`width=${width}`, `quality=${quality}`, `format=auto`, `fit=${fit}`];
  if (height) parts.push(`height=${height}`);
  return `/cdn-cgi/image/${parts.join(",")}/${src}`;
}

export function cdnSrcSet(
  src: string,
  widths: readonly number[] = DEFAULT_WIDTHS,
  quality = 78,
): string | undefined {
  if (!ENABLED || !isOptimizable(src)) return undefined;
  return widths.map((w) => `${cdnSrc(src, { width: w, quality })} ${w}w`).join(", ");
}