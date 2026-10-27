import { useEffect, useState } from "react";
import { resolveImg } from "@/lib/image-map";
import { cdnSrc, cdnSrcSet } from "@/lib/cdn-image";
import { Sparkles } from "lucide-react";

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
    <section className="relative h-[85vh] min-h-[600px] sm:h-[95vh] sm:min-h-[700px] w-full max-w-full overflow-hidden bg-black">
      {/* Background Slides with Ken Burns subtle cinematic zoom */}
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
              src={cdnSrc(raw, { width: 1920, quality: 90 })}
              srcSet={cdnSrcSet(raw, [640, 800, 1080, 1440, 1920, 2560], 90)}
              sizes="100vw"
              alt={`${brideName} & ${groomName}`}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={idx === 0 ? "high" : "auto"}
              className={`w-full h-full object-cover object-center ${
                idx === i ? "hero-kenburns scale-105" : "scale-100"
              }`}
            />
            {/* Multi-layered cinematic gradient overlays for dramatic contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/80" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/25 to-black/65 pointer-events-none" />
          </div>
        );
      })}

      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Royal Monogram / Header Badge */}
        <div className="mb-4 sm:mb-6 animate-fade-in flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/70 bg-black/40 backdrop-blur-md text-gold mb-3 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <span className="font-display text-sm tracking-widest font-semibold text-gold">TM &amp; HN</span>
          </div>
          <p className="font-serif uppercase tracking-[0.45em] text-xs sm:text-sm text-gold/95 font-medium flex items-center gap-2">
            <span className="h-px w-6 bg-gold/50" />
            <span>SAVE OUR DATE</span>
            <span className="h-px w-6 bg-gold/50" />
          </p>
        </div>

        {/* Bride & Groom Names in Charm Calligraphy Font */}
        <div className="py-2 animate-scale-in">
          <h1 className="leading-[1.1] sm:leading-[1.15] text-balance">
            <span className="font-script text-[clamp(4rem,14vw,9rem)] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] inline-block px-2 font-normal">
              {brideName}
            </span>
            <span className="font-serif text-[clamp(2.5rem,7vw,5rem)] text-gold inline-block mx-3 sm:mx-6 align-middle drop-shadow-[0_2px_15px_rgba(212,175,55,0.6)] italic font-light">
              &amp;
            </span>
            <span className="font-script text-[clamp(4rem,14vw,9rem)] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] inline-block px-2 font-normal">
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

        {/* Call to Action Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#rsvp-section"
            className="px-8 py-3.5 rounded-full bg-[#54121B] hover:bg-[#6E1A24] border border-gold/50 text-white font-serif text-xs sm:text-sm uppercase tracking-[0.25em] shadow-[0_10px_25px_rgba(84,18,27,0.5)] hover:scale-105 transition-all duration-300"
          >
            Kính Mời Tham Dự &amp; RSVP
          </a>
          <a
            href="#invitation-section"
            className="px-7 py-3.5 rounded-full border border-gold/70 bg-black/40 backdrop-blur-md text-gold hover:bg-gold/20 hover:text-white font-serif text-xs sm:text-sm uppercase tracking-[0.25em] transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles size={14} className="text-gold" />
            <span>Bộ Thiệp Mời Hoàng Gia</span>
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
                idx === i
                  ? "w-10 bg-gold shadow-[0_0_12px_rgba(212,175,55,0.9)]"
                  : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
