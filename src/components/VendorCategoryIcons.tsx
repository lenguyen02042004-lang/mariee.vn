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
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5 pb-2">
      <CategoryChip active={value === "all"} label="Tất cả" Icon={Sparkles} onClick={() => onChange("all")} />
      {VENDOR_CATEGORIES.map(({ slug, label, Icon }) => (
        <CategoryChip
          key={slug}
          active={value === slug}
          label={label}
          Icon={Icon}
          onClick={() => onChange(slug)}
        />
      ))}
    </div>
  );
}

function CategoryChip({
  active,
  label,
  Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group flex flex-col items-center gap-2 cursor-pointer outline-none w-full"
    >
      <span
        className={[
          "relative h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-all duration-300",
          active
            ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.55)] scale-105"
            : "bg-card text-primary ring-1 ring-border/70 group-hover:ring-primary/40 group-hover:-translate-y-0.5 group-hover:shadow-soft",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} />
        {active && (
          <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background" />
        )}
      </span>
      <span
        className={[
          "text-[10.5px] sm:text-[11px] text-center leading-tight tracking-wide transition-colors w-full px-0.5 line-clamp-2",
          active ? "text-primary font-medium" : "text-foreground/70 group-hover:text-primary",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}