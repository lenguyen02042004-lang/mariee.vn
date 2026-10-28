import { createFileRoute, Link } from "@tanstack/react-router";
import { listCouples } from "@/lib/couples.functions";
import { listVendors } from "@/lib/vendors.functions";
import { getSiteSettings } from "@/lib/plans.functions";
import { listBlogPosts } from "@/lib/blog.functions";
import { HomeHero } from "@/components/HomeHero";
import { VendorCard } from "@/components/VendorCard";
import { SmartImage } from "@/components/SmartImage";
import { HomePageSkeleton } from "@/components/HomeSkeleton";
import { VendorCategoryGrid } from "@/components/VendorCategoryIcons";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [couples, vendors, settings, blog] = await Promise.all([
      listCouples(),
      listVendors(),
      getSiteSettings(),
      listBlogPosts({ data: { page: 1, pageSize: 3 } }).catch(() => ({ items: [] as any[] })),
    ]);
    return {
      couples: couples.slice(0, 4),
      vendors: vendors.slice(0, 8),
      settings,
      posts: (blog as any).items ?? [],
    };
  },
  staleTime: 60_000,
  component: Home,
  pendingMs: 0,
  pendingMinMs: 200,
  pendingComponent: HomePageSkeleton,
  head: () => ({ meta: [
    { title: "Mariée — Thiệp cưới online sang trọng cho mọi cặp đôi" },
    { name: "description", content: "Tạo trang cưới sang trọng riêng cho cặp đôi của bạn. Khám phá những nhà cung cấp dịch vụ cưới hàng đầu." },
    { property: "og:title", content: "Mariée — Thiệp cưới online sang trọng cho mọi cặp đôi" },
    { property: "og:description", content: "Tạo trang cưới sang trọng riêng cho cặp đôi của bạn. Khám phá những nhà cung cấp dịch vụ cưới hàng đầu." },
    { property: "og:url", content: canonical("/") },
  ], links: [{ rel: "canonical", href: canonical("/") }] }),
});

function Home() {
  const { couples, vendors, settings, posts } = Route.useLoaderData();
  return (
    <>
      <HomeHero slides={settings?.hero_slides} youtubeUrl={settings?.hero_youtube_url} />

      <section id="couples" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="font-script text-3xl text-primary">our couples</p>
          <h2 className="font-display text-[clamp(1.875rem,4vw,3rem)] mt-2 leading-tight">Những câu chuyện tình yêu</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Mỗi đám cưới là một câu chuyện riêng, được kể bằng hình ảnh, âm thanh và ký ức.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {couples.map((c: any) => (
            <Link key={c.id} to="/couples/$slug" params={{ slug: c.slug }} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft hover:shadow-elegant transition-shadow duration-500">
                <SmartImage
                  src={c.cover_image}
                  alt={`${c.bride_name} & ${c.groom_name}`}
                  width={1080}
                  widths={[640, 800, 1080, 1440]}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                  <p className="font-script text-2xl text-gold/90">the wedding of</p>
                  <h3 className="font-script text-4xl sm:text-5xl mt-1 leading-tight text-white group-hover:text-gold transition-colors duration-300">
                    {c.bride_name} <span className="font-script text-gold mx-1">&amp;</span> {c.groom_name}
                  </h3>
                  {c.wedding_date && (
                    <p className="mt-2 text-xs sm:text-sm font-serif uppercase tracking-[0.3em] text-white/85">
                      {new Date(c.wedding_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  )}
                  {c.venue_name && <p className="text-xs sm:text-sm text-white/75 mt-1 font-serif italic">{c.venue_name}</p>}
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold uppercase tracking-widest border-b border-gold/40 pb-0.5 group-hover:border-gold transition-colors">
                    Khám phá trang cưới <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-[linear-gradient(180deg,#FFF9FA_0%,#F9ECEE_100%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="font-script text-3xl text-primary">our partners</p>
            <h2 className="font-display text-[clamp(1.875rem,4vw,3rem)] mt-2 leading-tight">Nhà cung cấp đẳng cấp</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Đội ngũ chuyên gia hàng đầu cho mọi khía cạnh của ngày trọng đại.</p>
          </div>
          <div className="mb-12 sm:mb-16">
            <VendorCategoryGrid />
          </div>
          {vendors.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 auto-rows-auto">
              {vendors.map((v: any, i: number) => (
                <div key={v.id} className={i === 0 ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
                  <VendorCard v={v} featured={i === 0} eager={i === 0} />
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10 sm:mt-12">
            <Link
              to="/vendors"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-rose-deep text-primary-foreground uppercase tracking-[0.18em] text-sm shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all"
            >
              Khám phá tất cả đối tác cưới
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <p className="font-script text-3xl text-primary">journal</p>
              <h2 className="font-display text-[clamp(1.875rem,4vw,3rem)] mt-2 leading-tight">Cảm hứng & câu chuyện cưới</h2>
              <p className="mt-3 text-muted-foreground max-w-xl">Mẹo lên kế hoạch, xu hướng mới và những câu chuyện thật.</p>
            </div>
            <Link to="/blog" className="self-start sm:self-auto text-sm uppercase tracking-[0.2em] text-primary hover:text-rose-deep transition">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((p: any) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/40 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all duration-500"
              >
                <div className="aspect-[16/10] overflow-hidden bg-secondary">
                  {p.cover_image ? (
                    <SmartImage
                      src={p.cover_image}
                      alt={p.title}
                      width={800}
                      widths={[400, 640, 800, 1080]}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : <div className="w-full h-full bg-gradient-to-br from-secondary to-accent/40" />}
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary">{new Date(p.published_at).toLocaleDateString("vi-VN")}</p>
                  <h3 className="font-display text-xl sm:text-2xl mt-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">{p.excerpt}</p>}
                  <span className="mt-4 text-sm text-primary font-medium">Đọc bài viết →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
