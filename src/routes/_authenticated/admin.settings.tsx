import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPaymentSettings } from "@/lib/plans.functions";
import { adminUpdatePaymentSettings } from "@/lib/admin-billing.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsAdmin });

function SettingsAdmin() {
  const get = useServerFn(getPaymentSettings);
  const upd = useServerFn(adminUpdatePaymentSettings);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["pay-settings"], queryFn: () => get() });
  const [form, setForm] = useState<any>({ bank_name: "", bank_account_name: "", bank_account_number: "", qr_image_url: "", instructions: "" });
  useEffect(() => { if (data) setForm({ ...form, ...data }); }, [data]);
  const m = useMutation({ mutationFn: (v:any) => upd({ data: v }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["pay-settings"] }); toast.success("Đã lưu"); } });
  const onQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !user) return;
    try { const url = await uploadImage(f, user.id, "qr"); setForm({ ...form, qr_image_url: url }); } catch (err:any) { toast.error(err.message); }
  };
  return (
    <div>
      <h1 className="font-display text-3xl">Cài đặt thanh toán</h1>
      <form onSubmit={e=>{e.preventDefault();m.mutate(form);}} className="mt-6 max-w-xl space-y-3">
        <input placeholder="Ngân hàng" value={form.bank_name||""} onChange={e=>setForm({...form,bank_name:e.target.value})} className="w-full px-3 py-2 border border-input rounded" />
        <input placeholder="Chủ tài khoản" value={form.bank_account_name||""} onChange={e=>setForm({...form,bank_account_name:e.target.value})} className="w-full px-3 py-2 border border-input rounded" />
        <input placeholder="Số tài khoản" value={form.bank_account_number||""} onChange={e=>setForm({...form,bank_account_number:e.target.value})} className="w-full px-3 py-2 border border-input rounded" />
        <div><label className="text-sm">Ảnh QR</label><input type="file" accept="image/*" onChange={onQr} className="block mt-1 text-sm" />{form.qr_image_url && <img src={form.qr_image_url} alt="qr" className="mt-2 h-40 border rounded" />}</div>
        <textarea placeholder="Hướng dẫn" value={form.instructions||""} onChange={e=>setForm({...form,instructions:e.target.value})} className="w-full px-3 py-2 border border-input rounded h-24" />
        <button disabled={m.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded">Lưu</button>
      </form>
    </div>
  );
}