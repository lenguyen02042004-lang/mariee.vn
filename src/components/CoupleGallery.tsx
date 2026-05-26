import { useEffect, useState } from "react";
import { resolveImg } from "@/lib/image-map";
import { SmartImage } from "@/components/SmartImage";
import { cdnSrc } from "@/lib/cdn-image";

export function CoupleGallery({ items }: { items: Array<{ id: string; image_url: string; caption?: string | null }> }) {
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive(i => (i! + 1) % items.length);
      if (e.key === "ArrowLeft") setActive(i => (i! - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [active, items.length]);

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 [column-fill:_balance]">
        {items.map((g, i) => (
          <button
            type="button"
            key={g.id}
            onClick={() => setActive(i)}
            className="group relative mb-3 md:mb-4 block w-full overflow-hidden rounded-lg shadow-soft break-inside-avoid animate-in fade-in duration-700"
            style={{ animationDelay: `${(i % 8) * 60}ms`, animationFillMode: "both" }}
          >
            <SmartImage
              src={g.image_url}
              alt={g.caption ?? ""}
              width={800}
              widths={[400, 640, 800, 1080]}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="w-full h-auto object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {g.caption && (
              <span className="absolute bottom-3 left-3 right-3 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">{g.caption}</span>
            )}
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300" onClick={() => setActive(null)}>
          <button onClick={(e) => { e.stopPropagation(); setActive(null); }} aria-label="Đóng" className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl">×</button>
          <button onClick={(e) => { e.stopPropagation(); setActive((active - 1 + items.length) % items.length); }} className="absolute left-2 md:left-6 text-white/70 hover:text-white text-4xl px-3">‹</button>
          <button onClick={(e) => { e.stopPropagation(); setActive((active + 1) % items.length); }} className="absolute right-2 md:right-6 text-white/70 hover:text-white text-4xl px-3">›</button>
          <img
            src={cdnSrc(resolveImg(items[active].image_url), { width: 1920, quality: 85, fit: "scale-down" })}
            alt=""
            className="max-h-full max-w-full object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
            {active + 1} / {items.length}{items[active].caption && ` — ${items[active].caption}`}
          </div>
        </div>
      )}
    </>
  );
}
