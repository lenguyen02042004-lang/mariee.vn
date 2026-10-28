import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { resolveImg } from "@/lib/image-map";
import { cdnSrc, cdnSrcSet } from "@/lib/cdn-image";
import heroFallback from "@/assets/hero-wedding-1.jpg";

export type HeroSlide = {
  image_url?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
};

function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image_url: "/assets/hero-luxury-couple.jpg",
    eyebrow: "la vie est belle",
    title: "Lưu giữ ngày trọng đại bằng một câu chuyện riêng",
    subtitle:
      "Mariée tạo thiệp cưới online và website cưới sang trọng, đẳng cấp dành riêng cho mỗi cặp đôi — và kết nối bạn với những nhà cung cấp dịch vụ tinh tế nhất.",
    cta_label: "Tạo thiệp cưới của bạn",
    cta_href: "/gui-thong-tin",
  },
  {
    image_url: "/assets/hero-wedding-1.jpg",
    eyebrow: "timeless romance",
    title: "Thiết kế thiệp cưới tinh tế & cá nhân hóa trọn vẹn",
    subtitle:
      "Giao diện chuẩn editorial với bản đồ lễ cưới, bộ sưu tập ảnh cưới chất lượng cao và hộp mừng cưới tiện lợi cho khách mời.",
    cta_label: "Xem mẫu thiệp cưới",
    cta_href: "/couples/demo",
  },
  {
    image_url: "/assets/hero-wedding-2.jpg",
    eyebrow: "celebrate your love",
    title: "Quản lý khách mời & xác nhận tham dự thông minh",
    subtitle:
      "Đồng bộ danh sách khách tham dự tự động vào Google Sheets, nhận thông báo tức thời và gửi lời cảm ơn trân trọng.",
    cta_label: "Khám phá ngay",
    cta_href: "/for-couples",
  },
];

export function HomeHero({
  slides,
  youtubeUrl,
}: {
  slides?: HeroSlide[] | null;
  youtubeUrl?: string | null;
}) {
  const ytId = youtubeId(youtubeUrl);
  const list = (slides && slides.length > 0 ? slides : DEFAULT_SLIDES).slice(0, 3);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (ytId || list.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [ytId, list.length]);

  if (ytId) {
    return (
      <section className="relative h-[72vh] min-h-[480px] sm:h-[88vh] sm:min-h-[600px] w-full max-w-full overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1&rel=0`}
          title="Hero video"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />
        <HeroOverlay slide={list[0]} />
      </section>
    );
  }

  return (
    <section className="relative h-[72vh] min-h-[480px] sm:h-[88vh] sm:min-h-[600px] w-full max-w-full overflow-hidden">
      {list.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
        >
          {(() => {
            const raw = s.image_url ? resolveImg(s.image_url) : heroFallback;
            return (
              <img
                src={cdnSrc(raw, { width: 1920, quality: 80 })}
                srcSet={cdnSrcSet(raw, [800, 1080, 1440, 1920, 2560], 80)}
                sizes="100vw"
                alt={s.title ?? "Wedding"}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "auto"}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            );
          })()}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />
        </div>
      ))}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-20 md:pb-28">
        <HeroOverlay slide={list[idx]} />
      </div>

      {list.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-8" : "bg-white/50 w-4 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroOverlay({ slide }: { slide: HeroSlide }) {
  return (
    <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
      {slide.eyebrow && (
        <p className="font-script text-3xl md:text-5xl text-blush drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
          {slide.eyebrow}
        </p>
      )}
      {slide.title && (
        <h1 className="mt-4 font-display text-4xl md:text-6xl lg:text-7xl text-balance leading-[1.05] drop-shadow-[0_3px_16px_rgba(0,0,0,0.6)]">
          {slide.title}
        </h1>
      )}
      {slide.subtitle && (
        <p className="mt-6 text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
          {slide.subtitle}
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        {slide.cta_label && slide.cta_href ? (
          <a
            href={slide.cta_href}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm shadow-elegant hover:bg-rose-deep transition"
          >
            {slide.cta_label}
          </a>
        ) : (
          <Link
            to="/register"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm shadow-elegant hover:bg-rose-deep transition"
          >
            Tạo trang cưới của bạn
          </Link>
        )}
        <Link
          to="/vendors"
          className="px-8 py-4 border border-white/60 rounded-md uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition"
        >
          Xem nhà cung cấp
        </Link>
      </div>
    </div>
  );
}