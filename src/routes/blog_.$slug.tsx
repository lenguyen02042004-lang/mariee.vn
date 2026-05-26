import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getBlogPostBySlug, listBlogCategories, type BlogCategory } from "@/lib/blog.functions";
import { resolveImg } from "@/lib/image-map";
import { SmartImage } from "@/components/SmartImage";

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params }) => {
    const res = await getBlogPostBySlug({ data: { slug: params.slug } });
    if (!res) throw notFound();
    return res;
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
      <p>Không tìm thấy bài viết.</p>
      <Link to="/blog" className="text-primary underline">← Về blog</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground px-6 text-center">{error.message}</div>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} — Mariée Wedding` },
          { name: "description", content: loaderData.post.excerpt ?? loaderData.post.title },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.excerpt ?? "" },
          { property: "og:image", content: resolveImg(loaderData.post.cover_image) },
        ]
      : [],
  }),
});

function BlogPostPage() {
  const { post, related } = Route.useLoaderData();
  const fetchCats = useServerFn(listBlogCategories);
  const { data: cats = [] } = useQuery<BlogCategory[]>({ queryKey: ["blog-cats"], queryFn: () => fetchCats() });
  const cat = cats.find((c) => c.slug === post.category);
  const minutes = Math.max(1, Math.round((post.content?.split(/\s+/).length ?? 0) / 200));
  const dateLabel = new Date(post.published_at).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <article className="bg-gradient-to-b from-secondary/30 via-background to-background pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <span>/</span>
          <Link to="/blog" search={{ category: post.category, page: 1 }} className="hover:text-primary">{cat?.name ?? post.category}</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[40ch]">{post.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10 md:pt-14 grid lg:grid-cols-[1fr_280px] gap-10">
        {/* Main */}
        <div className="min-w-0">
          {/* Header */}
          <header className="max-w-3xl">
            <Link
              to="/blog"
              search={{ category: post.category, page: 1 }}
              className="inline-block text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-[0.16em] hover:bg-primary/20 transition"
            >
              {cat?.name ?? post.category}
            </Link>
            <h1 className="font-display text-3xl md:text-5xl mt-4 leading-tight tracking-tight">{post.title}</h1>
            {post.excerpt && <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>}
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground border-b border-border/50 pb-6">
              {post.author_name && (
                <span className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {post.author_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-foreground">{post.author_name}</span>
                </span>
              )}
              <span>•</span>
              <span>{dateLabel}</span>
              <span>•</span>
              <span>{minutes} phút đọc</span>
              <span>•</span>
              <span>{post.views ?? 0} lượt xem</span>
            </div>
          </header>

          {/* Cover */}
          {post.cover_image && (
            <div className="mt-8 rounded-2xl overflow-hidden bg-secondary aspect-[16/9] shadow-soft">
              <SmartImage
                src={post.cover_image}
                alt={post.title}
                width={1440}
                widths={[640, 800, 1080, 1440, 1920]}
                sizes="(min-width: 1024px) 900px, 100vw"
                priority
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body */}
          {post.content && (
            <div className="mt-10 max-w-3xl">
              <div className="text-foreground/90 leading-[1.85] text-[17px] whitespace-pre-line break-words">
                {post.content}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border/40 flex items-center justify-between text-sm max-w-3xl">
            <Link to="/blog" className="text-primary hover:underline">← Quay lại blog</Link>
            <Link to="/blog" search={{ category: post.category, page: 1 }} className="text-muted-foreground hover:text-primary">
              Xem thêm trong {cat?.name ?? "danh mục"} →
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 self-start">
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
            <h3 className="font-display text-lg mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" /> Danh mục
            </h3>
            <ul className="space-y-1">
              <li>
                <Link to="/blog" className="block px-3 py-2 rounded-md text-sm hover:bg-secondary/60">Tất cả bài viết</Link>
              </li>
              {cats.map((c) => (
                <li key={c.id}>
                  <Link to="/blog" search={{ category: c.slug, page: 1 }}
                    className={`block px-3 py-2 rounded-md text-sm transition ${
                      c.slug === post.category ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary/60"
                    }`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {related.length > 0 && (
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-soft">
              <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" /> Bài liên quan
              </h3>
              <ul className="space-y-4">
                {related.map((r: any) => (
                  <li key={r.id}>
                    <Link to="/blog/$slug" params={{ slug: r.slug }} className="group flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-secondary">
                        {r.cover_image && (
                          <SmartImage
                            src={r.cover_image}
                            alt=""
                            width={160}
                            widths={[128, 160, 240]}
                            sizes="64px"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(r.published_at).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}