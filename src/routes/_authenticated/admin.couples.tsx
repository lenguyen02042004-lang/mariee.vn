import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListCouples, adminDeleteCouple, adminSetCouplePublish } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/couples")({ component: CouplesList });

function CouplesList() {
  const list = useServerFn(adminListCouples);
  const del = useServerFn(adminDeleteCouple);
  const pub = useServerFn(adminSetCouplePublish);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey:["a-couples"], queryFn:()=>list() });
  const m = useMutation({ mutationFn:(id:string)=>del({ data:{ id } }), onSuccess:()=>{ toast.success("Đã xoá"); qc.invalidateQueries({queryKey:["a-couples"]}); }, onError:(e:any)=>toast.error(e.message) });
  const mPub = useMutation({ mutationFn:(p:{id:string;is_published:boolean})=>pub({ data:p }), onSuccess:()=>{ toast.success("Đã cập nhật"); qc.invalidateQueries({queryKey:["a-couples"]}); }, onError:(e:any)=>toast.error(e.message) });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "pub" | "draft">("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((c: any) => {
      if (status === "pub" && !c.is_published) return false;
      if (status === "draft" && c.is_published) return false;
      if (!term) return true;
      return [c.bride_name, c.groom_name, c.slug].filter(Boolean).some((s: string) => s.toLowerCase().includes(term));
    });
  }, [data, q, status]);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Cặp đôi</h1>
          <p className="text-sm text-muted-foreground mt-1">Hiển thị {filtered.length}/{(data ?? []).length}</p>
        </div>
        <Link to="/admin/couples/new" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">+ Thêm</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Tìm theo tên cô dâu, chú rể, slug…" className="flex-1 min-w-[240px] px-3 py-2 rounded-md border border-input bg-background text-sm" />
        <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="px-3 py-2 rounded-md border border-input bg-background text-sm">
          <option value="">Mọi trạng thái</option>
          <option value="pub">Đang công khai</option>
          <option value="draft">Lưu nháp</option>
        </select>
        {(q || status) && <button onClick={()=>{ setQ(""); setStatus(""); }} className="px-3 py-2 text-sm border border-input rounded-md hover:bg-secondary">Xoá lọc</button>}
      </div>
      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left"><tr><th className="p-3">Cặp đôi</th><th className="p-3">Slug</th><th className="p-3">Ngày cưới</th><th className="p-3">Hiển thị</th><th className="p-3 text-right">Hành động</th></tr></thead>
            <tbody>
              {filtered.map((c:any)=>(
                <tr key={c.id} className="border-t border-border/40">
                  <td className="p-3 font-medium">{c.bride_name} & {c.groom_name}</td>
                  <td className="p-3 text-muted-foreground">/{c.slug}</td>
                  <td className="p-3">{c.wedding_date ?? "—"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => mPub.mutate({ id: c.id, is_published: !c.is_published })}
                      className={`px-2 py-1 text-xs rounded ${c.is_published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {c.is_published ? "Công khai" : "Lưu nháp"}
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <Link to="/admin/couples/$id" params={{id:c.id}} className="text-primary underline">Sửa</Link>
                    <button onClick={()=>{ if(confirm("Xoá?")) m.mutate(c.id); }} className="text-destructive underline">Xoá</button>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Không có cặp đôi phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
