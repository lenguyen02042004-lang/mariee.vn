import { Link } from "@tanstack/react-router";
import { SmartImage } from "@/components/SmartImage";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới", photography: "Chụp ảnh cưới", videography: "Quay phim cưới",
  wedding_planner: "Wedding planner", makeup: "Trang điểm cô dâu", attire: "Trang phục cưới",
  flowers: "Hoa cưới", catering: "Ẩm thực", music: "Âm nhạc & live band",
  decor: "Trang trí", invitation: "Thiệp cưới", other: "Dịch vụ khác",
};

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

export function VendorCard({ v, eager = false }: { v: VendorCardData; eager?: boolean }) {
  const cat = CAT_LABEL[v.category] ?? v.category;
  return (
    <Link
      to="/vendors/$slug"
      params={{ slug: v.slug }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/40 shadow-soft hover:shadow-elegant hover:border-gold/50 transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden bg-secondary">
        <SmartImage
          src={v.cover_image}
          alt={v.name}
          width={800}
          widths={[400, 640, 800, 1080]}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          eager={eager}
          priority={eager}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        {/* gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-90" />
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
              Featured
            </span>
          )}
        </div>

        {/* bottom title over image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="font-display text-2xl leading-tight line-clamp-2 drop-shadow-md">{v.name}</h3>
          {v.tagline && (
            <p className="mt-1 text-[13px] text-white/85 line-clamp-1">{v.tagline}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-card">
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground min-w-0">
          {v.city && (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70 shrink-0"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="truncate">{v.city}</span>
            </>
          )}
        </div>
        {v.price_range && (
          <span className="text-[12px] font-medium text-gold tracking-wide whitespace-nowrap">
            {v.price_range}
          </span>
        )}
      </div>
    </Link>
  );
}