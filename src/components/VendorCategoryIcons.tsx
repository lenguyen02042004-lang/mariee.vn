import { Link } from "@tanstack/react-router";
import {
  Building2, Camera, Video, ClipboardList, Sparkles, Shirt,
  Flower2, UtensilsCrossed, Music, PartyPopper, Mail, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export const VENDOR_CATEGORIES: { slug: string; label: string; Icon: LucideIcon }[] = [
  { slug: "venue", label: "Trung tâm tiệc cưới", Icon: Building2 },
  { slug: "photography", label: "Chụp ảnh cưới", Icon: Camera },
  { slug: "videography", label: "Quay phim cưới", Icon: Video },
  { slug: "wedding_planner", label: "Wedding planner", Icon: ClipboardList },
  { slug: "makeup", label: "Trang điểm cô dâu", Icon: Sparkles },
  { slug: "attire", label: "Trang phục cưới", Icon: Shirt },
  { slug: "flowers", label: "Hoa cưới", Icon: Flower2 },
  { slug: "catering", label: "Ẩm thực", Icon: UtensilsCrossed },
  { slug: "music", label: "Âm nhạc & live band", Icon: Music },
  { slug: "decor", label: "Trang trí", Icon: PartyPopper },
  { slug: "invitation", label: "Thiệp cưới", Icon: Mail },
  { slug: "other", label: "Dịch vụ khác", Icon: MoreHorizontal },
];

export function VendorCategoryGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
      {VENDOR_CATEGORIES.map(({ slug, label, Icon }) => (
        <Link
          key={slug}
          to="/vendors"
          search={{ cat: slug } as any}
          className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/60 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-xs text-center text-foreground/80 group-hover:text-primary leading-tight">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function VendorCategoryChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border min-w-[84px] transition cursor-pointer ${
          value === "all"
            ? "bg-primary text-primary-foreground border-primary shadow-soft"
            : "bg-card border-border hover:border-primary/60"
        }`}
      >
        <span className="h-8 w-8 rounded-full bg-background/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-[11px]">Tất cả</span>
      </button>
      {VENDOR_CATEGORIES.map(({ slug, label, Icon }) => {
        const active = value === slug;
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onChange(slug)}
            className={`shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border min-w-[84px] transition cursor-pointer ${
              active
                ? "bg-primary text-primary-foreground border-primary shadow-soft"
                : "bg-card border-border hover:border-primary/60"
            }`}
          >
            <span className={`h-8 w-8 rounded-full flex items-center justify-center ${active ? "bg-background/20" : "bg-primary/10 text-primary"}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] text-center leading-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}