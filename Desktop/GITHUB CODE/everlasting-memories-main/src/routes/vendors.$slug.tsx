import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getVendorBySlug } from "@/lib/vendors.functions";
import { resolveImg } from "@/lib/image-map";

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
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.name} — Mariée` },
      { name: "description", content: loaderData.tagline ?? loaderData.name },
      { property: "og:image", content: resolveImg(loaderData.cover_image) },
    ] : [],
  }),
});

function VendorPage() {
  const v = Route.useLoaderData();
  return (
    <>
      <section className="relative h-[60vh] min-h-[400px]">
        <img src={resolveImg(v.cover_image)} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="relative z-10 h-full flex items-end px-6 pb-12 max-w-7xl mx-auto w-full">
          <div className="text-white">
            <p className="font-script text-3xl text-blush">{v.tagline}</p>
            <h1 className="font-display text-5xl md:text-7xl mt-2">{v.name}</h1>
          </div>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-line">{v.description}</p>
        </div>
        {v.youtube_url && (
          <div className="mt-12 aspect-video rounded-lg overflow-hidden shadow-elegant">
            <iframe src={v.youtube_url} title={`${v.name} — video`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        )}
        {v.gallery && v.gallery.length > 0 && (
          <div className="mt-12">
            <h3 className="font-display text-2xl mb-4">Thư viện</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {v.gallery.map((img:string, i:number)=> (
                <a key={i} href={img} target="_blank" rel="noreferrer" className="block rounded overflow-hidden border border-border/60">
                  <img src={resolveImg(img)} alt={`${v.name} gallery ${i+1}`} className="w-full h-40 object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="mt-12 grid md:grid-cols-2 gap-6 bg-secondary/50 p-8 rounded-lg">
          <div>
            <h3 className="font-display text-2xl mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2 text-sm">
              {v.phone && <li><span className="text-muted-foreground">Điện thoại:</span> {v.phone}</li>}
              {v.email && <li><span className="text-muted-foreground">Email:</span> {v.email}</li>}
              {v.website && <li><span className="text-muted-foreground">Website:</span> <a href={v.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{v.website}</a></li>}
              {v.address && <li><span className="text-muted-foreground">Địa chỉ:</span> {v.address}{v.city ? `, ${v.city}` : ""}</li>}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-2xl mb-4">Chi tiết</h3>
            <ul className="space-y-2 text-sm">
              {v.price_range && <li><span className="text-muted-foreground">Khoảng giá:</span> {v.price_range}</li>}
              <li><span className="text-muted-foreground">Lĩnh vực:</span> {v.category}</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link to="/vendors" className="text-primary hover:underline">← Tất cả nhà cung cấp</Link>
        </div>
      </section>
    </>
  );
}
