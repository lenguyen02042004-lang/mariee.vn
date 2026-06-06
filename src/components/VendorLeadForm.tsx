import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitVendorLead } from "@/lib/vendors.functions";
import { toast } from "sonner";

export function VendorLeadForm({
  vendorId,
  productTitle,
  onSubmitted,
}: {
  vendorId: string;
  productTitle?: string;
  onSubmitted?: () => void;
}) {
  const submit = useServerFn(submitVendorLead);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const startedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    try {
        const rawMsg = String(f.get("message") || "");
        const message = productTitle
          ? `[Quan tâm gói: ${productTitle}]\n${rawMsg}`.trim()
          : rawMsg;
      await submit({ data: {
        vendor_id: vendorId,
        guest_name: String(f.get("guest_name") || ""),
        guest_phone: String(f.get("guest_phone") || ""),
        guest_email: String(f.get("guest_email") || ""),
        event_date: String(f.get("event_date") || ""),
          message,
        _hp: String(f.get("website") || ""),
        _ts: startedAt.current,
      }});
      setDone(true);
      toast.success("Đã gửi yêu cầu, vendor sẽ liên hệ lại sớm!");
        onSubmitted?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setLoading(false); }
  }

  if (done) return (
    <div className="text-center py-12">
      <p className="font-script text-4xl text-primary mb-2">Cảm ơn bạn</p>
      <p className="text-muted-foreground">Chúng tôi sẽ liên hệ trong thời gian sớm nhất.</p>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="grid md:grid-cols-2 gap-4">
        <input name="guest_name" required maxLength={120} placeholder="Họ tên *" className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
        <input name="guest_phone" maxLength={30} placeholder="Số điện thoại" className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <input name="guest_email" type="email" maxLength={160} placeholder="Email" className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
        <input name="event_date" type="date" className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <textarea name="message" rows={4} maxLength={1000} placeholder="Mô tả nhu cầu của bạn..." className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:ring-2 focus:ring-primary resize-none" />
      {productTitle && (
        <p className="text-xs text-muted-foreground -mt-2">
          Yêu cầu sẽ được gắn kèm gói: <span className="text-primary font-medium">{productTitle}</span>
        </p>
      )}
      <button disabled={loading} className="w-full md:w-auto px-10 py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-xs hover:bg-primary/90 active:scale-[0.98] transition disabled:opacity-60">
        {loading ? "Đang gửi…" : "Gửi yêu cầu tư vấn"}
      </button>
    </form>
  );
}
