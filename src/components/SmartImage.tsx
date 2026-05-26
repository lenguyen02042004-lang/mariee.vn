import { resolveImg } from "@/lib/image-map";
import { cdnSrc, cdnSrcSet, DEFAULT_WIDTHS } from "@/lib/cdn-image";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "loading" | "decoding"> & {
  src?: string | null;
  /** Largest expected rendered width in CSS px; used as the `src` fallback width. */
  width?: number;
  sizes?: string;
  /** Available widths to generate in the srcset. */
  widths?: readonly number[];
  quality?: number;
  alt: string;
  eager?: boolean;
  /** Hint LCP element for the browser. */
  priority?: boolean;
};

/**
 * Responsive image element with Cloudflare CDN auto-format (AVIF/WebP) + width-based srcset.
 * Falls back gracefully for local bundled assets and in dev.
 */
export function SmartImage({
  src,
  width = 1080,
  sizes = "100vw",
  widths = DEFAULT_WIDTHS,
  quality = 78,
  alt,
  eager,
  priority,
  className,
  ...rest
}: Props) {
  const resolved = resolveImg(src ?? "");
  if (!resolved) return null;
  const fallback = cdnSrc(resolved, { width, quality });
  const srcSet = cdnSrcSet(resolved, widths, quality);
  return (
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={eager || priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      {...rest}
    />
  );
}