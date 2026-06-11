import { useEffect, useState } from "react";
import { resolveImg } from "@/lib/image-map";
import { cdnSrc, cdnSrcSet } from "@/lib/cdn-image";

export function HeroSlider({ images, brideName, groomName, date }: { images: string[]; brideName: string; groomName: string; date?: string | null }) {
  const [i, setI] = useState(0);
  const list = images.filter(Boolean);
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI(p => (p + 1) % list.length), 5500);
    return () => clearInterval(t);
  }, [list.length]);

  const renderName = (name: string, base: number) =>
    Array.from(name).map((ch, idx) => (
      <span
        key={idx}
        className="inline-block opacity-0 translate-y-6 blur-sm hero-letter"
        style={{ animationDelay: `${base + idx * 80}ms` }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <section className="relative h-[88vh] min-h-[480px] sm:min-h-[600px] w-full max-w-full overflow-hidden">
      {list.map((src, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}>
          {(() => {
            const raw = resolveImg(src);
            return (
              <img
                src={cdnSrc(raw, { width: 1920, quality: 80 })}
                srcSet={cdnSrcSet(raw, [640, 800, 1080, 1440, 1920, 2560], 80)}
                sizes="100vw"
                alt=""
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={idx === 0 ? "high" : "auto"}
                className={`w-full h-full object-cover ${idx === i ? "hero-kenburns" : ""}`}
              />
            );
          })()}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/35 to-black/55" />
        </div>
      ))}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 max-w-full">
        <p className="font-script text-2xl sm:text-3xl md:text-5xl text-blush mb-3 sm:mb-4 hero-fade" style={{ animationDelay: "150ms" }}>the wedding of</p>
        <h1 className="font-display text-balance leading-tight max-w-full break-words text-[clamp(2.25rem,11vw,6rem)] md:text-8xl">
          <span className="inline-block">{renderName(brideName, 400)}</span>
          <span className="font-script text-gold inline-block mx-2 sm:mx-3 md:mx-5 hero-amp" style={{ animationDelay: `${400 + brideName.length * 80 + 100}ms` }}>&amp;</span>
          <span className="inline-block">{renderName(groomName, 400 + brideName.length * 80 + 350)}</span>
        </h1>
        <div className="mt-8 flex items-center gap-4 hero-fade" style={{ animationDelay: `${400 + (brideName.length + groomName.length) * 80 + 800}ms` }}>
          <span className="h-px w-12 bg-white/60" />
          {date && <p className="text-sm md:text-base uppercase tracking-[0.4em]">{new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}</p>}
          <span className="h-px w-12 bg-white/60" />
        </div>
      </div>
      {list.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {list.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx+1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-white" : "w-4 bg-white/50"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
