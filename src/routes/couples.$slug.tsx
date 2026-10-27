import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getCoupleBySlug } from "@/lib/couples.functions";
import { resolveImg } from "@/lib/image-map";
import { absoluteImage, canonical } from "@/lib/seo";
import { HeroSlider } from "@/components/HeroSlider";
import { SmartImage } from "@/components/SmartImage";
import { cdnSrc } from "@/lib/cdn-image";
import { RsvpForm } from "@/components/RsvpForm";
import { Countdown } from "@/components/Countdown";
import { WishWall } from "@/components/WishWall";
import { WeddingShareCard } from "@/components/WeddingShareCard";
import { GiftBoxes } from "@/components/GiftBox";
import { AudioPlayer } from "@/components/AudioPlayer";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Clock, Sparkles } from "lucide-react";

function toYouTubeEmbed(url: string): string {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|\/v\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

export const Route = createFileRoute("/couples/$slug")({
  loader: async ({ params }) => {
    const data = await getCoupleBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  component: CouplePage,
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-muted-foreground">Không tìm thấy cặp đôi này.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
      <div><p className="text-muted-foreground">{error.message}</p></div>
    </div>
  ),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [] };
    const c: any = loaderData.couple;
    const url = canonical(`/couples/${params.slug}`);
    const img = absoluteImage(resolveImg(c.cover_image));
    const title = `${c.bride_name} & ${c.groom_name}`;
    const desc = c.quote ?? `Lễ cưới của ${title} — Mariée`;
    return {
      meta: [
        { title: `${title} — Trang Lễ Cưới Hoàng Gia` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: c.wedding_date ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: `Lễ cưới ${title}`,
          startDate: c.wedding_date,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          image: img ? [img] : undefined,
          description: desc,
          url,
          location: c.venue_name ? {
            "@type": "Place",
            name: c.venue_name,
            address: c.venue_address ?? undefined,
          } : undefined,
        }),
      }] : undefined,
    };
  },
});

function Section({
  kicker,
  title,
  children,
  dark,
  id,
}: {
  kicker: string;
  title?: string;
  children: React.ReactNode;
  dark?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 relative ${dark ? "bg-secondary/30" : "bg-background"}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14 md:mb-16">
          <p className="font-script text-3xl sm:text-4xl text-primary mb-2.5">{kicker}</p>
          {title && (
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground font-medium tracking-tight">
              {title}
            </h2>
          )}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="h-px w-12 bg-gold/50" />
            <Sparkles size={14} className="text-gold" />
            <span className="h-px w-12 bg-gold/50" />
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function CouplePage() {
  const { couple, gallery, wishes } = Route.useLoaderData();
  const heroImages = [couple.hero_image_1, couple.hero_image_2, couple.hero_image_3].filter(Boolean) as string[];
  const schedule: Array<{ time?: string; title: string; description?: string }> = Array.isArray((couple as any).schedule)
    ? (couple as any).schedule
    : [];

  const hasGift =
    couple.gift_bride_account ||
    couple.gift_groom_account ||
    (couple as any).gift_bride_qr_url ||
    (couple as any).gift_groom_qr_url;

  const weddingFuture = couple.wedding_date ? new Date(couple.wedding_date).getTime() > Date.now() : false;
  const hasInvitations = couple.invitation_bride_url || couple.invitation_groom_url;
  const hasParties =
    couple.bride_party_time || couple.bride_party_venue || couple.groom_party_time || couple.groom_party_venue;
  const ytEmbed = toYouTubeEmbed(couple.youtube_url ?? "");

  const [lightbox, setLightbox] = useState<number | null>(null);
  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const nextLightbox = () => setLightbox((p) => (p === null ? p : (p + 1) % gallery.length));
  const prevLightbox = () => setLightbox((p) => (p === null ? p : (p - 1 + gallery.length) % gallery.length));

  return (
    <div className="relative">
      {/* Background Wedding Music Player */}
      <AudioPlayer />

      {/* Hero Section with Script Names */}
      <HeroSlider
        images={heroImages}
        brideName={couple.bride_name}
        groomName={couple.groom_name}
        date={couple.wedding_date}
      />

      {/* Countdown Timer */}
      {weddingFuture && (
        <section className="py-8 md:py-12 -mt-16 sm:-mt-20 md:-mt-24 relative z-30">
          <div className="max-w-3xl mx-auto px-6">
            <Countdown target={couple.wedding_date!} />
          </div>
        </section>
      )}

      {/* Romantic Quote */}
      {couple.quote && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/15 to-background text-center px-6">
          <div className="max-w-3xl mx-auto">
            <span className="font-script text-4xl sm:text-5xl text-gold/70 block mb-3">“</span>
            <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl italic text-foreground/90 leading-snug">
              {couple.quote}
            </blockquote>
            <p className="font-script text-2xl text-primary mt-6">
              — {couple.bride_name} &amp; {couple.groom_name}
            </p>
          </div>
        </section>
      )}

      {/* Love Story Section */}
      {couple.story && (
        <Section id="story-section" kicker="our journey" title="Câu chuyện của chúng mình" dark>
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/90 rounded-3xl p-8 sm:p-14 border border-gold/25 shadow-elegant relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-gold/15 to-transparent rounded-bl-full pointer-events-none" />
              <p className="text-base sm:text-lg leading-relaxed text-foreground/85 whitespace-pre-line text-center font-serif">
                {couple.story}
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Event Details: Ceremony & Reception */}
      {(couple.venue_name || couple.ceremony_time || couple.reception_time) && (
        <Section kicker="celebration" title="Thông tin tiệc cưới">
          <div className="max-w-3xl mx-auto text-center">
            {couple.venue_name && (
              <h3 className="font-display text-2xl sm:text-3xl text-primary font-medium">{couple.venue_name}</h3>
            )}
            {couple.venue_address && (
              <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5 text-sm sm:text-base">
                <MapPin size={16} className="text-primary shrink-0" />
                {couple.venue_address}
              </p>
            )}

            {couple.wedding_date && (
              <p className="mt-4 text-base sm:text-lg font-serif font-medium text-foreground/90 flex items-center justify-center gap-2">
                <Calendar size={18} className="text-gold" />
                {new Date(couple.wedding_date).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              {couple.ceremony_time && (
                <div className="bg-gradient-to-br from-card to-secondary/30 rounded-2xl p-7 border border-gold/30 shadow-soft">
                  <Clock size={20} className="text-gold mx-auto mb-2" />
                  <p className="font-script text-3xl text-primary">Lễ thành hôn</p>
                  <p className="font-display text-2xl mt-2 text-foreground/90 font-medium">{couple.ceremony_time}</p>
                </div>
              )}
              {couple.reception_time && (
                <div className="bg-gradient-to-br from-card to-secondary/30 rounded-2xl p-7 border border-gold/30 shadow-soft">
                  <Sparkles size={20} className="text-gold mx-auto mb-2" />
                  <p className="font-script text-3xl text-primary">Tiệc chiêu đãi</p>
                  <p className="font-display text-2xl mt-2 text-foreground/90 font-medium">{couple.reception_time}</p>
                </div>
              )}
            </div>

            {couple.venue_address && (
              <div className="mt-8">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    couple.venue_name ? `${couple.venue_name}, ${couple.venue_address}` : couple.venue_address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/40 bg-card hover:bg-primary/5 text-primary text-xs uppercase tracking-widest transition-all shadow-sm"
                >
                  <MapPin size={14} /> Chỉ đường trên Google Maps
                </a>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Reception Details: Two Families */}
      {hasParties && (
        <Section kicker="reception" title="Lễ gia tiên hai họ" dark>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {(couple.bride_party_time || couple.bride_party_venue || couple.bride_party_address) && (
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-gold/25 text-center relative overflow-hidden">
                <div className="w-12 h-1 bg-primary/60 mx-auto mb-4 rounded-full" />
                <p className="font-script text-4xl text-primary">Nhà cô dâu</p>
                <div className="text-xs uppercase tracking-[0.2em] text-gold mt-1">Lễ Vu Quy</div>
                {couple.bride_party_time && (
                  <p className="mt-4 font-display text-xl text-foreground font-medium">{couple.bride_party_time}</p>
                )}
                {couple.bride_party_venue && (
                  <p className="mt-1 text-base text-foreground/80">{couple.bride_party_venue}</p>
                )}
                {couple.bride_party_address && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {couple.bride_party_address}
                  </p>
                )}
              </div>
            )}
            {(couple.groom_party_time || couple.groom_party_venue || couple.groom_party_address) && (
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-gold/25 text-center relative overflow-hidden">
                <div className="w-12 h-1 bg-primary/60 mx-auto mb-4 rounded-full" />
                <p className="font-script text-4xl text-primary">Nhà chú rể</p>
                <div className="text-xs uppercase tracking-[0.2em] text-gold mt-1">Lễ Tân Hôn</div>
                {couple.groom_party_time && (
                  <p className="mt-4 font-display text-xl text-foreground font-medium">{couple.groom_party_time}</p>
                )}
                {couple.groom_party_venue && (
                  <p className="mt-1 text-base text-foreground/80">{couple.groom_party_venue}</p>
                )}
                {couple.groom_party_address && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {couple.groom_party_address}
                  </p>
                )}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Program Timeline */}
      {schedule.length > 0 && (
        <Section kicker="program" title="Chương trình ngày cưới">
          <div className="max-w-2xl mx-auto space-y-4">
            {schedule.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-5 sm:gap-6 bg-card rounded-2xl p-5 sm:p-6 shadow-soft border border-border/50 hover:border-gold/50 transition-colors"
              >
                <div className="font-display text-2xl sm:text-3xl text-primary font-semibold w-20 shrink-0 pt-0.5">
                  {s.time ?? "—"}
                </div>
                <div className="border-l border-border/60 pl-5">
                  <p className="font-serif text-lg font-medium text-foreground">{s.title}</p>
                  {s.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Dress Code Palette Section (Luxury touch for high-end weddings) */}
      <Section kicker="dress code" title="Gợi ý trang phục" dark>
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Để cùng nhau tạo nên những khung hình kỷ niệm hài hòa và trọn vẹn nhất, quý khách có thể ưu tiên lựa chọn trang phục theo bảng màu gợi ý dưới đây:
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md border-2 border-white ring-1 ring-border" style={{ backgroundColor: "#D4AF37" }} />
              <span className="text-xs text-foreground/80 font-serif">Champagne</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md border-2 border-white ring-1 ring-border" style={{ backgroundColor: "#E8C5C8" }} />
              <span className="text-xs text-foreground/80 font-serif">Dusty Rose</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md border-2 border-white ring-1 ring-border" style={{ backgroundColor: "#F7EFE9" }} />
              <span className="text-xs text-foreground/80 font-serif">Warm Ivory</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md border-2 border-white ring-1 ring-border" style={{ backgroundColor: "#7A1C2C" }} />
              <span className="text-xs text-foreground/80 font-serif">Burgundy</span>
            </div>
          </div>
        </div>
      </Section>

      {/* YouTube Wedding Teaser Video */}
      {ytEmbed && (
        <Section kicker="moments" title="Thước phim kỷ niệm">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-elegant max-w-4xl mx-auto border-2 border-gold/30">
            <iframe
              src={ytEmbed}
              title="Wedding video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Section>
      )}

      {/* Invitations preview */}
      {hasInvitations && (
        <Section kicker="invitation" title="Thiệp mời trân trọng" dark>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {couple.invitation_bride_url && (
              <figure className="text-center group">
                <a href={resolveImg(couple.invitation_bride_url)} target="_blank" rel="noopener" className="block">
                  <SmartImage
                    src={couple.invitation_bride_url}
                    alt="Thiệp nhà cô dâu"
                    width={800}
                    widths={[400, 640, 800, 1080]}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="w-full rounded-2xl shadow-elegant border border-gold/30 group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </a>
                <figcaption className="font-script text-3xl text-primary mt-4">Thiệp nhà cô dâu</figcaption>
              </figure>
            )}
            {couple.invitation_groom_url && (
              <figure className="text-center group">
                <a href={resolveImg(couple.invitation_groom_url)} target="_blank" rel="noopener" className="block">
                  <SmartImage
                    src={couple.invitation_groom_url}
                    alt="Thiệp nhà chú rể"
                    width={800}
                    widths={[400, 640, 800, 1080]}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="w-full rounded-2xl shadow-elegant border border-gold/30 group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </a>
                <figcaption className="font-script text-3xl text-primary mt-4">Thiệp nhà chú rể</figcaption>
              </figure>
            )}
          </div>
        </Section>
      )}

      {/* Gallery / Lookbook */}
      {gallery.length > 0 && (
        <Section kicker="our gallery" title="Bộ sưu tập khoảnh khắc">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {gallery.map((g: any, idx: number) => (
              <button
                type="button"
                key={g.id}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-soft cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-gold border border-border/40"
              >
                <SmartImage
                  src={g.image_url}
                  alt={g.caption ?? ""}
                  width={800}
                  widths={[400, 640, 800, 1080]}
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Sparkles size={24} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Lightbox for Gallery */}
      {lightbox !== null && gallery[lightbox] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Đóng"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={22} />
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                aria-label="Trước"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                aria-label="Sau"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <figure
            className="max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={cdnSrc(resolveImg(gallery[lightbox].image_url), {
                width: 1920,
                quality: 85,
                fit: "scale-down",
              })}
              alt={gallery[lightbox].caption ?? ""}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-elegant"
            />
            {gallery[lightbox].caption && (
              <figcaption className="text-white/80 text-sm font-serif italic">
                {gallery[lightbox].caption}
              </figcaption>
            )}
            <p className="text-white/50 text-xs">
              {lightbox + 1} / {gallery.length}
            </p>
          </figure>
        </div>
      )}

      {/* Gift Box / Mừng Cưới */}
      {hasGift && (
        <Section kicker="wedding gift" title="Hộp mừng duyên" dark>
          <p className="text-center text-muted-foreground max-w-xl mx-auto -mt-6 mb-10 text-sm sm:text-base leading-relaxed">
            Sự hiện diện và lời chúc của bạn là món quà ý nghĩa nhất. Nếu muốn gửi mừng cưới, bạn có thể nhấn vào hộp quà bên dưới để xem thông tin chuyển khoản.
          </p>
          <GiftBoxes
            bride={{
              label: `Cô dâu ${couple.bride_name}`,
              holder: couple.gift_bride_holder ?? couple.bride_name,
              bank: couple.gift_bride_bank,
              account: couple.gift_bride_account,
              qrUrl: (couple as any).gift_bride_qr_url,
            }}
            groom={{
              label: `Chú rể ${couple.groom_name}`,
              holder: couple.gift_groom_holder ?? couple.groom_name,
              bank: couple.gift_groom_bank,
              account: couple.gift_groom_account,
              qrUrl: (couple as any).gift_groom_qr_url,
            }}
          />
        </Section>
      )}

      {/* Wish Wall / Sổ Ký Tên */}
      <Section kicker="blessings" title="Sổ lưu bút chúc phúc">
        <WishWall coupleId={couple.id} wishes={wishes} />
      </Section>

      {/* Share with Friends */}
      <Section kicker="share the love" title="Mời thêm bạn bè" dark>
        <div className="max-w-4xl mx-auto">
          <WeddingShareCard couple={couple as any} />
        </div>
      </Section>

      {/* RSVP Section */}
      <section id="rsvp-section" className="py-24 bg-gradient-to-b from-secondary/40 via-background to-secondary/30 relative">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="font-script text-4xl text-primary mb-2">r.s.v.p</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground font-medium">
              Xác nhận tham dự
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              Để ban tổ chức chuẩn bị chu đáo nhất, xin quý khách vui lòng phản hồi trước ngày cưới.
            </p>
          </div>
          <div className="bg-card rounded-3xl p-8 sm:p-12 shadow-elegant border border-gold/30">
            <RsvpForm coupleId={couple.id} />
          </div>
        </div>
      </section>
    </div>
  );
}
