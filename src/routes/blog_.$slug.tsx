import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getBlogPostBySlug, listBlogCategories, type BlogCategory } from "@/lib/blog.functions";
import { resolveImg } from "@/lib/image-map";

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

  return (
    <article className="pb-20">
      {post.cover_image && (
        <div className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
          <img src={resolveImg(post.cover_image)} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 -mt-20 relative">
        <div className="bg-card rounded-xl shadow-elegant border border-border/40 p-8 md:p-12">
          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/blog"
              search={{ category: post.category, page: 1 }}
              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-[0.16em] hover:bg-primary/20 transition"
            >
              {cat?.name ?? post.category}
            </Link>
            <span className="text-muted-foreground">{new Date(post.published_at).toLocaleDateString("vi-VN")}</span>
            {post.author_name && <span className="text-muted-foreground">• {post.author_name}</span>}
          </div>
          <h1 className="font-display text-3xl md:text-5xl mt-4 leading-tight">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-foreground/80">{post.excerpt}</p>}
          {post.content && (
            <div className="prose prose-neutral max-w-none mt-8 text-foreground/90 whitespace-pre-line leading-relaxed">
              {post.content}
            </div>
          )}
          <div className="mt-10 pt-6 border-t border-border/40 flex items-center justify-between text-sm">
            <Link to="/blog" className="text-primary hover:underline">← Tất cả bài viết</Link>
            <span className="text-muted-foreground text-xs">{post.views ?? 0} lượt xem</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="font-display text-2xl mb-6 text-center">Bài viết liên quan</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((r: any) => (
              <Link
                key={r.id}
                to="/blog/$slug"
                params={{ slug: r.slug }}
                className="group bg-card rounded-lg border border-border/40 overflow-hidden hover:shadow-elegant hover:border-primary/40 transition"
              >
                <div className="aspect-[16/10] bg-secondary overflow-hidden">
                  {r.cover_image && (
                    <img src={resolveImg(r.cover_image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-display text-base line-clamp-2 group-hover:text-primary transition-colors">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.published_at).toLocaleDateString("vi-VN")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}