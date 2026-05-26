// Lightweight image CDN helper using Cloudflare's `/cdn-cgi/image/` resizer.
// The site is served behind Cloudflare (lovable.app + custom domains), which
// supports auto AVIF/WebP negotiation via `format=auto` and on-the-fly resizing.
// In dev (localhost) the endpoint is absent, so we pass through the original URL.

const ENABLED = import.meta.env.PROD;

export const DEFAULT_WIDTHS = [400, 640, 800, 1080, 1440, 1920] as const;

function isOptimizable(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:") || src.startsWith("blob:")) return false;
  // Local Vite-bundled assets are already optimized at build time; passing them
  // through Cloudflare would create a same-origin loop. Only transform absolute http(s) URLs.
  return /^https?:\/\//.test(src);
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