import { useEffect, useState } from "react";
import { resolveImg } from "@/lib/image-map";
import { cdnSrc, cdnSrcSet } from "@/lib/cdn-image";
import { Heart } from "lucide-react";

export function HeroSlider({
  images,
  brideName,
  groomName,
  date,
}: {
  images: string[];
  brideName: string;
  groomName: string;
  date?: string | null;
}) {
  const [i, setI] = useState(0);
  const list = images.filter(Boolean);

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length]);

  return (
    <section className="relative h-[82vh] min-h-[580px] sm:h-[92vh] sm:min-h-[660px] w-full max-w-full overflow-hidden bg-black">
      {/* Background Slides with Ken Burns transition */}
      {list.map((src, idx) => {
        const raw = resolveImg(src);
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={cdnSrc(raw, { width: 1920, quality: 85 })}
              srcSet={cdnSrcSet(raw, [640, 800, 1080, 1440, 1920, 2560], 85)}
              sizes="100vw"
              alt={`${brideName} & ${groomName}`}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={idx === 0 ? "high" : "auto"}
              className={`w-full h-full object-cover object-center ${
                idx === i ? "hero-kenburns scale-105" : "scale-100"
              }`}
            />
            {/* Multi-layered cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />
          </div>
        );
      })}

      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Monogram / Header Badge */}
        <div className="mb-4 sm:mb-6 animate-fade-in flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-gold/60 bg-black/20 backdrop-blur-md text-gold mb-3 shadow-soft">
            <Heart size={20} className="fill-gold/20 text-gold animate-pulse" />
          </div>
          <p className="font-serif uppercase tracking-[0.45em] text-xs sm:text-sm text-gold/90 font-medium">
            Save Our Date
          </p>
        </div>

        {/* Bride & Groom Names in Logo Font (Great Vibes cursive) */}
        <div className="py-2 animate-scale-in">
          <h1 className="leading-[1.1] sm:leading-[1.15] text-balance">
            <span className="font-script text-[clamp(3.8rem,13vw,8.5rem)] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] hover:text-blush transition-colors duration-500 inline-block px-2">
              {brideName}
            </span>
            <span className="font-script text-[clamp(2.5rem,8vw,5.5rem)] text-gold inline-block mx-3 sm:mx-6 align-middle drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">
              &amp;
            </span>
            <span className="font-script text-[clamp(3.8rem,13vw,8.5rem)] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] hover:text-blush transition-colors duration-500 inline-block px-2">
              {groomName}
            </span>
          </h1>
        </div>

        {/* Wedding Date in Royal Typography */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4 sm:gap-6 max-w-xl mx-auto animate-fade-in">
          <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
          {date && (
            <p className="font-serif text-sm sm:text-base md:text-lg tracking-[0.35em] uppercase text-white/95 font-medium drop-shadow">
              {new Date(date).toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Floating Call to Action */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#rsvp-section"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-rose-deep text-primary-foreground font-serif text-xs sm:text-sm uppercase tracking-[0.25em] shadow-elegant hover:scale-105 hover:shadow-soft transition-all duration-300"
          >
            Gửi Lời Chúc &amp; RSVP
          </a>
          <a
            href="#story-section"
            className="px-7 py-3.5 rounded-full border border-white/60 bg-white/10 backdrop-blur-sm text-white font-serif text-xs sm:text-sm uppercase tracking-[0.25em] hover:bg-white/20 hover:border-gold transition-all duration-300"
          >
            Câu Chuyện Tình Yêu
          </a>
        </div>
      </div>

      {/* Slide Indicators */}
      {list.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {list.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === i ? "w-10 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
