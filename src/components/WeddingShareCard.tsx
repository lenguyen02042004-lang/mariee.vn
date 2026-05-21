import { useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { resolveImg } from "@/lib/image-map";
import { toast } from "sonner";

type Couple = {
  slug: string;
  bride_name: string;
  groom_name: string;
  wedding_date?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  quote?: string | null;
  cover_image?: string | null;
  hero_image_1?: string | null;
};

/**
 * Thiệp cưới online + mã QR để khách mời quét và truy cập trang cưới.
 * Có thể tải QR (PNG), copy link, hoặc dùng Web Share API.
 */
export function WeddingShareCard({ couple, origin }: { couple: Couple; origin?: string }) {
  const qrRef = useRef<HTMLDivElement>(null);

  const url = useMemo(() => {
    const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/couples/${couple.slug}`;
  }, [couple.slug, origin]);

  const dateLabel = couple.wedding_date
    ? new Date(couple.wedding_date).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : null;

  const bg = couple.cover_image || couple.hero_image_1;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Đã sao chép liên kết"); }
    catch { toast.error("Không sao chép được, hãy copy thủ công"); }
  };

  const shareNative = async () => {
    const text = `Trân trọng kính mời bạn đến dự lễ thành hôn của ${couple.bride_name} & ${couple.groom_name}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${couple.bride_name} & ${couple.groom_name}`, text, url }); }
      catch {/* user cancelled */}
    } else {
      copyLink();
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${couple.slug}.png`;
    a.click();
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 shadow-elegant bg-card">
      {/* Decorative background */}
      {bg && (
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${resolveImg(bg)})` }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/95" aria-hidden />

      <div className="relative grid md:grid-cols-[1fr_auto] gap-8 p-8 md:p-10 items-center">
        {/* Invitation text */}
        <div className="text-center md:text-left">
          <p className="font-script text-2xl text-primary">save the date</p>
          <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mt-3">Trân trọng kính mời</p>
          <h2 className="font-display text-3xl md:text-5xl mt-3 leading-tight">
            {couple.bride_name}
            <span className="font-script text-primary mx-2">&amp;</span>
            {couple.groom_name}
          </h2>
          {dateLabel && <p className="mt-3 text-base md:text-lg">{dateLabel}</p>}
          {couple.venue_name && (
            <p className="mt-1 text-sm text-muted-foreground">
              {couple.venue_name}{couple.venue_address ? ` — ${couple.venue_address}` : ""}
            </p>
          )}
          {couple.quote && (
            <blockquote className="mt-5 font-display italic text-lg md:text-xl text-balance max-w-md mx-auto md:mx-0">
              "{couple.quote}"
            </blockquote>
          )}
        </div>

        {/* QR card */}
        <div className="flex flex-col items-center">
          <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-soft border border-border/60">
            <QRCodeCanvas
              value={url}
              size={196}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">Quét mã để mở thiệp cưới online</p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 break-all max-w-[220px] text-center font-mono">{url}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="relative px-8 md:px-10 pb-8 flex flex-wrap gap-3 justify-center md:justify-end">
        <button type="button" onClick={downloadQR} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm uppercase tracking-[0.18em]">
          Tải QR (PNG)
        </button>
        <button type="button" onClick={copyLink} className="px-4 py-2 rounded border border-input text-sm uppercase tracking-[0.18em]">
          Sao chép liên kết
        </button>
        <button type="button" onClick={shareNative} className="px-4 py-2 rounded border border-input text-sm uppercase tracking-[0.18em]">
          Chia sẻ
        </button>
        <a href={url} target="_blank" rel="noopener" className="px-4 py-2 rounded border border-input text-sm uppercase tracking-[0.18em]">
          Mở thiệp
        </a>
      </div>
    </div>
  );
}
