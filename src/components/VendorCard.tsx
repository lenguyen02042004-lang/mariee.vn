import { Link } from "@tanstack/react-router";
import { SmartImage } from "@/components/SmartImage";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới", photography: "Chụp ảnh cưới", videography: "Quay phim cưới",
  wedding_planner: "Wedding planner", makeup: "Trang điểm cô dâu", attire: "Trang phục cưới",
  flowers: "Hoa cưới", catering: "Ẩm thực", music: "Âm nhạc & live band",
  decor: "Trang trí", invitation: "Thiệp cưới", other: "Dịch vụ khác",
};

// Rút gọn "Từ 15.000.000đ / album" → "Từ 15 triệu" để bớt cảm giác "sàn TMĐT"
function shortenPrice(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.replace(/(\d{1,3}(?:[.,]\d{3})+|\d{4,})\s*(?:đ|VND|vnđ)?/gi, (_m, num: string) => {
    const digits = parseInt(num.replace(/[.,]/g, ""), 10);
    if (!Number.isFinite(digits)) return _m;
    if (digits >= 1_000_000_000) return `${(digits / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
    if (digits >= 1_000_000) return `${Math.round(digits / 1_000_000)} triệu`;
    if (digits >= 1_000) return `${Math.round(digits / 1_000)}K`;
    return String(digits);
  }).replace(/\s*\/\s*[^\s]+.*$/, "");
}

export type VendorCardData = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline?: string | null;
  cover_image?: string | null;
  city?: string | null;
  price_range?: string | null;
  is_featured?: boolean | null;
  plan_id?: string | null;
};

export function VendorCard({ v, eager = false, featured = false }: { v: VendorCardData; eager?: boolean; featured?: boolean }) {
  const cat = CAT_LABEL[v.category] ?? v.category;
  const price = shortenPrice(v.price_range);
  return (
    <Link
      to="/vendors/$slug"
      params={{ slug: v.slug }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/40 shadow-soft hover:shadow-elegant hover:border-gold/50 transition-all duration-500 hover:-translate-y-2"
    >
      <div className={`relative ${featured ? "aspect-[16/10]" : "aspect-[4/5]"} overflow-hidden bg-secondary`}>
        <SmartImage
          src={v.cover_image}
          alt={v.name}
          width={featured ? 1600 : 800}
          widths={featured ? [800, 1080, 1440, 1920] : [400, 640, 800, 1080]}
          sizes={featured ? "(min-width: 1024px) 100vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
          eager={eager}
          priority={eager}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        {/* gradient veil — đậm hơn để tên vendor luôn nổi bật */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
        {/* gold corner accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md text-foreground/80 border border-white/40 shadow-sm">
            {cat}
          </span>
          {v.is_featured && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-gradient-to-r from-gold to-gold/70 text-gold-foreground shadow-md flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.39 7.36H22l-6.19 4.5L18.18 22 12 17.27 5.82 22l2.37-8.14L2 9.36h7.61z"/></svg>
              Top Vendor
            </span>
          )}
        </div>

        {/* bottom title + meta over image */}
        <div className={`absolute bottom-0 left-0 right-0 p-5 ${featured ? "sm:p-8" : ""} text-white`}>
          <h3 className={`font-display ${featured ? "text-3xl sm:text-4xl" : "text-2xl"} leading-tight line-clamp-2 drop-shadow-md`}>{v.name}</h3>
          {v.tagline && (
            <p className={`mt-1.5 ${featured ? "text-sm sm:text-base" : "text-[13px]"} text-white/85 line-clamp-1`}>{v.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/90">
            {v.city && (
              <span className="inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {v.city}
              </span>
            )}
            {v.is_featured && (
              <span className="inline-flex items-center gap-1 text-gold">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Đối tác xác thực
              </span>
            )}
            {price && (
              <span className="ml-auto inline-flex items-center font-medium tracking-wide text-white/95">
                {price}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}