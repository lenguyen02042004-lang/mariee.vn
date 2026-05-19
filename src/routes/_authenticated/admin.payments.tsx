import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPayments, adminReviewPayment } from "@/lib/admin-billing.functions";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/payments")({ component: PaymentsAdmin });

function PaymentsAdmin() {
  const list = useServerFn(adminListPayments);
  const review = useServerFn(adminReviewPayment);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-payments"], queryFn: () => list() });
  const m = useMutation({ mutationFn: (v: any) => review({ data: v }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-payments"] }); toast.success("Đã cập nhật"); } });
  const [filter, setFilter] = useState<string>("all");
  const rows = data.filter((p: any) => filter === "all" || p.status === filter);
  return (
    <div>
      <h1 className="font-display text-3xl">Thanh toán vendor</h1>
      <div className="mt-4 flex gap-2 text-sm">
        {["all","pending","approved","rejected"].map(s => <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1 rounded ${filter===s?"bg-primary text-primary-foreground":"border border-input"}`}>{s}</button>)}
      </div>
      <div className="mt-6 grid gap-3">
        {rows.map((p: any) => (
          <div key={p.id} className="border border-border/60 rounded p-4">
            <div className="flex justify-between"><div><div className="font-medium">{p.vendors?.name}</div><div className="text-sm text-muted-foreground">Gói: {p.vendor_plans?.name} — {p.amount_vnd.toLocaleString("vi-VN")}đ — Mã: {p.transfer_code||"—"}</div><div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("vi-VN")}</div></div><span className={`px-2 py-1 text-xs rounded ${p.status==="approved"?"bg-green-100 text-green-700":p.status==="rejected"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{p.status}</span></div>
            {p.proof_image_url && <a href={p.proof_image_url} target="_blank" rel="noreferrer"><img src={p.proof_image_url} alt="bill" className="mt-3 max-h-48 rounded border" /></a>}
            {p.admin_note && <p className="mt-2 text-xs text-muted-foreground">Ghi chú: {p.admin_note}</p>}
            {p.status === "pending" && (
              <div className="mt-3 flex gap-2"><button onClick={()=>m.mutate({id:p.id,action:"approve"})} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Duyệt</button><button onClick={()=>{const n=prompt("Lý do từ chối?");if(n!==null)m.mutate({id:p.id,action:"reject",note:n});}} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Từ chối</button></div>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground text-sm">Chưa có thanh toán nào.</p>}
      </div>
    </div>
  );
}