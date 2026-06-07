import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getCoupleBySlug } from "@/lib/couples.functions";
import { resolveImg } from "@/lib/image-map";
import { absoluteImage, canonical } from "@/lib/seo";
import { HeroSlider } from "@/components/HeroSlider";
import { RsvpForm } from "@/components/RsvpForm";
import { Countdown } from "@/components/Countdown";
import { WishWall } from "@/components/WishWall";
import { WeddingShareCard } from "@/components/WeddingShareCard";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
    const desc = c.quote ?? `Đám cưới của ${title}`;
    return {
      meta: [
        { title: `${title} — Mariée Wedding` },
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

function Section({ kicker, title, children, dark }: { kicker: string; title?: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`py-20 md:py-28 ${dark ? "bg-secondary/40" : ""}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="font-script text-3xl text-primary">{kicker}</p>
          {title && <h2 className="font-display text-3xl md:text-5xl mt-2">{title}</h2>}
        </div>
        {children}
      </div>
    </section>
  );
}

function CouplePage() {
  const { couple, gallery, wishes } = Route.useLoaderData();
  const heroImages = [couple.hero_image_1, couple.hero_image_2, couple.hero_image_3].filter(Boolean) as string[];
  const schedule: Array<{ time?: string; title: string; description?: string }> = Array.isArray((couple as any).schedule) ? (couple as any).schedule : [];

  const hasGift = couple.gift_bride_account || couple.gift_groom_account;
  const weddingFuture = couple.wedding_date ? new Date(couple.wedding_date).getTime() > Date.now() : false;
  const hasInvitations = couple.invitation_bride_url || couple.invitation_groom_url;
  const hasParties = couple.bride_party_time || couple.bride_party_venue || couple.groom_party_time || couple.groom_party_venue;
  const ytEmbed = toYouTubeEmbed(couple.youtube_url ?? "");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const nextLightbox = () => setLightbox(p => p === null ? p : (p + 1) % gallery.length);
  const prevLightbox = () => setLightbox(p => p === null ? p : (p - 1 + gallery.length) % gallery.length);

  return (
    <>
      <HeroSlider images={heroImages} brideName={couple.bride_name} groomName={couple.groom_name} date={couple.wedding_date} />

      {weddingFuture && (
        <section className="py-16 md:py-20 -mt-16 md:-mt-24 relative z-20">
          <div className="max-w-3xl mx-auto px-6">
            <Countdown target={couple.wedding_date!} />
          </div>
        </section>
      )}

      {couple.quote && (
        <Section kicker="our promise">
          <blockquote className="font-display text-2xl md:text-4xl italic text-center text-balance leading-snug max-w-3xl mx-auto">"{couple.quote}"</blockquote>
        </Section>
      )}

      {couple.story && (
        <Section kicker="our story" title="Câu chuyện của chúng mình" dark>
          <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-line max-w-3xl mx-auto text-center">{couple.story}</p>
        </Section>
      )}

      {ytEmbed && (
        <Section kicker="save the moment" title="Khoảnh khắc đáng nhớ">
          <div className="aspect-video rounded-lg overflow-hidden shadow-elegant max-w-5xl mx-auto">
            <iframe src={ytEmbed} title="Wedding video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </Section>
      )}

      {schedule.length > 0 && (
        <Section kicker="program" title="Chương trình" dark>
          <div className="max-w-3xl mx-auto space-y-4">
            {schedule.map((s, i) => (
              <div key={i} className="flex gap-6 bg-card rounded-lg p-5 shadow-soft">
                <div className="font-display text-2xl text-primary w-24 shrink-0">{s.time ?? "—"}</div>
                <div>
                  <p className="font-medium text-lg">{s.title}</p>
                  {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(couple.venue_name || couple.ceremony_time || couple.reception_time) && (
        <Section kicker="venue" title={couple.venue_name ?? "Địa điểm tổ chức"}>
          <div className="max-w-2xl mx-auto text-center">
            {couple.venue_address && <p className="text-muted-foreground">{couple.venue_address}</p>}
            {couple.wedding_date && <p className="mt-4 text-lg">{new Date(couple.wedding_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>}
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              {couple.ceremony_time && (
                <div className="bg-secondary/40 rounded-lg p-6">
                  <p className="font-script text-2xl text-primary">Lễ thành hôn</p>
                  <p className="text-xl mt-1">{couple.ceremony_time}</p>
                </div>
              )}
              {couple.reception_time && (
                <div className="bg-secondary/40 rounded-lg p-6">
                  <p className="font-script text-2xl text-primary">Tiệc chiêu đãi</p>
                  <p className="text-xl mt-1">{couple.reception_time}</p>
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {hasParties && (
        <Section kicker="reception" title="Tiệc cưới hai bên" dark>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {(couple.bride_party_time || couple.bride_party_venue || couple.bride_party_address) && (
              <div className="bg-card rounded-lg p-7 shadow-soft border border-border/40 text-center">
                <p className="font-script text-3xl text-primary">Nhà cô dâu</p>
                {couple.bride_party_time && <p className="mt-3 text-lg">{couple.bride_party_time}</p>}
                {couple.bride_party_venue && <p className="mt-1 font-medium">{couple.bride_party_venue}</p>}
                {couple.bride_party_address && <p className="text-sm text-muted-foreground mt-1">{couple.bride_party_address}</p>}
              </div>
            )}
            {(couple.groom_party_time || couple.groom_party_venue || couple.groom_party_address) && (
              <div className="bg-card rounded-lg p-7 shadow-soft border border-border/40 text-center">
                <p className="font-script text-3xl text-primary">Nhà chú rể</p>
                {couple.groom_party_time && <p className="mt-3 text-lg">{couple.groom_party_time}</p>}
                {couple.groom_party_venue && <p className="mt-1 font-medium">{couple.groom_party_venue}</p>}
                {couple.groom_party_address && <p className="text-sm text-muted-foreground mt-1">{couple.groom_party_address}</p>}
              </div>
            )}
          </div>
        </Section>
      )}

      {hasInvitations && (
        <Section kicker="invitation" title="Thiệp cưới gia đình">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {couple.invitation_bride_url && (
              <figure className="text-center">
                <a href={resolveImg(couple.invitation_bride_url)} target="_blank" rel="noopener" className="block group">
                  <img src={resolveImg(couple.invitation_bride_url)} alt="Thiệp nhà cô dâu" loading="lazy" className="w-full rounded-lg shadow-elegant group-hover:scale-[1.02] transition-transform duration-500" />
                </a>
                <figcaption className="font-script text-2xl text-primary mt-4">Thiệp nhà cô dâu</figcaption>
              </figure>
            )}
            {couple.invitation_groom_url && (
              <figure className="text-center">
                <a href={resolveImg(couple.invitation_groom_url)} target="_blank" rel="noopener" className="block group">
                  <img src={resolveImg(couple.invitation_groom_url)} alt="Thiệp nhà chú rể" loading="lazy" className="w-full rounded-lg shadow-elegant group-hover:scale-[1.02] transition-transform duration-500" />
                </a>
                <figcaption className="font-script text-2xl text-primary mt-4">Thiệp nhà chú rể</figcaption>
              </figure>
            )}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section kicker="our gallery" title="Thư viện ảnh cưới" dark>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((g: any, idx: number) => (
              <button type="button" key={g.id} onClick={() => openLightbox(idx)}
                className="group relative aspect-square overflow-hidden rounded-md shadow-soft cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary">
                <img src={resolveImg(g.image_url)} alt={g.caption ?? ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        </Section>
      )}

      {lightbox !== null && gallery[lightbox] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={closeLightbox}>
          <button type="button" onClick={closeLightbox} aria-label="Đóng"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
            <X size={22} />
          </button>
          {gallery.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prevLightbox(); }} aria-label="Trước"
                className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
                <ChevronLeft size={26} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); nextLightbox(); }} aria-label="Sau"
                className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
                <ChevronRight size={26} />
              </button>
            </>
          )}
          <figure className="max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img src={resolveImg(gallery[lightbox].image_url)} alt={gallery[lightbox].caption ?? ""} className="max-w-full max-h-[80vh] object-contain rounded shadow-elegant" />
            {gallery[lightbox].caption && <figcaption className="text-white/80 text-sm">{gallery[lightbox].caption}</figcaption>}
            <p className="text-white/50 text-xs">{lightbox + 1} / {gallery.length}</p>
          </figure>
        </div>
      )}

      {hasGift && (
        <Section kicker="wedding gift" title="Hộp mừng cưới">
          <p className="text-center text-muted-foreground max-w-xl mx-auto -mt-6 mb-10">Sự hiện diện và lời chúc của bạn là món quà ý nghĩa nhất. Nếu muốn gửi mừng cưới, bạn có thể chuyển khoản:</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {couple.gift_bride_account && (
              <div className="bg-card rounded-lg p-6 shadow-soft border border-border/40 text-center">
                <p className="font-script text-2xl text-primary">Cô dâu</p>
                <p className="font-medium mt-2">{couple.gift_bride_holder ?? couple.bride_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{couple.gift_bride_bank}</p>
                <p className="font-display text-xl mt-3 tabular-nums">{couple.gift_bride_account}</p>
              </div>
            )}
            {couple.gift_groom_account && (
              <div className="bg-card rounded-lg p-6 shadow-soft border border-border/40 text-center">
                <p className="font-script text-2xl text-primary">Chú rể</p>
                <p className="font-medium mt-2">{couple.gift_groom_holder ?? couple.groom_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{couple.gift_groom_bank}</p>
                <p className="font-display text-xl mt-3 tabular-nums">{couple.gift_groom_account}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section kicker="wishes" title="Sổ lưu bút" dark>
        <WishWall coupleId={couple.id} wishes={wishes} />
      </Section>

      <Section kicker="share the love" title="Mời thêm bạn bè">
        <div className="max-w-4xl mx-auto">
          <WeddingShareCard couple={couple as any} />
        </div>
      </Section>

      <section className="bg-romance py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="font-script text-3xl text-white">rsvp</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2 text-white">Xác nhận tham dự</h2>
            <p className="mt-3 text-white/90">Sự hiện diện của bạn là món quà tuyệt vời nhất.</p>
          </div>
          <div className="bg-card rounded-lg p-8 md:p-12 shadow-elegant">
            <RsvpForm coupleId={couple.id} />
          </div>
        </div>
      </section>
    </>
  );
}
