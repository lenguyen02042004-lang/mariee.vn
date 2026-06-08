import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { resolveImg } from "@/lib/image-map";
import { Copy, Check, Gift } from "lucide-react";
import { toast } from "sonner";

type Side = {
  label: string;
  holder?: string | null;
  bank?: string | null;
  account?: string | null;
  qrUrl?: string | null;
};

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          toast.success("Đã sao chép số tài khoản");
          setTimeout(() => setDone(false), 1600);
        } catch {
          toast.error("Không sao chép được — hãy bấm giữ để chọn.");
        }
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 active:scale-95"
      aria-label="Sao chép số tài khoản"
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
      {done ? "Đã chép" : "Sao chép"}
    </button>
  );
}

function GiftCard({ side }: { side: Side }) {
  const [open, setOpen] = useState(false);
  const hasInfo = !!(side.account || side.qrUrl);
  if (!hasInfo) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant hover:border-primary/40 active:translate-y-0 cursor-pointer"
        aria-label={`Mở hộp mừng cưới ${side.label}`}
      >
        {/* ribbon top */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-16 h-3 bg-primary/80 rounded-b-md" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-10 bg-primary/80" />

        <div className="mx-auto mt-2 w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:rotate-3">
          <Gift size={38} strokeWidth={1.5} />
        </div>
        <p className="font-script text-2xl text-primary mt-4">{side.label}</p>
        <p className="text-sm text-muted-foreground mt-2">Nhấn vào hộp quà để xem thông tin chuyển khoản</p>
        <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.22em] text-primary/80 border-b border-primary/30 pb-0.5">
          Mở hộp ✶
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center">
              <span className="font-script text-primary text-3xl block mb-1">{side.label}</span>
              Hộp mừng cưới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            {side.qrUrl && (
              <div className="flex flex-col items-center">
                <img
                  src={resolveImg(side.qrUrl)!}
                  alt={`QR chuyển khoản ${side.label}`}
                  className="w-56 h-56 object-contain rounded-lg border border-border/60 bg-white p-2"
                  loading="lazy"
                />
                <p className="text-xs text-muted-foreground mt-2">Quét mã QR bằng app ngân hàng</p>
              </div>
            )}
            {side.account && (
              <div className="bg-secondary/40 rounded-lg p-4 text-center space-y-1">
                {side.holder && <p className="font-medium">{side.holder}</p>}
                {side.bank && <p className="text-sm text-muted-foreground">{side.bank}</p>}
                <p className="font-display text-2xl tabular-nums tracking-wide">{side.account}</p>
                <div className="pt-2">
                  <CopyBtn value={side.account} />
                </div>
              </div>
            )}
            <p className="text-[11px] text-center text-muted-foreground italic">
              Cảm ơn bạn đã gửi lời chúc và tình yêu thương đến chúng tôi 💛
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GiftBoxes({ bride, groom }: { bride: Side; groom: Side }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      <GiftCard side={bride} />
      <GiftCard side={groom} />
    </div>
  );
}