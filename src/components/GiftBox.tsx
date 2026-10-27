import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { resolveImg } from "@/lib/image-map";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Side = {
  label: string;
  holder?: string | null;
  bank?: string | null;
  account?: string | null;
  qrUrl?: string | null;
  monogram?: string;
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
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-serif uppercase tracking-wider bg-gold/15 text-foreground hover:bg-gold/25 border border-gold/40 active:scale-95 transition-all shadow-sm cursor-pointer"
      aria-label="Sao chép số tài khoản"
    >
      {done ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-gold" />}
      {done ? "Đã sao chép" : "Sao chép số TK"}
    </button>
  );
}

function GiftCard({ side, monogram, waxColor }: { side: Side; monogram: string; waxColor: "burgundy" | "gold" }) {
  const [open, setOpen] = useState(false);
  const hasInfo = !!(side.account || side.qrUrl);
  if (!hasInfo) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl border border-gold/30 bg-card p-8 sm:p-10 text-center shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-elegant hover:border-gold/60 cursor-pointer"
        aria-label={`Mở phong bao mừng cưới ${side.label}`}
      >
        {/* Fine double border inside card */}
        <div className="absolute inset-3 border border-gold/20 rounded-xl pointer-events-none transition-colors group-hover:border-gold/40" />

        {/* 3D Wax Seal Badge */}
        <div className="mx-auto mb-5 relative flex items-center justify-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-105 border-2 ${
              waxColor === "burgundy"
                ? "bg-gradient-to-br from-[#731924] via-[#54121B] to-[#36080E] border-[#A34351]/50 shadow-[#54121B]/30"
                : "bg-gradient-to-br from-[#B89758] via-[#C5A880] to-[#8C6D32] border-[#F2E0BD]/50 shadow-[#8C6D32]/30"
            }`}
          >
            <div className="w-16 h-16 rounded-full border border-white/30 flex flex-col items-center justify-center text-white/95">
              <span className="font-display text-lg font-semibold tracking-widest">{monogram}</span>
              <span className="text-[8px] tracking-[0.2em] uppercase font-serif opacity-80 mt-[-2px]">SEAL</span>
            </div>
          </div>
        </div>

        {/* Title in bespoke calligraphy font */}
        <h4 className="font-script text-3xl sm:text-4xl text-foreground font-normal transition-colors group-hover:text-gold">
          {side.label}
        </h4>
        <p className="font-serif text-xs uppercase tracking-[0.2em] text-gold/90 mt-2 font-medium">
          Phong Bao Mừng Cưới
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-3 font-serif">
          Nhấn để xem thông tin tài khoản &amp; mã QR chuyển khoản
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground font-serif border-b border-gold/60 pb-1 group-hover:text-gold transition-colors">
          <Sparkles size={13} className="text-gold" />
          <span>Mở phong bao</span>
        </div>
      </button>

      {/* Royal stationery dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border border-gold/40 p-8 rounded-3xl shadow-elegant">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-2 w-12 h-12 rounded-full border border-gold/40 bg-secondary/50 flex items-center justify-center text-gold font-display font-medium text-base">
              {monogram}
            </div>
            <DialogTitle className="font-serif text-center">
              <span className="font-script text-foreground text-3xl sm:text-4xl block font-normal">
                {side.label}
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium mt-1 block">
                Thông tin chúc phúc mừng cưới
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {side.qrUrl && (
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white rounded-2xl border-2 border-gold/30 shadow-soft">
                  <img
                    src={resolveImg(side.qrUrl)!}
                    alt={`QR mừng cưới ${side.label}`}
                    className="w-52 h-52 object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2.5 font-serif italic">
                  Quét mã QR bằng ứng dụng ngân hàng bất kỳ
                </p>
              </div>
            )}

            {side.account && (
              <div className="bg-secondary/40 border border-gold/25 rounded-2xl p-5 text-center space-y-2">
                {side.holder && (
                  <p className="font-serif text-sm uppercase tracking-widest text-foreground/80 font-medium">
                    {side.holder}
                  </p>
                )}
                {side.bank && (
                  <p className="text-xs text-muted-foreground font-serif">
                    Ngân hàng: <span className="text-foreground font-medium">{side.bank}</span>
                  </p>
                )}
                <p className="font-display text-2xl sm:text-3xl tabular-nums tracking-widest text-foreground font-medium py-1">
                  {side.account}
                </p>
                <div className="pt-2">
                  <CopyBtn value={side.account} />
                </div>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground font-serif italic leading-relaxed px-4">
              “Sự hiện diện và lời chúc phúc của quý khách là món quà trân quý nhất đối với chúng mình.”
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GiftBoxes({ bride, groom }: { bride: Side; groom: Side }) {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      <GiftCard side={bride} monogram="TM" waxColor="burgundy" />
      <GiftCard side={groom} monogram="HN" waxColor="gold" />
    </div>
  );
}