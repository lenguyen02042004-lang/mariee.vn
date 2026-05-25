import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listVendors } from "@/lib/vendors.functions";
import { VendorCard } from "@/components/VendorCard";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới",
  photography: "Chụp ảnh cưới",
  videography: "Quay phim cưới",
  wedding_planner: "Wedding planner",
  makeup: "Trang điểm cô dâu",
  attire: "Trang phục cưới",
  flowers: "Hoa cưới",
  catering: "Ẩm thực",
  music: "Âm nhạc & live band",
  decor: "Trang trí",
  invitation: "Thiệp cưới",
  other: "Dịch vụ khác",
};

export const Route = createFileRoute("/vendors/")({
  loader: async () => await listVendors(),
  staleTime: 60_000,
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
      <section className="py-16 sm:py-20 text-center bg-secondary/40 px-4">
        <p className="font-script text-3xl text-primary">vendors</p>
        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] mt-2 leading-tight">Nhà cung cấp dịch vụ cưới</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Tinh hoa của từng lĩnh vực — venue, nhiếp ảnh, makeup, hoa cưới và hơn thế nữa.</p>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8 sm:mb-10">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((v: any, i: number) => (
            <VendorCard key={v.id} v={v} eager={i < 3} />
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">Không tìm thấy nhà cung cấp phù hợp.</p>}
        </div>
      </section>
    </>
  );
}
