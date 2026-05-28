import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListCategories, adminUpsertCategory, adminDeleteCategory } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categories")({ component: CategoriesAdmin });

function CategoriesAdmin() {
  const list = useServerFn(adminListCategories);
  const up = useServerFn(adminUpsertCategory);
  const del = useServerFn(adminDeleteCategory);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: () => list() });
  const [form, setForm] = useState<any>({ slug: "", label: "", sort_order: 0, is_active: true });
  const [editing, setEditing] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["active-categories"] });
  };
  const mSave = useMutation({
    mutationFn: (v: any) => up({ data: v }),
    onSuccess: () => { toast.success(editing ? "Đã cập nhật" : "Đã thêm danh mục"); invalidate(); reset(); },
    onError: (e: any) => toast.error(e.message),
  });
  const mDel = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  function reset() { setForm({ slug: "", label: "", sort_order: 0, is_active: true }); setEditing(null); }
  function startEdit(c: any) { setForm(c); setEditing(c.id); }

  return (
    <div>
      <h1 className="font-display text-3xl">Danh mục nhà cung cấp</h1>
      <p className="text-sm text-muted-foreground mt-1">Quản lý danh mục dùng trong form và bộ lọc vendor.</p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
        <div className="border border-border/60 rounded-lg overflow-hidden bg-card">
          {isLoading ? <p className="p-6 text-muted-foreground">Đang tải…</p> : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr><th className="p-3">Slug</th><th className="p-3">Tên hiển thị</th><th className="p-3 w-20">Thứ tự</th><th className="p-3 w-24">Trạng thái</th><th className="p-3 text-right">Hành động</th></tr>
              </thead>
              <tbody>
                {data.map((c: any) => (
                  <tr key={c.id} className="border-t border-border/40">
                    <td className="p-3 font-mono text-xs">{c.slug}</td>
                    <td className="p-3">{c.label}</td>
                    <td className="p-3">{c.sort_order}</td>
                    <td className="p-3">{c.is_active ? <span className="text-green-700">Hoạt động</span> : <span className="text-muted-foreground">Ẩn</span>}</td>
                    <td className="p-3 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => startEdit(c)} className="text-primary underline">Sửa</button>
                      <button onClick={() => { if (confirm(`Xoá danh mục "${c.label}"?`)) mDel.mutate(c.id); }} className="text-destructive underline">Xoá</button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chưa có danh mục</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mSave.mutate({ ...form, sort_order: Number(form.sort_order) || 0 }); }} className="border border-border/60 rounded-lg bg-card p-5 h-fit space-y-3">
          <h2 className="font-display text-xl">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h2>
          <label className="block text-sm">
            <span className="text-muted-foreground">Slug *</span>
            <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="vd: photo-album" className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background font-mono text-xs" />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Tên hiển thị *</span>
            <input required value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Thứ tự sắp xếp</span>
            <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Đang hoạt động
          </label>
          <div className="flex gap-2 pt-2">
            <button disabled={mSave.isPending} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{mSave.isPending ? "Đang lưu…" : (editing ? "Cập nhật" : "Thêm")}</button>
            {editing && <button type="button" onClick={reset} className="px-4 py-2 border border-input rounded-md text-sm hover:bg-secondary">Huỷ</button>}
          </div>
        </form>
      </div>
    </div>
  );
}