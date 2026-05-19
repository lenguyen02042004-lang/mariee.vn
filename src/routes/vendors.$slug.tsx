import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getVendorBySlug } from "@/lib/vendors.functions";
import { resolveImg } from "@/lib/image-map";
import { useEffect, useState } from "react";
import { VendorLeadForm } from "@/components/VendorLeadForm";

export const Route = createFileRoute("/vendors/$slug")({
  loader: async ({ params }) => {
    const v = await getVendorBySlug({ data: { slug: params.slug } });
    if (!v) throw notFound();
    return v;
  },
  component: VendorPage,
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Không tìm thấy nhà cung cấp.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground px-6 text-center">{error.message}</div>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.name} — Mariée Wedding` },
      { name: "description", content: loaderData.tagline ?? loaderData.description?.slice(0,160) ?? loaderData.name },
      { property: "og:title", content: loaderData.name },
      { property: "og:description", content: loaderData.tagline ?? "" },
      { property: "og:image", content: resolveImg(loaderData.cover_image) },
    ] : [],
  }),
});

function VendorHero({ images, name, tagline }: { images: string[]; name: string; tagline?: string | null }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setI(p => (p + 1) % images.length), 5500);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
      {images.map((src, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}>
          <img src={resolveImg(src)} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
      ))}
      <div className="relative z-10 h-full flex items-end px-6 pb-16 max-w-7xl mx-auto w-full">
        <div className="text-white">
          {tagline && <p className="font-script text-3xl md:text-4xl text-blush">{tagline}</p>}
          <h1 className="font-display text-5xl md:text-7xl mt-2">{name}</h1>
        </div>
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx+1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-white" : "w-4 bg-white/50"}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function VendorPage() {
  const v = Route.useLoaderData() as any;
  const heroImages: string[] = [v.cover_image, ...(Array.isArray(v.gallery) ? v.gallery : [])].filter(Boolean).slice(0, 5);
  const finalHero = heroImages.length > 0 ? heroImages : [v.cover_image].filter(Boolean);
  const products: any[] = v.products ?? [];
  const testimonials: any[] = v.testimonials ?? [];
  const gallery: string[] = Array.isArray(v.gallery) ? v.gallery : [];

  return (
    <>
      <VendorHero images={finalHero} name={v.name} tagline={v.tagline} />

      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-script text-3xl text-primary">about us</p>
          <h2 className="font-display text-3xl md:text-4xl mt-2 mb-6">Giới thiệu</h2>
          <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-line">{v.description}</p>
        </div>
      </section>

      {v.youtube_url && (
        <section className="py-12 md:py-16 bg-secondary/40">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <p className="font-script text-3xl text-primary">showreel</p>
              <h2 className="font-display text-3xl md:text-4xl mt-2">Video giới thiệu</h2>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden shadow-elegant">
              <iframe src={v.youtube_url} title={`${v.name} — video`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="font-script text-3xl text-primary">services</p>
              <h2 className="font-display text-3xl md:text-4xl mt-2">Sản phẩm & Dịch vụ</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-card rounded-lg overflow-hidden shadow-soft border border-border/40 flex flex-col">
                  {p.image_url && <div className="aspect-[4/3]"><img src={resolveImg(p.image_url)} alt={p.title} loading="lazy" className="w-full h-full object-cover" /></div>}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display text-xl">{p.title}</h3>
                    {p.description && <p className="mt-2 text-sm text-muted-foreground flex-1">{p.description}</p>}
                    {p.price_text && <p className="mt-3 text-primary font-medium">{p.price_text}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="py-20 bg-secondary/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="font-script text-3xl text-primary">portfolio</p>
              <h2 className="font-display text-3xl md:text-4xl mt-2">Thư viện ảnh</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery.map((url, i) => (
                <div key={i} className="group aspect-square overflow-hidden rounded-md">
                  <img src={resolveImg(url)} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="font-script text-3xl text-primary">love letters</p>
              <h2 className="font-display text-3xl md:text-4xl mt-2">Khách hàng nói gì</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-card rounded-lg p-6 shadow-soft border border-border/40">
                  {t.rating && <p className="text-gold mb-2">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</p>}
                  <p className="text-foreground/80 italic whitespace-pre-line">"{t.message}"</p>
                  <p className="mt-4 font-script text-xl text-primary">{t.author_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <p className="font-script text-3xl text-primary">contact</p>
            <h2 className="font-display text-3xl md:text-4xl mt-2 mb-6">Thông tin liên hệ</h2>
            <ul className="space-y-3 text-sm">
              {v.phone && <li><span className="text-muted-foreground">Điện thoại:</span> {v.phone}</li>}
              {v.email && <li><span className="text-muted-foreground">Email:</span> {v.email}</li>}
              {v.website && <li><span className="text-muted-foreground">Website:</span> <a href={v.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{v.website}</a></li>}
              {(v.address || v.city) && <li><span className="text-muted-foreground">Địa chỉ:</span> {v.address}{v.city ? `, ${v.city}` : ""}</li>}
              {v.price_range && <li><span className="text-muted-foreground">Khoảng giá:</span> {v.price_range}</li>}
              <li><span className="text-muted-foreground">Lĩnh vực:</span> {v.category}</li>
            </ul>
            <div className="mt-8">
              <Link to="/vendors" className="text-primary hover:underline">← Tất cả nhà cung cấp</Link>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-elegant">
            <h3 className="font-display text-2xl mb-1">Đăng ký tư vấn</h3>
            <p className="text-sm text-muted-foreground mb-5">Để lại thông tin, chúng tôi sẽ liên hệ lại trong 24h.</p>
            <VendorLeadForm vendorId={v.id} />
          </div>
        </div>
      </section>
    </>
  );
}
