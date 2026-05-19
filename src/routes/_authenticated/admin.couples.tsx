import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListCouples, adminDeleteCouple } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/couples")({ component: CouplesList });

function CouplesList() {
  const list = useServerFn(adminListCouples);
  const del = useServerFn(adminDeleteCouple);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey:["a-couples"], queryFn:()=>list() });
  const m = useMutation({ mutationFn:(id:string)=>del({ data:{ id } }), onSuccess:()=>{ toast.success("Đã xoá"); qc.invalidateQueries({queryKey:["a-couples"]}); }, onError:(e:any)=>toast.error(e.message) });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Cặp đôi</h1>
        <Link to="/admin/couples/new" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">+ Thêm</Link>
      </div>
      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left"><tr><th className="p-3">Cặp đôi</th><th className="p-3">Slug</th><th className="p-3">Ngày cưới</th><th className="p-3">Hiển thị</th><th className="p-3"></th></tr></thead>
            <tbody>
              {(data ?? []).map((c:any)=>(
                <tr key={c.id} className="border-t border-border/40">
                  <td className="p-3 font-medium">{c.bride_name} & {c.groom_name}</td>
                  <td className="p-3 text-muted-foreground">/{c.slug}</td>
                  <td className="p-3">{c.wedding_date ?? "—"}</td>
                  <td className="p-3">{c.is_published?"✓":"—"}</td>
                  <td className="p-3 text-right space-x-3">
                    <Link to="/admin/couples/$id" params={{id:c.id}} className="text-primary underline">Sửa</Link>
                    <button onClick={()=>{ if(confirm("Xoá?")) m.mutate(c.id); }} className="text-destructive underline">Xoá</button>
                  </td>
                </tr>
              ))}
              {(data ?? []).length===0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chưa có cặp đôi</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
