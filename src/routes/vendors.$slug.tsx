import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getVendorBySlug } from "@/lib/vendors.functions";
import { resolveImg } from "@/lib/image-map";
import { absoluteImage, canonical } from "@/lib/seo";
import { useEffect, useState } from "react";
import { VendorLeadForm } from "@/components/VendorLeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, Tag, MessageCircle, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới", photography: "Chụp ảnh cưới", videography: "Quay phim cưới",
  wedding_planner: "Wedding planner", makeup: "Trang điểm cô dâu", attire: "Trang phục cưới",
  flowers: "Hoa cưới", catering: "Ẩm thực", music: "Âm nhạc & live band",
  decor: "Trang trí", invitation: "Thiệp cưới", other: "Dịch vụ khác",
};

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
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [] };
    const v: any = loaderData;
    const url = canonical(`/vendors/${params.slug}`);
    const img = absoluteImage(resolveImg(v.cover_image));
    const desc = v.tagline ?? v.description?.slice(0, 160) ?? v.name;
    return {
      meta: [
        { title: `${v.name} — Mariée Wedding` },
        { name: "description", content: desc },
        { property: "og:title", content: v.name },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: v.name,
          description: v.description ?? v.tagline ?? undefined,
          image: img ? [img] : undefined,
          url,
          telephone: v.phone ?? undefined,
          email: v.email ?? undefined,
          priceRange: v.price_range ?? undefined,
          address: (v.address || v.city) ? {
            "@type": "PostalAddress",
            streetAddress: v.address ?? undefined,
            addressLocality: v.city ?? undefined,
            addressCountry: "VN",
          } : undefined,
        }),
      }],
    };
  },
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
              <p className="text-sm text-muted-foreground mt-3">Nhấn vào mỗi gói để xem chi tiết và gửi yêu cầu tư vấn — chúng tôi chỉ hỗ trợ kết nối, không xử lý giao dịch mua bán.</p>
            </div>
            <ProductGrid products={products} vendorId={v.id} vendorName={v.name} />
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="py-20 bg-secondary/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="font-script text-3xl text-primary">portfolio</p>
              <h2 className="font-display text-3xl md:text-4xl mt-2">Thư viện ảnh</h2>
              <p className="text-sm text-muted-foreground mt-3">Nhấn vào ảnh để xem chi tiết.</p>
            </div>
            <GalleryLightbox images={gallery} />
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
              <li><span className="text-muted-foreground">Lĩnh vực:</span> {CAT_LABEL[v.category] ?? v.category}</li>
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

function ProductGrid({ products, vendorId, vendorName }: { products: any[]; vendorId: string; vendorName: string }) {
  const [active, setActive] = useState<any | null>(null);
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p)}
            className="group text-left bg-card rounded-xl overflow-hidden shadow-soft border border-border/40 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {p.image_url ? (
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={resolveImg(p.image_url)}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-secondary/40" />
            )}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-display text-xl">{p.title}</h3>
              {p.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                {p.price_text ? (
                  <span className="inline-flex items-center gap-1.5 text-primary font-medium text-sm">
                    <Tag className="w-3.5 h-3.5" /> {p.price_text}
                  </span>
                ) : <span />}
                <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {active && (
            <div>
              {active.image_url && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                  <img src={resolveImg(active.image_url)} alt={active.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 md:p-8">
                <DialogHeader>
                  <p className="font-script text-2xl text-primary">{vendorName}</p>
                  <DialogTitle className="font-display text-2xl md:text-3xl">{active.title}</DialogTitle>
                  {active.price_text && (
                    <DialogDescription className="text-primary text-base inline-flex items-center gap-1.5">
                      <Tag className="w-4 h-4" /> {active.price_text}
                    </DialogDescription>
                  )}
                </DialogHeader>
                {active.description && (
                  <p className="mt-4 text-sm md:text-base text-foreground/80 whitespace-pre-line leading-relaxed">
                    {active.description}
                  </p>
                )}

                <div className="mt-6 rounded-lg bg-secondary/40 border border-border/40 p-4 text-xs text-muted-foreground flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <p>
                    Mariée Wedding chỉ hỗ trợ kết nối thông tin giữa bạn và nhà cung cấp. Mọi chi tiết về báo giá,
                    hợp đồng và thanh toán sẽ được hai bên trao đổi trực tiếp sau khi vendor liên hệ.
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="font-display text-xl flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" /> Yêu cầu tư vấn / đặt lịch
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gửi thông tin để vendor liên hệ lại trong vòng 24h.
                  </p>
                  <div className="mt-4">
                    <VendorLeadForm
                      vendorId={vendorId}
                      productTitle={active.title}
                      onSubmitted={() => setTimeout(() => setActive(null), 1800)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function GalleryLightbox({ images }: { images: string[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const open = idx !== null;
  const close = () => setIdx(null);
  const prev = () => setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  const next = () => setIdx((i) => (i === null ? i : (i + 1) % images.length));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className="group aspect-square overflow-hidden rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Mở ảnh ${i + 1}`}
          >
            <img
              src={resolveImg(url)}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 md:left-6 z-10 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 md:right-6 z-10 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Ảnh kế"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative max-w-[92vw] max-h-[88vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveImg(images[idx!])}
              alt=""
              className="max-w-[92vw] max-h-[82vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
            />
            <p className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-white/70">
              {idx! + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
