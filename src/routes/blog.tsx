import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { listBlogPosts, listBlogCategories, type BlogCategory } from "@/lib/blog.functions";
import { SmartImage } from "@/components/SmartImage";
import heroBg from "@/assets/hero-wedding-3.jpg";

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1).catch(1),
  category: z.string().min(1).max(60).optional().catch(undefined),
  q: z.string().min(1).max(120).optional().catch(undefined),
});

const PAGE_SIZE = 8;

export const Route = createFileRoute("/blog")({
  validateSearch: searchSchema,
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog cưới — Mariée Wedding" },
      { name: "description", content: "Tin tức, mẹo cưới, câu chuyện thật và xu hướng cưới cập nhật mỗi tuần từ Mariée Wedding." },
      { property: "og:title", content: "Blog cưới — Mariée Wedding" },
      { property: "og:description", content: "Khám phá kho cảm hứng cưới, mẹo lên kế hoạch và những câu chuyện thật từ các cặp đôi." },
    ],
  }),
});

function BlogPage() {
  const { page, category, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/blog" });
  const fetcher = useServerFn(listBlogPosts);
  const fetchCats = useServerFn(listBlogCategories);
  const catsQ = useQuery<BlogCategory[]>({ queryKey: ["blog-cats"], queryFn: () => fetchCats(), staleTime: 5 * 60_000 });
  const cats = catsQ.data ?? [];
  const { data, isLoading } = useQuery({
    queryKey: ["blog", page, category ?? "all", q ?? ""],
    queryFn: () => fetcher({ data: { page, pageSize: PAGE_SIZE, category: category ?? null, q: q ?? null } }),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
  // Latest posts for sidebar (independent of filters)
  const { data: latestData } = useQuery({
    queryKey: ["blog-latest"],
    queryFn: () => fetcher({ data: { page: 1, pageSize: 5, category: null, q: null } }),
    staleTime: 2 * 60_000,
  });

  // Debounced search input
  const [term, setTerm] = useState(q ?? "");
  useEffect(() => { setTerm(q ?? ""); }, [q]);
  useEffect(() => {
    const t = setTimeout(() => {
      const next = term.trim();
      if ((next || undefined) === (q || undefined)) return;
      navigate({ search: { page: 1, category, q: next || undefined } });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCat = cats.find((c) => c.slug === category);
  // On unfiltered first page, hero is first item, grid shows the rest
  const showHero = !category && !q && page === 1 && items.length > 0;
  const hero = showHero ? items[0] : null;
  const gridItems = showHero ? items.slice(1) : items;

  function setCategory(value: string | undefined) {
    navigate({ search: { page: 1, category: value as any, q } });
  }
  function gotoPage(p: number) {
    navigate({ search: { page: p, category, q } });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-gradient-to-b from-secondary/30 via-background to-background">
      {/* Magazine header */}
      <section className="relative min-h-[60vh] overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/65" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 text-center text-white">
          <p className="font-script text-3xl md:text-5xl text-blush">journal</p>
          <h1 className="font-display text-4xl md:text-6xl mt-3 tracking-tight">
            {activeCat ? activeCat.name : "Blog cưới"}
          </h1>
          <p className="text-white/85 mt-4 max-w-2xl mx-auto">
            Mẹo lên kế hoạch, xu hướng mới và những câu chuyện thật từ các cặp đôi.
          </p>
          <div className="mt-8 max-w-xl mx-auto relative">
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Tìm bài viết theo từ khoá..."
              className="w-full h-12 pl-11 pr-10 rounded-full border border-white/30 bg-white/95 text-foreground text-sm shadow-soft focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
              aria-label="Tìm bài viết"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            {term && (
              <button type="button" onClick={() => setTerm("")} aria-label="Xoá tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer">✕</button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        {/* Mobile category chips */}
        <nav aria-label="Danh mục" className="lg:hidden -mx-2 px-2 mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <CatChip active={!category} onClick={() => setCategory(undefined)}>Tất cả</CatChip>
            {cats.map((c) => (
              <CatChip key={c.id} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                {c.name}
              </CatChip>
            ))}
          </div>
        </nav>

        <div className="grid lg:grid-cols-[1fr_280px] gap-10">
          {/* Main column */}
          <div className="min-w-0">
            {(q || category) && (
              <p className="mb-6 text-sm text-muted-foreground">
                {total} kết quả{q ? <> cho "<span className="text-foreground">{q}</span>"</> : null}
                {activeCat ? <> trong <span className="text-foreground">{activeCat.name}</span></> : null}
                {(q || category) && (
                  <button onClick={() => navigate({ search: { page: 1 } })} className="ml-3 text-primary underline cursor-pointer">Xoá bộ lọc</button>
                )}
              </p>
            )}

            {/* Hero featured */}
            {hero && (
              <Link
                to="/blog/$slug"
                params={{ slug: hero.slug }}
                className="group block bg-card rounded-2xl border border-border/40 overflow-hidden shadow-soft hover:shadow-elegant hover:border-primary/40 transition-all duration-300 mb-10"
              >
                <div className="grid md:grid-cols-2">
                  <div className="aspect-[16/10] md:aspect-auto md:h-full overflow-hidden bg-secondary">
                    {hero.cover_image ? (
                      <SmartImage
                        src={hero.cover_image}
                        alt={hero.title}
                        width={1080}
                        widths={[640, 800, 1080, 1440]}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        priority
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/40" />}
                  </div>
                  <div className="p-7 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-[0.16em]">
                        ⭐ Nổi bật
                      </span>
                      <span className="text-muted-foreground">{new Date(hero.published_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl mt-3 leading-tight group-hover:text-primary transition-colors line-clamp-3">
                      {hero.title}
                    </h2>
                    {hero.excerpt && <p className="mt-3 text-muted-foreground line-clamp-3">{hero.excerpt}</p>}
                    <span className="mt-5 text-sm text-primary font-medium">Đọc bài viết →</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 gap-6 min-h-[40vh]">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border/40 overflow-hidden animate-pulse">
                    <div className="aspect-[16/10] bg-secondary" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 w-16 bg-secondary rounded" />
                      <div className="h-5 w-3/4 bg-secondary rounded" />
                      <div className="h-4 w-full bg-secondary rounded" />
                    </div>
                  </div>
                ))}
              {!isLoading && items.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-20 border border-dashed border-border/60 rounded-xl bg-card/40">
                  Chưa có bài viết phù hợp.
                </div>
              )}
              {!isLoading && gridItems.map((p: any) => {
                const cat = cats.find((c) => c.slug === p.category);
                return (
                  <Link
                    key={p.id}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="group bg-card rounded-xl border border-border/40 overflow-hidden flex flex-col shadow-soft hover:-translate-y-1 hover:shadow-elegant hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                      {p.cover_image ? (
                        <SmartImage
                          src={p.cover_image}
                          alt={p.title}
                          width={720}
                          widths={[400, 640, 800, 1080]}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/40" />}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-[0.16em]">{cat?.name ?? p.category}</span>
                        <span className="text-muted-foreground">{new Date(p.published_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <h2 className="font-display text-lg mt-3 group-hover:text-primary transition-colors line-clamp-2">{p.title}</h2>
                      {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">{p.excerpt}</p>}
                      {p.author_name && <p className="mt-4 text-xs text-muted-foreground">— {p.author_name}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && <Pagination current={page} total={totalPages} onChange={gotoPage} />}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-8">
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft sticky-safe">
              <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" /> Danh mục
              </h3>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => setCategory(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition cursor-pointer flex items-center justify-between ${
                      !category ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary/60"
                    }`}>
                    <span>Tất cả bài viết</span>
                    <span className="text-xs text-muted-foreground">{!category ? total : ""}</span>
                  </button>
                </li>
                {cats.map((c) => (
                  <li key={c.id}>
                    <button onClick={() => setCategory(c.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition cursor-pointer ${
                        category === c.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary/60"
                      }`}>
                      {c.name}
                    </button>
                  </li>
                ))}
                {cats.length === 0 && <li className="text-xs text-muted-foreground px-3 py-2">Chưa có danh mục</li>}
              </ul>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
              <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" /> Bài viết mới
              </h3>
              <ul className="space-y-4">
                {(latestData?.items ?? []).map((p: any) => (
                  <li key={p.id}>
                    <Link to="/blog/$slug" params={{ slug: p.slug }} className="group flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-secondary">
                        {p.cover_image && (
                          <SmartImage
                            src={p.cover_image}
                            alt=""
                            width={160}
                            widths={[128, 160, 240]}
                            sizes="64px"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(p.published_at).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </Link>
                  </li>
                ))}
                {(!latestData || latestData.items.length === 0) && (
                  <li className="text-xs text-muted-foreground">Chưa có bài viết</li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition cursor-pointer ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-soft"
          : "bg-background border-border hover:border-primary/60 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const pages: (number | "…")[] = [];
  const add = (v: number | "…") => pages.push(v);
  const range = (a: number, b: number) => { for (let i = a; i <= b; i++) add(i); };
  if (total <= 7) range(1, total);
  else {
    add(1);
    if (current > 4) add("…");
    range(Math.max(2, current - 1), Math.min(total - 1, current + 1));
    if (current < total - 3) add("…");
    add(total);
  }
  return (
    <nav aria-label="Phân trang" className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40 hover:border-primary/60 hover:text-primary transition cursor-pointer"
      >
        ← Trước
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === current ? "page" : undefined}
            className={`min-w-10 px-3 py-2 rounded-md text-sm border transition cursor-pointer ${
              p === current
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/60 hover:text-primary"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40 hover:border-primary/60 hover:text-primary transition cursor-pointer"
      >
        Sau →
      </button>
    </nav>
  );
}