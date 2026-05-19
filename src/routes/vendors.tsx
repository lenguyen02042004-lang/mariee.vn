import { createFileRoute, Link } from "@tanstack/react-router";
import { listVendors } from "@/lib/vendors.functions";
import { resolveImg } from "@/lib/image-map";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới", photography: "Chụp ảnh", videography: "Quay phim",
  wedding_planner: "Tổ chức cưới", makeup: "Trang điểm", attire: "Trang phục",
  flowers: "Hoa cưới", catering: "Ẩm thực", music: "Âm nhạc",
  decor: "Trang trí", invitation: "Thiệp cưới", other: "Khác",
};

export const Route = createFileRoute("/vendors")({
  loader: async () => await listVendors(),
  component: VendorsPage,
  head: () => ({ meta: [
    { title: "Nhà cung cấp dịch vụ cưới — Mariée" },
    { name: "description", content: "Danh sách các nhà cung cấp dịch vụ cưới uy tín và đẳng cấp." },
  ]}),
});

function VendorsPage() {
  const vendors = Route.useLoaderData();
  return (
    <>
      <section className="py-20 text-center bg-secondary/40">
        <p className="font-script text-3xl text-primary">vendors</p>
        <h1 className="font-display text-5xl mt-2">Nhà cung cấp dịch vụ cưới</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto px-6">Tinh hoa của từng lĩnh vực — venue, nhiếp ảnh, makeup, hoa cưới và hơn thế nữa.</p>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {vendors.map((v: any) => (
            <Link key={v.id} to="/vendors/$slug" params={{ slug: v.slug }} className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={resolveImg(v.cover_image)} alt={v.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">{CAT_LABEL[v.category] ?? v.category}</p>
                <h3 className="font-display text-2xl mt-1">{v.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{v.tagline}</p>
                {v.price_range && <p className="mt-3 text-sm text-foreground/70">Giá: {v.price_range}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
