import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCoupleBySlug } from "@/lib/couples.functions";
import { resolveImg } from "@/lib/image-map";
import { HeroSlider } from "@/components/HeroSlider";
import { RsvpForm } from "@/components/RsvpForm";

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
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.couple.bride_name} & ${loaderData.couple.groom_name} — Mariée Wedding` },
      { name: "description", content: loaderData.couple.quote ?? `Đám cưới của ${loaderData.couple.bride_name} & ${loaderData.couple.groom_name}` },
      { property: "og:image", content: resolveImg(loaderData.couple.cover_image) },
    ] : [],
  }),
});

function CouplePage() {
  const { couple, gallery } = Route.useLoaderData();
  const heroImages = [couple.hero_image_1, couple.hero_image_2, couple.hero_image_3].filter(Boolean) as string[];

  return (
    <>
      <HeroSlider images={heroImages} brideName={couple.bride_name} groomName={couple.groom_name} date={couple.wedding_date} />

      {couple.quote && (
        <section className="py-24 text-center max-w-3xl mx-auto px-6">
          <p className="font-script text-2xl text-primary mb-4">our promise</p>
          <blockquote className="font-display text-3xl md:text-4xl italic text-balance leading-snug">"{couple.quote}"</blockquote>
        </section>
      )}

      {couple.story && (
        <section className="bg-secondary/40 py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="font-script text-3xl text-primary">our story</p>
            <h2 className="font-display text-4xl mt-2 mb-8">Câu chuyện của chúng mình</h2>
            <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-line">{couple.story}</p>
          </div>
        </section>
      )}

      {couple.youtube_url && (
        <section className="py-24 max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="font-script text-3xl text-primary">save the moment</p>
            <h2 className="font-display text-4xl mt-2">Khoảnh khắc đáng nhớ</h2>
          </div>
          <div className="aspect-video rounded-lg overflow-hidden shadow-elegant">
            <iframe src={couple.youtube_url} title="Wedding video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="bg-secondary/40 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="font-script text-3xl text-primary">our gallery</p>
              <h2 className="font-display text-4xl mt-2">Thư viện ảnh cưới</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((g: any) => (
                <div key={g.id} className="group relative aspect-square overflow-hidden rounded-md shadow-soft">
                  <img src={resolveImg(g.image_url)} alt={g.caption ?? ""} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {couple.venue_name && (
        <section className="py-24 text-center max-w-2xl mx-auto px-6">
          <p className="font-script text-3xl text-primary">venue</p>
          <h2 className="font-display text-4xl mt-2">{couple.venue_name}</h2>
          {couple.venue_address && <p className="mt-3 text-muted-foreground">{couple.venue_address}</p>}
          {couple.wedding_date && <p className="mt-6 text-lg">{new Date(couple.wedding_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>}
        </section>
      )}

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
