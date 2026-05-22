import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListBlogPosts, adminDeleteBlogPost, BLOG_CATEGORIES } from "@/lib/blog.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/blog")({ component: AdminBlog });

function AdminBlog() {
  const qc = useQueryClient();
  const list = useServerFn(adminListBlogPosts);
  const del = useServerFn(adminDeleteBlogPost);
  const { data, isLoading } = useQuery({ queryKey: ["a-blog"], queryFn: () => list() });
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
                  <td className="p-3">{BLOG_CATEGORIES.find(c => c.value === p.category)?.label ?? p.category}</td>
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