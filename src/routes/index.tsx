import { createFileRoute, Link } from "@tanstack/react-router";
import { listCouples } from "@/lib/couples.functions";
import { listVendors } from "@/lib/vendors.functions";
import { resolveImg } from "@/lib/image-map";
import hero from "@/assets/hero-wedding-1.jpg";

export const Route = createFileRoute("/")({
  loader: async () => ({
    couples: await listCouples(),
    vendors: (await listVendors()).slice(0, 4),
  }),
  component: Home,
  head: () => ({ meta: [
    { title: "Mariée — Landing page cưới sang trọng cho mọi cặp đôi" },
    { name: "description", content: "Tạo trang cưới sang trọng riêng cho cặp đôi của bạn. Khám phá những nhà cung cấp dịch vụ cưới hàng đầu." },
  ]}),
});

function Home() {
  const { couples, vendors } = Route.useLoaderData();
  return (
    <>
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <img src={hero} alt="Wedding" className="absolute inset-0 w-full h-full object-cover" width={1600} height={1100} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
          <p className="font-script text-3xl md:text-5xl text-blush">la vie est belle</p>
          <h1 className="mt-4 font-display text-5xl md:text-7xl text-balance max-w-4xl">
            Lưu giữ ngày trọng đại bằng một <em className="font-script text-gold not-italic">câu chuyện</em> riêng
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-2xl">
            Mariée tạo trang landing page cưới sang trọng, đẳng cấp dành riêng cho mỗi cặp đôi — và kết nối bạn với những nhà cung cấp dịch vụ tinh tế nhất.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm shadow-elegant hover:bg-rose-deep transition">Tạo trang cưới của bạn</Link>
            <Link to="/vendors" className="px-8 py-4 border border-white/60 rounded-md uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition">Xem nhà cung cấp</Link>
            <Link to="/pricing" className="px-8 py-4 border border-white/60 rounded-md uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition">Bảng giá vendor</Link>
          </div>
        </div>
      </section>

      <section id="couples" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="font-script text-3xl text-primary">our couples</p>
          <h2 className="font-display text-4xl md:text-5xl mt-2">Những câu chuyện tình yêu</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Mỗi đám cưới là một câu chuyện riêng, được kể bằng hình ảnh, âm thanh và ký ức.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {couples.map((c: any) => (
            <Link key={c.id} to="/couples/$slug" params={{ slug: c.slug }} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-soft">
                <img src={resolveImg(c.cover_image)} alt={`${c.bride_name} & ${c.groom_name}`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="font-script text-2xl text-blush">the wedding of</p>
                  <h3 className="font-display text-4xl mt-1">{c.bride_name} <span className="text-gold">&</span> {c.groom_name}</h3>
                  {c.wedding_date && <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/80">{new Date(c.wedding_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}</p>}
                  {c.venue_name && <p className="text-sm text-white/70 mt-1">{c.venue_name}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-script text-3xl text-primary">our partners</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Nhà cung cấp đẳng cấp</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Đội ngũ chuyên gia hàng đầu cho mọi khía cạnh của ngày trọng đại.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map((v: any) => (
              <Link key={v.id} to="/vendors/$slug" params={{ slug: v.slug }} className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={resolveImg(v.cover_image)} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">{(CAT_LABEL[v.category] ?? v.category).replace("_"," ")}</p>
                  <h3 className="font-display text-2xl mt-1">{v.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{v.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/vendors" className="inline-block px-8 py-3 border border-primary text-primary rounded-md uppercase tracking-[0.2em] text-sm hover:bg-primary hover:text-primary-foreground transition">Xem tất cả</Link>
          </div>
        </div>
      </section>
    </>
  );
}
