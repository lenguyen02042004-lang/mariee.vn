import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { listBlogPosts, BLOG_CATEGORIES } from "@/lib/blog.functions";
import { resolveImg } from "@/lib/image-map";

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1).catch(1),
  category: z.enum(["news", "tips", "real_stories", "trends", "venues", "other"]).optional().catch(undefined),
});

const PAGE_SIZE = 9;

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
  const { page, category } = Route.useSearch();
  const navigate = useNavigate({ from: "/blog" });
  const fetcher = useServerFn(listBlogPosts);
  const { data, isLoading } = useQuery({
    queryKey: ["blog", page, category ?? "all"],
    queryFn: () => fetcher({ data: { page, pageSize: PAGE_SIZE, category: category ?? null } }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function setCategory(value: string | undefined) {
    navigate({ search: { page: 1, category: value as any } });
  }
  function gotoPage(p: number) {
    navigate({ search: { page: p, category } });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <header className="text-center max-w-2xl mx-auto">
        <p className="font-script text-3xl text-primary">journal</p>
        <h1 className="font-display text-4xl md:text-5xl mt-2">Blog cưới</h1>
        <p className="text-muted-foreground mt-4">
          Mẹo lên kế hoạch, xu hướng mới và những câu chuyện thật từ các cặp đôi.
        </p>
      </header>

      {/* Categories */}
      <nav aria-label="Danh mục" className="mt-10 flex flex-wrap justify-center gap-2">
        <CatChip active={!category} onClick={() => setCategory(undefined)}>Tất cả</CatChip>
        {BLOG_CATEGORIES.map((c) => (
          <CatChip key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>
            {c.label}
          </CatChip>
        ))}
      </nav>

      {/* Grid */}
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[40vh]">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
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
          <div className="col-span-full text-center text-muted-foreground py-16">Chưa có bài viết trong danh mục này.</div>
        )}
        {!isLoading && items.map((p: any) => {
          const cat = BLOG_CATEGORIES.find((c) => c.value === p.category);
          return (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group bg-card rounded-xl border border-border/40 overflow-hidden flex flex-col shadow-soft hover:-translate-y-1 hover:shadow-elegant hover:border-primary/40 transition-all duration-300"
            >
              <div className="aspect-[16/10] overflow-hidden bg-secondary">
                {p.cover_image ? (
                  <img
                    src={resolveImg(p.cover_image)}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-secondary/40" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-[0.16em]">{cat?.label ?? p.category}</span>
                  <span className="text-muted-foreground">{new Date(p.published_at).toLocaleDateString("vi-VN")}</span>
                </div>
                <h2 className="font-display text-xl mt-3 group-hover:text-primary transition-colors line-clamp-2">{p.title}</h2>
                {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.excerpt}</p>}
                {p.author_name && <p className="mt-4 text-xs text-muted-foreground">— {p.author_name}</p>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination current={page} total={totalPages} onChange={gotoPage} />
      )}
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