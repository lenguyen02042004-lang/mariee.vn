import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListVendors, adminSetVendorApproval, adminDeleteVendor } from "@/lib/admin.functions";
import { toast } from "sonner";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới",
  photography: "Chụp ảnh",
  videography: "Quay phim",
  wedding_planner: "Tổ chức cưới",
  makeup: "Trang điểm",
  attire: "Trang phục",
  flowers: "Hoa cưới",
  catering: "Ẩm thực",
  music: "Âm nhạc",
  decor: "Trang trí",
  invitation: "Thiệp cưới",
  other: "Khác",
};

export const Route = createFileRoute("/_authenticated/admin/vendors")({ component: AdminVendors });

function AdminVendors() {
  const qc = useQueryClient();
  const list = useServerFn(adminListVendors);
  const setA = useServerFn(adminSetVendorApproval);
  const del = useServerFn(adminDeleteVendor);
  const { data, isLoading } = useQuery({ queryKey:["a-vendors"], queryFn:()=>list() });
  const update = useMutation({ mutationFn:(p:any)=>setA({data:p}), onSuccess:()=>{ toast.success("Đã cập nhật"); qc.invalidateQueries({queryKey:["a-vendors"]}); }});
  const remove = useMutation({ mutationFn:(id:string)=>del({data:{id}}), onSuccess:()=>{ toast.success("Đã xoá"); qc.invalidateQueries({queryKey:["a-vendors"]}); }});
  return (
    <div>
      <h1 className="font-display text-3xl">Nhà cung cấp</h1>
      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left"><tr><th className="p-3">Tên</th><th className="p-3">Danh mục</th><th className="p-3">Liên hệ</th><th className="p-3">Duyệt</th><th className="p-3">Nổi bật</th><th className="p-3"></th></tr></thead>
            <tbody>
              {(data ?? []).map((v:any)=>(
                <tr key={v.id} className="border-t border-border/40">
                  <td className="p-3"><div className="font-medium">{v.name}</div><div className="text-xs text-muted-foreground">/{v.slug}</div></td>
                  <td className="p-3">{CAT_LABEL[v.category] ?? v.category}</td>
                  <td className="p-3 text-xs">{v.email}<br/>{v.phone}</td>
                  <td className="p-3"><label className="sr-only">Duyệt vendor</label><input aria-label="Duyệt vendor" type="checkbox" checked={v.is_approved} onChange={e=>update.mutate({id:v.id,is_approved:e.target.checked,is_featured:v.is_featured})} /></td>
                  <td className="p-3"><label className="sr-only">Đánh dấu nổi bật</label><input aria-label="Đánh dấu nổi bật" type="checkbox" checked={v.is_featured} onChange={e=>update.mutate({id:v.id,is_approved:v.is_approved,is_featured:e.target.checked})} /></td>
                  <td className="p-3 text-right space-x-2">
                    <Link to="/admin/vendors/$id" params={{ id: v.id }} className="text-primary underline">Sửa</Link>
                    <button onClick={()=>{ if(confirm("Xoá?")) remove.mutate(v.id); }} className="text-destructive underline">Xoá</button>
                  </td>
                </tr>
              ))}
              {(data ?? []).length===0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Chưa có nhà cung cấp</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
