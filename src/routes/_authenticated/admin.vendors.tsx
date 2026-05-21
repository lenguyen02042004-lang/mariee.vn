import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListVendors, adminSetVendorApproval, adminDeleteVendor, adminPublishVendor } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/vendors")({ component: AdminVendors });

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới", photography: "Chụp ảnh cưới", videography: "Quay phim cưới",
  wedding_planner: "Wedding planner", makeup: "Trang điểm", attire: "Trang phục",
  flowers: "Hoa cưới", catering: "Ẩm thực", music: "Âm nhạc",
  decor: "Trang trí", invitation: "Thiệp cưới", other: "Khác",
};

function AdminVendors() {
  const qc = useQueryClient();
  const list = useServerFn(adminListVendors);
  const setA = useServerFn(adminSetVendorApproval);
  const del = useServerFn(adminDeleteVendor);
  const pub = useServerFn(adminPublishVendor);
  const { data, isLoading } = useQuery({ queryKey:["a-vendors"], queryFn:()=>list() });
  const update = useMutation({ mutationFn:(p:any)=>setA({data:p}), onSuccess:()=>{ toast.success("Đã cập nhật"); qc.invalidateQueries({queryKey:["a-vendors"]}); }});
  const remove = useMutation({ mutationFn:(id:string)=>del({data:{id}}), onSuccess:()=>{ toast.success("Đã xoá"); qc.invalidateQueries({queryKey:["a-vendors"]}); }});
  const publish = useMutation({ mutationFn:(id:string)=>pub({data:{id}}), onSuccess:()=>{ toast.success("Đã xuất bản bản công khai"); qc.invalidateQueries({queryKey:["a-vendors"]}); }, onError:(e:any)=>toast.error(e.message) });
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Nhà cung cấp</h1>
          <p className="text-sm text-muted-foreground mt-1">Tạo, sửa, duyệt và xuất bản vendor.</p>
        </div>
        <Link to="/admin/vendors/new" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">+ Thêm vendor</Link>
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
              {(data ?? []).map((v:any)=>(
                <tr key={v.id} className="border-t border-border/40">
                  <td className="p-3">
                    <div className="font-medium">{v.name}</div>
                    <Link to="/vendors/$slug" params={{ slug: v.slug }} target="_blank" className="text-xs text-primary underline">/vendors/{v.slug} ↗</Link>
                  </td>
                  <td className="p-3">{CAT_LABEL[v.category] ?? v.category}</td>
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
              {(data ?? []).length===0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Chưa có nhà cung cấp</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
