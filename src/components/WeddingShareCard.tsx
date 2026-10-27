import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { resolveImg } from "@/lib/image-map";
import { toast } from "sonner";
import { Download, Link2, Share2, ExternalLink, QrCode, Loader2, Sparkles } from "lucide-react";
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

export function WeddingShareCard({ couple, origin }: { couple: Couple; origin?: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "card" | "qr" | "share">(null);

  const url = useMemo(() => {
    const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/couples/${couple.slug}`;
  }, [couple.slug, origin]);

  const dateLabel = couple.wedding_date
    ? new Date(couple.wedding_date).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const bg = couple.cover_image || couple.hero_image_1;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết thiệp cưới");
    } catch {
      toast.error("Không thể sao chép, hãy copy thủ công");
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-mariee-${couple.slug}.png`;
    a.click();
    toast.success("Đã tải mã QR");
  };

  const renderCardPng = async (): Promise<{ blob: Blob; dataUrl: string } | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#FAF8F5",
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
      a.download = `thiep-moi-${couple.slug}.png`;
      a.click();
      toast.success("Đã tải thiệp mời hoàng gia (PNG)");
    } catch {
      toast.error("Không tạo được ảnh, vui lòng thử lại");
    } finally {
      setBusy(null);
    }
  };

  const shareCard = async () => {
    if (busy) return;
    setBusy("share");
    try {
      const out = await renderCardPng();
      const text = `Trân trọng kính mời bạn đến tham dự lễ cưới của ${couple.bride_name} & ${couple.groom_name}`;
      const file = out ? new File([out.blob], `thiep-${couple.slug}.png`, { type: "image/png" }) : null;
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
      /* user cancel */
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/40 shadow-elegant bg-card max-w-4xl mx-auto">
      {/* Action buttons toolbar */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          type="button"
          onClick={downloadCard}
          disabled={busy !== null}
          aria-label="Tải thiệp mời"
          title="Tải thiệp mời (PNG)"
          className="w-9 h-9 rounded-full bg-card/90 border border-gold/40 text-foreground hover:bg-gold/15 backdrop-blur flex items-center justify-center transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          {busy === "card" ? <Loader2 size={15} className="animate-spin text-gold" /> : <Download size={15} className="text-gold" />}
        </button>
        <button
          type="button"
          onClick={downloadQR}
          aria-label="Tải mã QR"
          title="Tải mã QR"
          className="w-9 h-9 rounded-full bg-card/90 border border-gold/40 text-foreground hover:bg-gold/15 backdrop-blur flex items-center justify-center transition cursor-pointer shadow-sm"
        >
          <QrCode size={15} className="text-gold" />
        </button>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Sao chép link"
          title="Sao chép liên kết"
          className="w-9 h-9 rounded-full bg-card/90 border border-gold/40 text-foreground hover:bg-gold/15 backdrop-blur flex items-center justify-center transition cursor-pointer shadow-sm"
        >
          <Link2 size={15} className="text-gold" />
        </button>
        <button
          type="button"
          onClick={shareCard}
          disabled={busy !== null}
          aria-label="Chia sẻ"
          title="Chia sẻ thiệp"
          className="w-9 h-9 rounded-full bg-card/90 border border-gold/40 text-foreground hover:bg-gold/15 backdrop-blur flex items-center justify-center transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          {busy === "share" ? <Loader2 size={15} className="animate-spin text-gold" /> : <Share2 size={15} className="text-gold" />}
        </button>
      </div>

      {/* Main Printable Card Container */}
      <div
        ref={cardRef}
        className="relative p-8 sm:p-14 md:p-16 grid md:grid-cols-[1fr_auto] gap-10 items-center bg-[#FAF8F5]"
      >
        {/* Double Gold Filigree Border */}
        <div className="absolute inset-3 sm:inset-5 border border-gold/35 rounded-2xl pointer-events-none" />
        <div className="absolute inset-4 sm:inset-6 border border-gold/20 rounded-xl pointer-events-none" />

        {/* Text Details */}
        <div className="relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
            <span className="h-px w-8 bg-gold/50" />
            <p className="font-serif uppercase tracking-[0.35em] text-[11px] text-gold font-medium">
              ROYAL INVITATION
            </p>
            <span className="h-px w-8 bg-gold/50" />
          </div>

          <p className="font-serif uppercase tracking-[0.2em] text-xs text-muted-foreground mt-2">
            Trân trọng kính mời tham dự tiệc cưới của
          </p>

          <h2 className="font-display mt-4 leading-[1.1] text-foreground text-[clamp(2.2rem,5vw,3.8rem)] font-light">
            <span className="font-script text-primary text-[1.25em] inline-block pr-1 font-normal">
              {couple.bride_name}
            </span>
            <span className="font-serif text-gold text-[0.8em] mx-3 align-middle italic font-light">
              &amp;
            </span>
            <span className="font-script text-primary text-[1.25em] inline-block pl-1 font-normal">
              {couple.groom_name}
            </span>
          </h2>

          {dateLabel && (
            <p className="mt-5 text-base sm:text-lg font-serif font-medium text-foreground tracking-wide">
              {dateLabel}
            </p>
          )}

          {couple.venue_name && (
            <p className="mt-2 text-sm sm:text-base text-foreground/80 font-serif">
              <span className="font-semibold text-foreground">{couple.venue_name}</span>
              {couple.venue_address && <span className="text-muted-foreground"> — {couple.venue_address}</span>}
            </p>
          )}

          {couple.quote && (
            <blockquote className="mt-6 font-display italic text-base sm:text-lg text-foreground/75 border-l-2 border-gold/50 pl-4 max-w-md mx-auto md:mx-0">
              “{couple.quote}”
            </blockquote>
          )}
        </div>

        {/* Ornate Photo & QR Frame */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative p-2.5 bg-card rounded-2xl shadow-elegant border border-gold/40">
            {/* Ornate Corner Accents */}
            <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-gold rounded-tl" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-gold rounded-tr" />
            <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-gold rounded-bl" />
            <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-gold rounded-br" />

            {bg ? (
              <img
                src={resolveImg(bg)}
                alt={`${couple.bride_name} & ${couple.groom_name}`}
                crossOrigin="anonymous"
                className="w-[200px] sm:w-[220px] h-[260px] sm:h-[280px] object-cover rounded-xl"
              />
            ) : (
              <div className="w-[200px] h-[260px] rounded-xl bg-secondary/60 flex items-center justify-center font-script text-3xl text-gold">
                TM &amp; HN
              </div>
            )}
          </div>

          <p className="font-script text-2xl text-foreground mt-4 text-center">
            Quét mã để mở thiệp
          </p>

          <div
            ref={qrRef}
            className="mt-2 bg-white p-2.5 rounded-xl border border-gold/40 shadow-soft"
          >
            <QRCodeCanvas
              value={url}
              size={90}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1C1917"
            />
          </div>

          <p className="text-[10px] text-muted-foreground/75 mt-2 break-all max-w-[200px] text-center font-mono">
            {url}
          </p>
        </div>
      </div>
    </div>
  );
}
