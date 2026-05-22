import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  adminListBlogPosts, adminDeleteBlogPost,
  listBlogCategories, adminUpsertBlogCategory, adminDeleteBlogCategory,
  type BlogCategory,
} from "@/lib/blog.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/blog")({ component: AdminBlog });

function AdminBlog() {
  const qc = useQueryClient();
  const list = useServerFn(adminListBlogPosts);
  const del = useServerFn(adminDeleteBlogPost);
  const fetchCats = useServerFn(listBlogCategories);
  const { data, isLoading } = useQuery({ queryKey: ["a-blog"], queryFn: () => list() });
  const { data: cats = [] } = useQuery<BlogCategory[]>({ queryKey: ["blog-cats"], queryFn: () => fetchCats() });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá"); qc.invalidateQueries({ queryKey: ["a-blog"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý bài viết, danh mục và xuất bản.</p>
        </div>
        <Link to="/admin/blog/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">+ Bài viết mới</Link>
      </div>

      <CategoriesPanel cats={cats} />

      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Xuất bản</th>
                <th className="p-3">Lượt xem</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p: any) => (
                <tr key={p.id} className="border-t border-border/40">
                  <td className="p-3">
                    <div className="font-medium">{p.title}</div>
                    <Link to="/blog/$slug" params={{ slug: p.slug }} target="_blank" className="text-xs text-primary underline">/blog/{p.slug} ↗</Link>
                  </td>
                  <td className="p-3">{cats.find((c) => c.slug === p.category)?.name ?? p.category}</td>
                  <td className="p-3">{p.is_published ? <span className="text-emerald-600">Đã xuất bản</span> : <span className="text-amber-600">Nháp</span>}</td>
                  <td className="p-3 text-xs">{new Date(p.published_at).toLocaleDateString("vi-VN")}</td>
                  <td className="p-3 text-xs text-muted-foreground">{p.views ?? 0}</td>
                  <td className="p-3 text-right space-x-3 whitespace-nowrap">
                    <Link to="/admin/blog/$id" params={{ id: p.id }} className="text-primary underline">Sửa</Link>
                    <button onClick={() => { if (confirm("Xoá bài này?")) remove.mutate(p.id); }} className="text-destructive underline cursor-pointer">Xoá</button>
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Chưa có bài viết. Nhấn “+ Bài viết mới” để bắt đầu.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function slugifyCat(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function CategoriesPanel({ cats }: { cats: BlogCategory[] }) {
  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertBlogCategory);
  const del = useServerFn(adminDeleteBlogCategory);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);

  const add = useMutation({
    mutationFn: (v: any) => upsert({ data: v }),
    onSuccess: () => { toast.success("Đã lưu danh mục"); setName(""); setSlug(""); setTouched(false); qc.invalidateQueries({ queryKey: ["blog-cats"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const rename = useMutation({
    mutationFn: (v: any) => upsert({ data: v }),
    onSuccess: () => { toast.success("Đã cập nhật"); qc.invalidateQueries({ queryKey: ["blog-cats"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá danh mục"); qc.invalidateQueries({ queryKey: ["blog-cats"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <section className="mt-6 bg-card border border-border/60 rounded-lg p-5">
      <h2 className="font-display text-xl">Danh mục</h2>
      <p className="text-xs text-muted-foreground mt-1">Tạo, đổi tên hoặc xoá danh mục. Slug dùng cho URL (a-z, 0-9, dấu gạch).</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <div key={c.id} className="inline-flex items-center gap-2 px-3 py-1.5 border border-border/60 rounded-full text-sm bg-background">
            <input
              defaultValue={c.name}
              onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== c.name) rename.mutate({ id: c.id, slug: c.slug, name: v, sort_order: c.sort_order }); }}
              className="bg-transparent w-28 outline-none"
            />
            <span className="text-xs text-muted-foreground font-mono">/{c.slug}</span>
            <button onClick={() => { if (confirm(`Xoá danh mục "${c.name}"? Các bài viết hiện có sẽ giữ nguyên giá trị slug.`)) remove.mutate(c.id); }} className="text-destructive text-xs hover:underline cursor-pointer">×</button>
          </div>
        ))}
        {cats.length === 0 && <p className="text-sm text-muted-foreground">Chưa có danh mục nào.</p>}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; add.mutate({ name: name.trim(), slug: (slug || slugifyCat(name)).trim(), sort_order: cats.length }); }}
        className="mt-4 flex flex-wrap gap-2 items-center"
      >
        <input placeholder="Tên danh mục" value={name} onChange={(e) => { setName(e.target.value); if (!touched) setSlug(slugifyCat(e.target.value)); }} className="px-3 py-2 border border-input bg-background rounded text-sm" />
        <input placeholder="slug" value={slug} onChange={(e) => { setTouched(true); setSlug(e.target.value); }} className="px-3 py-2 border border-input bg-background rounded text-sm font-mono w-40" />
        <button disabled={add.isPending} className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded disabled:opacity-60">+ Thêm danh mục</button>
      </form>
    </section>
  );
}