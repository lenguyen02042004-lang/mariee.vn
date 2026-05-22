import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPlans, adminUpsertPlan, adminDeletePlan, adminUpdatePaymentSettings } from "@/lib/admin-billing.functions";
import { getPaymentSettings } from "@/lib/plans.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/plans")({ component: PlansAdmin });

function PlansAdmin() {
  const list = useServerFn(adminListPlans);
  const upsert = useServerFn(adminUpsertPlan);
  const del = useServerFn(adminDeletePlan);
  const qc = useQueryClient();
  const { data: plans = [] } = useQuery({ queryKey: ["admin-plans"], queryFn: () => list() });
  const m = useMutation({
    mutationFn: (v: any) => upsert({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-plans"] }); toast.success("Đã lưu"); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const dm = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-plans"] }); toast.success("Đã xóa"); } });
  const [editing, setEditing] = useState<any>(null);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Gói thành viên & Thanh toán</h1>
          <p className="text-sm text-muted-foreground mt-1">Tạo gói cho vendor và cấu hình thông tin nhận thanh toán.</p>
        </div>
        <button onClick={() => setEditing({ name: "", slug: "", description: "", price_vnd: 0, billing_months: 1, features: [], sort_order: 99, is_active: true })} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">+ Tạo gói</button>
      </div>
      <div className="mt-6 grid gap-3">
        {plans.map((p: any) => (
          <div key={p.id} className="border border-border/60 rounded p-4 flex justify-between items-center">
            <div><div className="font-medium">{p.name} <span className="text-xs text-muted-foreground">/{p.slug}</span></div><div className="text-sm text-muted-foreground">{p.price_vnd.toLocaleString("vi-VN")}đ / {p.billing_months}t — {p.is_active?"Đang bán":"Tạm ẩn"}</div></div>
            <div className="flex gap-2"><button onClick={() => setEditing(p)} className="text-sm text-primary">Sửa</button><button onClick={() => confirm("Xóa gói?") && dm.mutate(p.id)} className="text-sm text-destructive">Xóa</button></div>
          </div>
        ))}
      </div>

      <PaymentSettingsPanel />

      {editing && (
        <form onSubmit={e => { e.preventDefault(); m.mutate({ ...editing, features: typeof editing.features === "string" ? editing.features.split("\n").filter(Boolean) : editing.features }); }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card max-w-lg w-full rounded-lg p-6 space-y-3 max-h-[90vh] overflow-auto">
            <h2 className="font-display text-2xl">{editing.id?"Sửa gói":"Tạo gói"}</h2>
            <input required placeholder="Tên gói" value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="w-full px-3 py-2 border border-input rounded" />
            <input required placeholder="slug (a-z, -)" value={editing.slug} onChange={e=>setEditing({...editing,slug:e.target.value})} className="w-full px-3 py-2 border border-input rounded" />
            <textarea placeholder="Mô tả" value={editing.description||""} onChange={e=>setEditing({...editing,description:e.target.value})} className="w-full px-3 py-2 border border-input rounded" />
            <div className="grid grid-cols-2 gap-2">
              <input required type="number" min={0} placeholder="Giá VND" value={editing.price_vnd} onChange={e=>setEditing({...editing,price_vnd:+e.target.value})} className="px-3 py-2 border border-input rounded" />
              <input required type="number" min={1} placeholder="Số tháng" value={editing.billing_months} onChange={e=>setEditing({...editing,billing_months:+e.target.value})} className="px-3 py-2 border border-input rounded" />
            </div>
            <textarea placeholder="Tính năng (mỗi dòng 1 mục)" value={Array.isArray(editing.features)?editing.features.join("\n"):editing.features} onChange={e=>setEditing({...editing,features:e.target.value})} className="w-full px-3 py-2 border border-input rounded h-32" />
            <input type="number" placeholder="Thứ tự" value={editing.sort_order} onChange={e=>setEditing({...editing,sort_order:+e.target.value})} className="w-full px-3 py-2 border border-input rounded" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={e=>setEditing({...editing,is_active:e.target.checked})} /> Đang bán</label>
            <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={()=>setEditing(null)} className="px-4 py-2 border border-input rounded">Hủy</button><button type="submit" disabled={m.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded">Lưu</button></div>
          </div>
        </form>
      )}
    </div>
  );
}