import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { resolveImg } from "@/lib/image-map";
import { toast } from "sonner";
import { Download, Link2, Share2, ExternalLink, QrCode, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "card" | "qr" | "share">(null);

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

  const renderCardPng = async (): Promise<{ blob: Blob; dataUrl: string } | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { blob, dataUrl };
  };

  const downloadCard = async () => {
    if (busy) return;
    setBusy("card");
    try {
      const out = await renderCardPng();
      if (!out) throw new Error("no-card");
      const a = document.createElement("a");
      a.href = out.dataUrl;
      a.download = `thiep-cuoi-${couple.slug}.png`;
      a.click();
      toast.success("Đã tải thiệp cưới (PNG)");
    } catch {
      toast.error("Không tạo được ảnh thiệp, vui lòng thử lại");
    } finally {
      setBusy(null);
    }
  };

  const shareCard = async () => {
    if (busy) return;
    setBusy("share");
    try {
      const out = await renderCardPng();
      const text = `Trân trọng kính mời bạn đến dự lễ thành hôn của ${couple.bride_name} & ${couple.groom_name}`;
      const file = out ? new File([out.blob], `thiep-cuoi-${couple.slug}.png`, { type: "image/png" }) : null;
      const nav = navigator as any;
      if (file && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: `${couple.bride_name} & ${couple.groom_name}`, text, url });
      } else if (navigator.share) {
        await navigator.share({ title: `${couple.bride_name} & ${couple.groom_name}`, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết");
      }
    } catch {
      /* user cancel or unsupported */
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-elegant bg-card">
      {/* Decorative background */}
      {bg && (
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center scale-110 blur-[2px]"
          style={{ backgroundImage: `url(${resolveImg(bg)})` }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-background/92 via-background/85 to-background/95" aria-hidden />
      {/* Ornamental frame */}
      <div className="absolute inset-3 md:inset-5 border border-primary/25 rounded-xl pointer-events-none" aria-hidden />
      <div className="absolute inset-4 md:inset-6 border border-primary/15 rounded-lg pointer-events-none" aria-hidden />

      {/* Floating action icons */}
      <div className="absolute top-4 right-4 z-20 flex gap-1.5">
        <button type="button" onClick={downloadCard} disabled={busy !== null} aria-label="Tải thiệp cưới (PNG)"
          title="Tải thiệp cưới (PNG)"
          className="w-8 h-8 rounded-full bg-card/90 border border-border/60 text-foreground/70 hover:text-primary hover:border-primary/40 backdrop-blur flex items-center justify-center transition disabled:opacity-50">
          {busy === "card" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        </button>
        <button type="button" onClick={downloadQR} aria-label="Tải mã QR (PNG)"
          title="Tải mã QR (PNG)"
          className="w-8 h-8 rounded-full bg-card/90 border border-border/60 text-foreground/70 hover:text-primary hover:border-primary/40 backdrop-blur flex items-center justify-center transition">
          <QrCode size={14} />
        </button>
        <button type="button" onClick={copyLink} aria-label="Sao chép liên kết"
          title="Sao chép liên kết"
          className="w-8 h-8 rounded-full bg-card/90 border border-border/60 text-foreground/70 hover:text-primary hover:border-primary/40 backdrop-blur flex items-center justify-center transition">
          <Link2 size={14} />
        </button>
        <button type="button" onClick={shareCard} disabled={busy !== null} aria-label="Chia sẻ thiệp"
          title="Chia sẻ thiệp (kèm ảnh)"
          className="w-8 h-8 rounded-full bg-card/90 border border-border/60 text-foreground/70 hover:text-primary hover:border-primary/40 backdrop-blur flex items-center justify-center transition disabled:opacity-50">
          {busy === "share" ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
        </button>
        <a href={url} target="_blank" rel="noopener" aria-label="Mở thiệp"
          title="Mở thiệp trong tab mới"
          className="w-8 h-8 rounded-full bg-card/90 border border-border/60 text-foreground/70 hover:text-primary hover:border-primary/40 backdrop-blur flex items-center justify-center transition">
          <ExternalLink size={14} />
        </a>
      </div>

      <div ref={cardRef} className="relative grid md:grid-cols-[1fr_auto] gap-10 p-10 md:p-14 items-center">
        {/* Invitation text */}
        <div className="text-center md:text-left">
          <p className="font-script text-3xl md:text-4xl text-primary">save the date</p>
          <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
            <span className="h-px w-10 bg-primary/40" />
            <p className="uppercase tracking-[0.3em] text-[11px] text-muted-foreground">Trân trọng kính mời tham dự tiệc cưới</p>
            <span className="h-px w-10 bg-primary/40" />
          </div>
          <h2 className="font-display text-4xl md:text-6xl mt-5 leading-[1.05]">
            {couple.bride_name}
            <span className="font-script text-primary mx-3 align-middle">&amp;</span>
            {couple.groom_name}
          </h2>
          {dateLabel && <p className="mt-5 text-base md:text-lg tracking-wide">{dateLabel}</p>}
          {couple.venue_name && (
            <p className="mt-2 text-sm text-muted-foreground">
              {couple.venue_name}{couple.venue_address ? ` — ${couple.venue_address}` : ""}
            </p>
          )}
          {couple.quote && (
            <blockquote className="mt-6 font-display italic text-lg md:text-xl text-balance max-w-md mx-auto md:mx-0 text-foreground/80">
              "{couple.quote}"
            </blockquote>
          )}
        </div>

        {/* QR card */}
        <div className="flex flex-col items-center">
          {/* Portrait photo of the couple */}
          <div className="relative bg-white p-3 rounded-xl shadow-elegant border border-primary/30">
            <span className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl" />
            <span className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr" />
            <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl" />
            <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br" />
            {bg ? (
              <img
                src={resolveImg(bg)}
                alt={`${couple.bride_name} & ${couple.groom_name}`}
                crossOrigin="anonymous"
                className="w-[240px] h-[300px] object-cover rounded-lg"
              />
            ) : (
              <div className="w-[240px] h-[300px] rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-script text-3xl text-primary">
                {couple.bride_name?.[0]}&amp;{couple.groom_name?.[0]}
              </div>
            )}
          </div>
          <p className="font-script text-xl text-primary mt-4 text-center">Quét để mở thiệp</p>
          {/* Compact QR */}
          <div ref={qrRef} className="mt-2 bg-white p-2 rounded-md border border-primary/20">
            <QRCodeCanvas
              value={url}
              size={96}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
            />
          </div>
          <p className="text-[10px] text-muted-foreground/80 mt-2 break-all max-w-[220px] text-center font-mono">{url}</p>
        </div>
      </div>
    </div>
  );
}
