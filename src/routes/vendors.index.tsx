import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { listVendors } from "@/lib/vendors.functions";
import { VendorCard } from "@/components/VendorCard";
import hero from "@/assets/vendor-photo.jpg";
import { PageHero } from "@/components/PageHero";
import { VendorCategoryChips } from "@/components/VendorCategoryIcons";
import { canonical } from "@/lib/seo";

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
  validateSearch: z.object({ cat: z.string().min(1).max(40).optional().catch(undefined) }),
  loader: async () => await listVendors(),
  staleTime: 60_000,
  component: VendorsPage,
  head: () => ({ meta: [
    { title: "Nhà cung cấp dịch vụ cưới — Mariée" },
    { name: "description", content: "Danh sách các nhà cung cấp dịch vụ cưới uy tín và đẳng cấp." },
    { property: "og:title", content: "Nhà cung cấp dịch vụ cưới — Mariée" },
    { property: "og:description", content: "Danh sách các nhà cung cấp dịch vụ cưới uy tín và đẳng cấp." },
    { property: "og:url", content: canonical("/vendors") },
  ], links: [{ rel: "canonical", href: canonical("/vendors") }] }),
});

function VendorsPage() {
  const vendors = Route.useLoaderData();
  const { cat: catParam } = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(catParam ?? "all");
  useEffect(() => { if (catParam) setCat(catParam); }, [catParam]);
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
      <PageHero
        image={hero}
        script="vendors"
        title="Nhà cung cấp dịch vụ cưới"
        subtitle="Tinh hoa của từng lĩnh vực — venue, nhiếp ảnh, makeup, hoa cưới và hơn thế nữa."
      />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <VendorCategoryChips value={cat} onChange={setCat} />
        </div>
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
