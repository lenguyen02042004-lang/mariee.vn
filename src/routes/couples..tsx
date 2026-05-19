import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCoupleBySlug } from "@/lib/couples.functions";
import { resolveImg } from "@/lib/image-map";
import { HeroSlider } from "@/components/HeroSlider";
import { RsvpForm } from "@/components/RsvpForm";
import { Countdown } from "@/components/Countdown";
import { WishWall } from "@/components/WishWall";
import { CoupleGallery } from "@/components/CoupleGallery";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export const Route = createFileRoute("/couples/")({
  loader: async ({ params }) => {
    const data = await getCoupleBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  component: CouplePage,
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground">Không tìm thấy cặp đôi này.</p></div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-6"><p className="text-muted-foreground">{error.message}</p></div>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.couple.bride_name} & ${loaderData.couple.groom_name} — Mariée Wedding` },
      { name: "description", content: loaderData.couple.quote ?? `Đám cưới của ${loaderData.couple.bride_name} & ${loaderData.couple.groom_name}` },
      { property: "og:title", content: `${loaderData.couple.bride_name} & ${loaderData.couple.groom_name}` },
      { property: "og:description", content: loaderData.couple.quote ?? "" },
      { property: "og:image", content: resolveImg(loaderData.couple.cover_image) },
    ] : [],
  }),
});

function Section({ kicker, title, children, dark }: { kicker: string; title?: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`py-20 md:py-28 ${dark ? "bg-secondary/40" : ""}`}>
      <div className="max-w-6xl mx-auto px-6">
        <RevealOnScroll className="text-center mb-12">
          <p className="font-script text-3xl text-primary">{kicker}</p>
          {title && <h2 className="font-display text-3xl md:text-5xl mt-2">{title}</h2>}
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </RevealOnScroll>
        <RevealOnScroll delay={120}>{children}</RevealOnScroll>
      </div>
    </section>
  );
}

function PartyCard({ kicker, time, venue, address }: { kicker: string; time?: string | null; venue?: string | null; address?: string | null }) {
  if (!time && !venue && !address) return null;
  return (
    <div className="relative bg-card rounded-xl p-8 shadow-elegant border border-border/40 text-center overflow-hidden">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <p className="font-script text-3xl text-primary">{kicker}</p>
      {time && <p className="mt-3 text-lg font-medium">{time}</p>}
      {venue && <p className="mt-2 font-display text-xl">{venue}</p>}
      {address && <p className="mt-2 text-sm text-muted-foreground">{address}</p>}
    </div>
  );
}

function CouplePage() {
  const { couple, gallery, wishes } = Route.useLoaderData();
  const c: any = couple;
  const heroImages = [c.hero_image_1, c.hero_image_2, c.hero_image_3].filter(Boolean) as string[];
  const schedule: Array<{ time?: string; title: string; description?: string }> = Array.isArray(c.schedule) ? c.schedule : [];
  const hasGift = c.gift_bride_account || c.gift_groom_account;
  const hasParty = c.bride_party_time || c.bride_party_venue || c.groom_party_time || c.groom_party_venue;
  const hasInvitation = c.invitation_bride_url || c.invitation_groom_url;
  const weddingFuture = c.wedding_date ? new Date(c.wedding_date).getTime() > Date.now() : false;

  return (
    <>
      <HeroSlider images={heroImages} brideName={c.bride_name} groomName={c.groom_name} date={c.wedding_date} />

      {weddingFuture && (
        <section className="py-16 md:py-20 -mt-16 md:-mt-24 relative z-20">
          <div className="max-w-3xl mx-auto px-6">
            <RevealOnScroll><Countdown target={c.wedding_date!} /></RevealOnScroll>
          </div>
        </section>
      )}

      {c.quote && (
        <Section kicker="our promise">
          <blockquote className="font-display text-2xl md:text-4xl italic text-center text-balance leading-snug max-w-3xl mx-auto">"{c.quote}"</blockquote>
        </Section>
      )}

      {c.story && (
        <Section kicker="our story" title="Câu chuyện của chúng mình" dark>
          <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-line max-w-3xl mx-auto text-center">{c.story}</p>
        </Section>
      )}

      {c.youtube_url && (
        <Section kicker="save the moment" title="Khoảnh khắc đáng nhớ">
          <div className="aspect-video rounded-lg overflow-hidden shadow-elegant max-w-5xl mx-auto ring-1 ring-border/40">
            <iframe src={c.youtube_url} title="Wedding video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </Section>
      )}

      {schedule.length > 0 && (
        <Section kicker="program" title="Chương trình" dark>
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-[3.25rem] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent hidden md:block" />
            <div className="space-y-4">
              {schedule.map((s, i) => (
                <div key={i} className="flex gap-6 bg-card rounded-lg p-5 shadow-soft hover:shadow-elegant transition-shadow duration-500">
                  <div className="font-display text-2xl text-primary w-24 shrink-0 tabular-nums">{s.time ?? "—"}</div>
                  <div>
                    <p className="font-medium text-lg">{s.title}</p>
                    {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {hasParty && (
        <Section kicker="reception" title="Tiệc cưới hai bên">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <PartyCard kicker="Tiệc nhà cô dâu" time={c.bride_party_time} venue={c.bride_party_venue} address={c.bride_party_address} />
            <PartyCard kicker="Tiệc nhà chú rể" time={c.groom_party_time} venue={c.groom_party_venue} address={c.groom_party_address} />
          </div>
        </Section>
      )}

      {(c.venue_name || c.ceremony_time || c.reception_time) && (
        <Section kicker="venue" title={c.venue_name ?? "Địa điểm tổ chức"} dark>
          <div className="max-w-2xl mx-auto text-center">
            {c.venue_address && <p className="text-muted-foreground">{c.venue_address}</p>}
            {c.wedding_date && <p className="mt-4 text-lg">{new Date(c.wedding_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>}
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              {c.ceremony_time && (<div className="bg-card rounded-lg p-6 shadow-soft"><p className="font-script text-2xl text-primary">Lễ thành hôn</p><p className="text-xl mt-1">{c.ceremony_time}</p></div>)}
              {c.reception_time && (<div className="bg-card rounded-lg p-6 shadow-soft"><p className="font-script text-2xl text-primary">Tiệc chiêu đãi</p><p className="text-xl mt-1">{c.reception_time}</p></div>)}
            </div>
          </div>
        </Section>
      )}

      {hasInvitation && (
        <Section kicker="invitation" title="Thiệp mời">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {c.invitation_bride_url && (
              <div className="text-center">
                <p className="font-script text-2xl text-primary mb-3">Thiệp nhà cô dâu</p>
                <a href={c.invitation_bride_url} target="_blank" rel="noopener" className="block group rounded-lg overflow-hidden shadow-elegant bg-white">
                  <img src={c.invitation_bride_url} alt="Thiệp nhà cô dâu" loading="lazy" className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-700" />
                </a>
                <a href={c.invitation_bride_url} download className="mt-3 inline-block text-sm text-primary underline">Tải về</a>
              </div>
            )}
            {c.invitation_groom_url && (
              <div className="text-center">
                <p className="font-script text-2xl text-primary mb-3">Thiệp nhà chú rể</p>
                <a href={c.invitation_groom_url} target="_blank" rel="noopener" className="block group rounded-lg overflow-hidden shadow-elegant bg-white">
                  <img src={c.invitation_groom_url} alt="Thiệp nhà chú rể" loading="lazy" className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-700" />
                </a>
                <a href={c.invitation_groom_url} download className="mt-3 inline-block text-sm text-primary underline">Tải về</a>
              </div>
            )}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section kicker="our gallery" title="Thư viện ảnh cưới" dark>
          <CoupleGallery items={gallery as any} />
        </Section>
      )}

      {hasGift && (
        <Section kicker="wedding gift" title="Hộp mừng cưới">
          <p className="text-center text-muted-foreground max-w-xl mx-auto -mt-6 mb-10">Sự hiện diện và lời chúc của bạn là món quà ý nghĩa nhất. Nếu muốn gửi mừng cưới, bạn có thể chuyển khoản:</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {c.gift_bride_account && (
              <div className="bg-card rounded-lg p-6 shadow-soft border border-border/40 text-center hover:shadow-elegant transition-shadow">
                <p className="font-script text-2xl text-primary">Cô dâu</p>
                <p className="font-medium mt-2">{c.gift_bride_holder ?? c.bride_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.gift_bride_bank}</p>
                <p className="font-display text-xl mt-3 tabular-nums select-all">{c.gift_bride_account}</p>
              </div>
            )}
            {c.gift_groom_account && (
              <div className="bg-card rounded-lg p-6 shadow-soft border border-border/40 text-center hover:shadow-elegant transition-shadow">
                <p className="font-script text-2xl text-primary">Chú rể</p>
                <p className="font-medium mt-2">{c.gift_groom_holder ?? c.groom_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.gift_groom_bank}</p>
                <p className="font-display text-xl mt-3 tabular-nums select-all">{c.gift_groom_account}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section kicker="wishes" title="Sổ lưu bút" dark>
        <WishWall coupleId={c.id} wishes={wishes} />
      </Section>

      <section className="bg-romance py-24">
        <div className="max-w-3xl mx-auto px-6">
          <RevealOnScroll className="text-center mb-10">
            <p className="font-script text-3xl text-white">rsvp</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2 text-white">Xác nhận tham dự</h2>
            <p className="mt-3 text-white/90">Sự hiện diện của bạn là món quà tuyệt vời nhất.</p>
          </RevealOnScroll>
          <RevealOnScroll delay={150}>
            <div className="bg-card rounded-lg p-8 md:p-12 shadow-elegant">
              <RsvpForm coupleId={c.id} />
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
