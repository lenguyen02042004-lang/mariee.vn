import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCoupleBySlug } from "@/lib/couples.functions";
import { resolveImg } from "@/lib/image-map";
import { HeroSlider } from "@/components/HeroSlider";
import { RsvpForm } from "@/components/RsvpForm";
import { Countdown } from "@/components/Countdown";
import { WishWall } from "@/components/WishWall";

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

      {couple.youtube_url && (
        <Section kicker="save the moment" title="Khoảnh khắc đáng nhớ">
          <div className="aspect-video rounded-lg overflow-hidden shadow-elegant max-w-5xl mx-auto">
            <iframe src={couple.youtube_url} title="Wedding video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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

      {gallery.length > 0 && (
        <Section kicker="our gallery" title="Thư viện ảnh cưới" dark>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((g: any) => (
              <div key={g.id} className="group relative aspect-square overflow-hidden rounded-md shadow-soft">
                <img src={resolveImg(g.image_url)} alt={g.caption ?? ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </Section>
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
