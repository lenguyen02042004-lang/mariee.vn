import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitWish } from "@/lib/couples.functions";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export function WishWall({ coupleId, wishes }: { coupleId: string; wishes: any[] }) {
  const router = useRouter();
  const submit = useServerFn(submitWish);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({ data: {
        couple_id: coupleId,
        guest_name: String(f.get("guest_name") || ""),
        message: String(f.get("message") || ""),
      }});
      toast.success("Cảm ơn lời chúc của bạn!");
      (e.target as HTMLFormElement).reset();
      router.invalidate();
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setLoading(false); }
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <form onSubmit={onSubmit} className="space-y-4 bg-card rounded-lg p-6 shadow-soft">
        <h3 className="font-display text-2xl">Gửi lời chúc</h3>
        <input name="guest_name" required maxLength={120} placeholder="Tên của bạn *" className="w-full px-4 py-3 border border-border rounded-md outline-none focus:ring-2 focus:ring-primary" />
        <textarea name="message" required rows={5} maxLength={500} placeholder="Lời chúc của bạn..." className="w-full px-4 py-3 border border-border rounded-md outline-none focus:ring-2 focus:ring-primary resize-none" />
        <button disabled={loading} className="px-8 py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-xs disabled:opacity-60">
          {loading ? "Đang gửi…" : "Gửi lời chúc"}
        </button>
      </form>
      <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
        {wishes.length === 0 && <p className="text-sm text-muted-foreground italic">Hãy là người đầu tiên gửi lời chúc đến cô dâu chú rể.</p>}
        {wishes.map((w) => (
          <div key={w.id} className="bg-card/60 border border-border/40 rounded-lg p-5">
            <p className="font-script text-2xl text-primary">{w.guest_name}</p>
            <p className="mt-2 text-foreground/80 whitespace-pre-line">{w.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString("vi-VN")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
