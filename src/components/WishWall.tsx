import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitWish } from "@/lib/couples.functions";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkles, Send, MessageSquareHeart } from "lucide-react";

export function WishWall({ coupleId, wishes }: { coupleId: string; wishes: any[] }) {
  const router = useRouter();
  const submit = useServerFn(submitWish);
  const [loading, setLoading] = useState(false);
  const startedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({
        data: {
          couple_id: coupleId,
          guest_name: String(f.get("guest_name") || ""),
          message: String(f.get("message") || ""),
          _hp: String(f.get("website") || ""),
          _ts: startedAt.current,
        },
      });
      toast.success("Cảm ơn bạn đã gửi lời chúc phúc ý nghĩa!");
      (e.target as HTMLFormElement).reset();
      router.invalidate();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 items-start">
      {/* Wish submission form styled like royal guestbook */}
      <form
        onSubmit={onSubmit}
        className="space-y-5 bg-card rounded-3xl p-8 sm:p-10 border border-gold/35 shadow-elegant relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold/10 to-transparent pointer-events-none" />

        <div>
          <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-gold font-medium">
            GUESTBOOK
          </span>
          <h3 className="font-display text-2xl sm:text-3xl text-foreground font-light mt-1">
            Gửi lời chúc phúc
          </h3>
          <p className="text-xs text-muted-foreground font-serif mt-1">
            Để lại những dòng tâm tình gửi gắm đến ngày trọng đại của đôi uyên ương
          </p>
        </div>

        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <div className="space-y-1.5">
          <label className="text-xs font-serif uppercase tracking-wider text-foreground/80">
            Họ và tên của bạn *
          </label>
          <input
            name="guest_name"
            required
            maxLength={120}
            placeholder="Ví dụ: Hoàng Anh & Mai Lan"
            className="w-full px-4 py-3 bg-secondary/30 border border-border/80 rounded-xl outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/60 text-sm font-serif transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-serif uppercase tracking-wider text-foreground/80">
            Lời chúc phúc chân thành *
          </label>
          <textarea
            name="message"
            required
            rows={5}
            maxLength={500}
            placeholder="Chúc hai bạn trăm năm hạnh phúc, tình yêu luôn đơm hoa kết trái..."
            className="w-full px-4 py-3 bg-secondary/30 border border-border/80 rounded-xl outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/60 text-sm font-serif resize-none transition"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#54121B] hover:bg-[#6E1A24] text-white border border-gold/40 text-xs uppercase tracking-[0.25em] font-serif font-medium shadow-soft hover:shadow-elegant transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <span>Đang gửi lời chúc…</span>
          ) : (
            <>
              <Send size={14} className="text-gold" />
              <span>Gửi lời chúc phúc</span>
            </>
          )}
        </button>
      </form>

      {/* Wish list stream */}
      <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
        {wishes.length === 0 ? (
          <div className="bg-card/70 border border-gold/25 rounded-3xl p-10 text-center">
            <MessageSquareHeart size={36} className="text-gold/60 mx-auto mb-3" />
            <p className="font-script text-2xl text-foreground">Chưa có lời chúc nào</p>
            <p className="text-xs text-muted-foreground font-serif mt-1">
              Hãy là vị khách quý đầu tiên lưu bút chúc phúc cho đôi bạn trẻ!
            </p>
          </div>
        ) : (
          wishes.map((w) => (
            <div
              key={w.id}
              className="group bg-card rounded-2xl p-6 border border-gold/25 shadow-soft hover:border-gold/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-script text-2xl sm:text-3xl text-primary font-normal">
                  {w.guest_name}
                </p>
                <span className="text-[10px] text-muted-foreground font-serif tracking-wider">
                  {new Date(w.created_at).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm font-serif text-foreground/85 whitespace-pre-line leading-relaxed italic">
                “{w.message}”
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
