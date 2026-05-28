import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListVendors, adminSetVendorApproval, adminDeleteVendor, adminPublishVendor, listActiveCategories } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/vendors")({ component: AdminVendors });

function AdminVendors() {
  const qc = useQueryClient();
  const list = useServerFn(adminListVendors);
  const setA = useServerFn(adminSetVendorApproval);
  const del = useServerFn(adminDeleteVendor);
  const pub = useServerFn(adminPublishVendor);
  const cats = useServerFn(listActiveCategories);
  const { data, isLoading } = useQuery({ queryKey:["a-vendors"], queryFn:()=>list() });
  const { data: categories = [] } = useQuery({ queryKey:["active-categories"], queryFn:()=>cats() });
  const catLabel = useMemo(() => {
    const m: Record<string,string> = {};
    (categories as any[]).forEach((c) => { m[c.slug] = c.label; });
    return m;
  }, [categories]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState<"" | "approved" | "draft">("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((v: any) => {
      if (cat && v.category !== cat) return false;
      if (status === "approved" && !v.is_approved) return false;
      if (status === "draft" && v.is_approved) return false;
      if (!term) return true;
      return [v.name, v.slug, v.email, v.phone, v.city].filter(Boolean).some((s: string) => s.toLowerCase().includes(term));
    });
  }, [data, q, cat, status]);
  const update = useMutation({ mutationFn:(p:any)=>setA({data:p}), onSuccess:()=>{ toast.success("Đã cập nhật"); qc.invalidateQueries({queryKey:["a-vendors"]}); }});
  const remove = useMutation({ mutationFn:(id:string)=>del({data:{id}}), onSuccess:()=>{ toast.success("Đã xoá"); qc.invalidateQueries({queryKey:["a-vendors"]}); }});
  const publish = useMutation({ mutationFn:(id:string)=>pub({data:{id}}), onSuccess:()=>{ toast.success("Đã xuất bản bản công khai"); qc.invalidateQueries({queryKey:["a-vendors"]}); }, onError:(e:any)=>toast.error(e.message) });
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Nhà cung cấp</h1>
          <p className="text-sm text-muted-foreground mt-1">Tạo, sửa, duyệt và xuất bản vendor. Hiển thị {filtered.length}/{(data ?? []).length}.</p>
        </div>
        <Link to="/admin/vendors/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">+ Thêm vendor</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Tìm theo tên, slug, email, SĐT, thành phố…" className="flex-1 min-w-[220px] px-3 py-2 rounded-md border border-input bg-background text-sm" />
        <select value={cat} onChange={(e)=>setCat(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background text-sm">
          <option value="">Tất cả danh mục</option>
          {(categories as any[]).map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
        <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="px-3 py-2 rounded-md border border-input bg-background text-sm">
          <option value="">Mọi trạng thái</option>
          <option value="approved">Đã duyệt</option>
          <option value="draft">Lưu nháp</option>
        </select>
        {(q || cat || status) && <button onClick={()=>{ setQ(""); setCat(""); setStatus(""); }} className="px-3 py-2 text-sm border border-input rounded-md hover:bg-secondary">Xoá lọc</button>}
      </div>
      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="p-3">Vendor</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3">Liên hệ</th>
                <th className="p-3">Duyệt</th>
                <th className="p-3">Nổi bật</th>
                <th className="p-3">Lịch sử</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v:any)=>(
                <tr key={v.id} className="border-t border-border/40">
                  <td className="p-3">
                    <div className="font-medium">{v.name}</div>
                    <Link to="/vendors/$slug" params={{ slug: v.slug }} target="_blank" className="text-xs text-primary underline">/vendors/{v.slug} ↗</Link>
                  </td>
                  <td className="p-3">{catLabel[v.category] ?? v.category}</td>
                  <td className="p-3 text-xs">{v.email}<br/>{v.phone}</td>
                  <td className="p-3"><input type="checkbox" checked={v.is_approved} onChange={e=>update.mutate({id:v.id,is_approved:e.target.checked,is_featured:v.is_featured})} /></td>
                  <td className="p-3"><input type="checkbox" checked={v.is_featured} onChange={e=>update.mutate({id:v.id,is_approved:v.is_approved,is_featured:e.target.checked})} /></td>
                  <td className="p-3 text-xs text-muted-foreground">
                    <div>Sửa: {v.updated_at ? new Date(v.updated_at).toLocaleString("vi-VN") : "—"}</div>
                    <div>Xuất bản: {v.published_at ? new Date(v.published_at).toLocaleString("vi-VN") : <span className="text-amber-600">chưa</span>}</div>
                  </td>
                  <td className="p-3 text-right space-x-3 whitespace-nowrap">
                    <Link to="/admin/vendors/$id" params={{ id: v.id }} className="text-primary underline">Sửa</Link>
                    <button onClick={()=>publish.mutate(v.id)} className="text-primary underline">Xuất bản</button>
                    <button onClick={()=>{ if(confirm("Xoá vendor này?")) remove.mutate(v.id); }} className="text-destructive underline">Xoá</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Không có vendor phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
