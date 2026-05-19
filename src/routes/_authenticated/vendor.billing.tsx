import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { vendorListMyPayments, vendorSubmitPayment } from "@/lib/vendor-billing.functions";
import { listPlans, getPaymentSettings } from "@/lib/plans.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/billing")({ component: VendorBilling });

function VendorBilling() {
  const my = useServerFn(vendorListMyPayments);
  const sub = useServerFn(vendorSubmitPayment);
  const plansFn = useServerFn(listPlans);
  const settingsFn = useServerFn(getPaymentSettings);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["my-billing"], queryFn: () => my() });
  const { data: plans = [] } = useQuery({ queryKey: ["plans-pub"], queryFn: () => plansFn() });
  const { data: settings } = useQuery({ queryKey: ["pay-settings-pub"], queryFn: () => settingsFn() });
  const [planId, setPlanId] = useState("");
  const [code, setCode] = useState("");
  const [proof, setProof] = useState("");
  const m = useMutation({
    mutationFn: (v:any) => sub({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-billing"] }); toast.success("Đã gửi, chờ admin duyệt."); setPlanId(""); setCode(""); setProof(""); },
    onError: (e:any) => toast.error(e.message),
  });
  const onProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !user) return;
    try { setProof(await uploadImage(f, user.id, "bills")); toast.success("Tải ảnh thành công"); } catch (err:any) { toast.error(err.message); }
  };
  if (!data?.vendor) return <div className="text-muted-foreground">Bạn chưa có hồ sơ vendor. <Link to="/vendor" className="text-primary underline">Tạo hồ sơ</Link></div>;
  return (
    <div className="space-y-8">
      <div><h1 className="font-display text-3xl">Gói thành viên & thanh toán</h1>
        {data.subscription && <p className="mt-2 text-sm">Đang dùng: <b>{(data.subscription as any).vendor_plans?.name}</b> — hết hạn {new Date((data.subscription as any).expires_at).toLocaleDateString("vi-VN")}</p>}
      </div>
      <section className="border border-border/60 rounded p-6">
        <h2 className="font-display text-xl">Đăng ký gói mới</h2>
        <form onSubmit={e=>{e.preventDefault();if(!planId)return toast.error("Chọn gói");m.mutate({plan_id:planId,transfer_code:code,proof_image_url:proof});}} className="mt-4 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <select required value={planId} onChange={e=>setPlanId(e.target.value)} className="w-full px-3 py-2 border border-input rounded">
              <option value="">— Chọn gói —</option>
              {plans.map((p:any) => <option key={p.id} value={p.id}>{p.name} — {p.price_vnd.toLocaleString("vi-VN")}đ / {p.billing_months}t</option>)}
            </select>
            <input placeholder="Mã giao dịch (nếu có)" value={code} onChange={e=>setCode(e.target.value)} className="w-full px-3 py-2 border border-input rounded" />
            <div><label className="text-sm">Ảnh bill chuyển khoản</label><input type="file" accept="image/*" onChange={onProof} className="block mt-1 text-sm" />{proof && <img src={proof} alt="bill" className="mt-2 h-32 border rounded" />}</div>
            <button disabled={m.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">Gửi yêu cầu</button>
          </div>
          <div className="bg-secondary/40 p-4 rounded text-sm">
            <h3 className="font-display text-lg">Thông tin chuyển khoản</h3>
            {settings?.bank_name && <p>Ngân hàng: <b>{settings.bank_name}</b></p>}
            {settings?.bank_account_name && <p>Chủ TK: {settings.bank_account_name}</p>}
            {settings?.bank_account_number && <p>Số TK: <b>{settings.bank_account_number}</b></p>}
            {settings?.qr_image_url && <img src={settings.qr_image_url} alt="QR" className="mt-3 h-48" />}
            {settings?.instructions && <p className="mt-2 text-muted-foreground">{settings.instructions}</p>}
          </div>
        </form>
      </section>
      <section><h2 className="font-display text-xl">Lịch sử thanh toán</h2>
        <div className="mt-3 grid gap-2">
          {data.payments.map((p:any) => (
            <div key={p.id} className="border border-border/60 rounded p-3 flex justify-between text-sm"><div><div>{(p as any).vendor_plans?.name} — {p.amount_vnd.toLocaleString("vi-VN")}đ</div><div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("vi-VN")}</div>{p.admin_note && <div className="text-xs">Ghi chú: {p.admin_note}</div>}</div><span className={`px-2 py-1 text-xs rounded h-fit ${p.status==="approved"?"bg-green-100 text-green-700":p.status==="rejected"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{p.status}</span></div>
          ))}
          {data.payments.length === 0 && <p className="text-muted-foreground text-sm">Chưa có thanh toán nào.</p>}
        </div>
      </section>
    </div>
  );
}