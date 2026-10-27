import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitRsvp } from "@/lib/couples.functions";
import { toast } from "sonner";

export function RsvpForm({ coupleId }: { coupleId: string }) {
  const submit = useServerFn(submitRsvp);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const startedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({ data: {
        couple_id: coupleId,
        guest_name: String(f.get("guest_name") || ""),
        guest_phone: String(f.get("guest_phone") || ""),
        guest_email: String(f.get("guest_email") || ""),
        attending: f.get("attending") === "yes",
        num_guests: Number(f.get("num_guests") || 1),
        message: String(f.get("message") || ""),
        side: (f.get("side") as "bride" | "groom" | "both") || "both",
        _hp: String(f.get("website") || ""),
        _ts: startedAt.current,
      }});
      setDone(true);
      toast.success("Cảm ơn bạn đã xác nhận!");
    } catch (err) {
      toast.error((err as Error).message || "Có lỗi xảy ra");
    } finally { setLoading(false); }
  }

  if (done) return (
    <div className="text-center py-12">
      <div className="font-script text-5xl text-primary mb-3">Cảm ơn bạn</div>
      <p className="text-muted-foreground">Lời chúc của bạn đã được gửi tới cô dâu chú rể.</p>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl mx-auto">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="grid md:grid-cols-2 gap-5">
        <input name="guest_name" required maxLength={120} placeholder="Họ và tên *" className="w-full px-5 py-3 bg-card border border-border rounded-md focus:ring-2 focus:ring-primary outline-none" />
        <input name="guest_phone" maxLength={30} placeholder="Số điện thoại" className="w-full px-5 py-3 bg-card border border-border rounded-md focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <input name="guest_email" type="email" maxLength={160} placeholder="Email" className="w-full px-5 py-3 bg-card border border-border rounded-md focus:ring-2 focus:ring-primary outline-none" />
      <div className="grid md:grid-cols-3 gap-5">
        <select name="attending" defaultValue="yes" className="w-full px-5 py-3 bg-card border border-border rounded-md outline-none">
          <option value="yes">Tôi sẽ tham dự</option>
          <option value="no">Rất tiếc không thể tham dự</option>
        </select>
        <select name="num_guests" defaultValue="1" className="w-full px-5 py-3 bg-card border border-border rounded-md outline-none">
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} khách</option>)}
        </select>
        <select name="side" defaultValue="both" className="w-full px-5 py-3 bg-card border border-border rounded-md outline-none">
          <option value="bride">Khách cô dâu</option>
          <option value="groom">Khách chú rể</option>
          <option value="both">Khách chung</option>
        </select>
      </div>
      <textarea name="message" rows={4} maxLength={500} placeholder="Lời nhắn hoặc chúc mừng gửi tới cô dâu & chú rể..." className="w-full px-5 py-3.5 bg-secondary/30 border border-border/80 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/60 outline-none resize-none font-serif text-sm transition" />
      <div className="text-center pt-2">
        <button disabled={loading} type="submit" className="w-full sm:w-auto px-12 py-4 rounded-full bg-[#54121B] hover:bg-[#6E1A24] border border-gold/40 text-white uppercase tracking-[0.25em] text-xs font-serif font-medium hover:scale-105 transition-all shadow-soft hover:shadow-elegant disabled:opacity-60 cursor-pointer">
          {loading ? "Đang gửi xác nhận..." : "Gửi xác nhận tham dự"}
        </button>
      </div>
    </form>
  );
}
