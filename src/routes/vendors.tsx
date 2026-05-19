import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listVendors } from "@/lib/vendors.functions";
import { resolveImg } from "@/lib/image-map";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới", photo: "Chụp ảnh cưới", video: "Quay phim cưới",
  planning: "Wedding planner", makeup: "Trang điểm cô dâu", attire: "Trang phục cưới",
  flowers: "Hoa cưới", catering: "Ẩm thực", music: "Âm nhạc & live band",
  other: "Dịch vụ khác",
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
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const cities = useMemo(() => Array.from(new Set(vendors.map((v: any) => v.city).filter(Boolean))) as string[], [vendors]);
  const cats = useMemo(() => Array.from(new Set(vendors.map((v: any) => v.category).filter(Boolean))) as string[], [vendors]);
  const filtered = vendors.filter((v: any) => {
    if (cat !== "all" && v.category !== cat) return false;
    if (city !== "all" && v.city !== city) return false;
    if (q && !`${v.name} ${v.tagline ?? ""} ${v.description ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <>
      <section className="py-20 text-center bg-secondary/40">
        <p className="font-script text-3xl text-primary">vendors</p>
        <h1 className="font-display text-5xl mt-2">Nhà cung cấp dịch vụ cưới</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto px-6">Tinh hoa của từng lĩnh vực — venue, nhiếp ảnh, makeup, hoa cưới và hơn thế nữa.</p>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-3 mb-10">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, mô tả…" className="px-4 py-3 border border-input rounded-md bg-background" />
          <select value={cat} onChange={e => setCat(e.target.value)} className="px-4 py-3 border border-input rounded-md bg-background">
            <option value="all">Tất cả lĩnh vực</option>
            {cats.map(c => <option key={c} value={c}>{CAT_LABEL[c] ?? c}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} className="px-4 py-3 border border-input rounded-md bg-background">
            <option value="all">Tất cả thành phố</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} nhà cung cấp</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((v: any) => (
            <Link key={v.id} to="/vendors/$slug" params={{ slug: v.slug }} className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={resolveImg(v.cover_image)} alt={v.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">{CAT_LABEL[v.category] ?? v.category}</p>
                  {v.is_featured && <span className="text-[10px] uppercase tracking-wider bg-gold/15 text-gold px-2 py-0.5 rounded">Featured</span>}
                </div>
                <h3 className="font-display text-2xl mt-1">{v.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{v.tagline}</p>
                <div className="flex items-center justify-between mt-3 text-sm text-foreground/70">
                  {v.price_range && <span>{v.price_range}</span>}
                  {v.city && <span className="text-muted-foreground">{v.city}</span>}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">Không tìm thấy nhà cung cấp phù hợp.</p>}
        </div>
      </section>
    </>
  );
}
