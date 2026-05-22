import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePicker } from "@/components/ImagePicker";
import { useQuery } from "@tanstack/react-query";
import { adminUpsertBlogPost, listBlogCategories, type BlogCategory } from "@/lib/blog.functions";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export function BlogPostForm({ initial }: { initial?: any }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const save = useServerFn(adminUpsertBlogPost);
  const fetchCats = useServerFn(listBlogCategories);
  const { data: cats = [] } = useQuery<BlogCategory[]>({ queryKey: ["blog-cats"], queryFn: () => fetchCats() });

  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState<any>(initial ?? {
    slug: "", title: "", excerpt: "", content: "", cover_image: "",
    category: "tips", author_name: "", is_published: true,
    published_at: today,
  });
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);

  useEffect(() => {
    if (initial) setF({
      ...initial,
      published_at: initial.published_at ? new Date(initial.published_at).toISOString().slice(0, 10) : today,
      excerpt: initial.excerpt ?? "", content: initial.content ?? "",
      cover_image: initial.cover_image ?? "", author_name: initial.author_name ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  const m = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => {
      toast.success("Đã lưu bài viết");
      qc.invalidateQueries({ queryKey: ["a-blog"] });
      qc.invalidateQueries({ queryKey: ["blog"] });
      navigate({ to: "/admin/blog" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  function onTitle(v: string) {
    setF((p: any) => ({ ...p, title: v, slug: slugTouched ? p.slug : slugify(v) }));
  }

  function submit() {
    if (!f.title.trim()) return toast.error("Vui lòng nhập tiêu đề");
    if (!f.slug.trim()) return toast.error("Vui lòng nhập slug");
    m.mutate({
      id: f.id,
      slug: f.slug.trim(),
      title: f.title.trim(),
      excerpt: f.excerpt ?? "",
      content: f.content ?? "",
      cover_image: f.cover_image ?? "",
      category: f.category,
      author_name: f.author_name ?? "",
      is_published: !!f.is_published,
      published_at: f.published_at ? new Date(f.published_at).toISOString() : "",
    });
  }

  return (
    <div className="space-y-5 bg-card border border-border/60 rounded-lg p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tiêu đề *</label>
          <input value={f.title} onChange={(e) => onTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Slug (đường dẫn) *</label>
          <input value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value }); }} placeholder="vi-du-bai-viet" className="mt-1 w-full px-3 py-2 border border-input bg-background rounded font-mono text-sm" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Danh mục *</label>
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded">
            {cats.length === 0 && <option value="">— Chưa có danh mục —</option>}
            {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Tác giả</label>
          <input value={f.author_name ?? ""} onChange={(e) => setF({ ...f, author_name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Ngày xuất bản</label>
          <input type="date" value={f.published_at ?? today} onChange={(e) => setF({ ...f, published_at: e.target.value })} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Tóm tắt</label>
        <textarea value={f.excerpt ?? ""} onChange={(e) => setF({ ...f, excerpt: e.target.value })} rows={2} maxLength={500} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
      </div>
      <ImagePicker label="Ảnh bìa" value={f.cover_image ?? ""} onChange={(url) => setF((p: any) => ({ ...p, cover_image: url }))} folder="blog" aspect="aspect-[16/9]" />
      <div>
        <label className="text-xs font-medium text-muted-foreground">Nội dung</label>
        <textarea value={f.content ?? ""} onChange={(e) => setF({ ...f, content: e.target.value })} rows={14} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded font-mono text-sm" />
        <p className="text-xs text-muted-foreground mt-1">Mỗi đoạn cách nhau bằng dòng trống. Định dạng giữ nguyên xuống dòng.</p>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={!!f.is_published} onChange={(e) => setF({ ...f, is_published: e.target.checked })} />
        Xuất bản công khai
      </label>
      <div className="flex gap-3 pt-3 border-t border-border/40">
        <button onClick={submit} disabled={m.isPending} className="px-5 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{m.isPending ? "Đang lưu…" : "💾 Lưu"}</button>
        <button onClick={() => navigate({ to: "/admin/blog" })} className="px-5 py-2 border border-input bg-background hover:bg-secondary rounded text-sm">Huỷ</button>
      </div>
    </div>
  );
}