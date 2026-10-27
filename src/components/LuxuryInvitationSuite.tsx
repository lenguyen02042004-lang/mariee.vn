import { useState } from "react";
import { resolveImg } from "@/lib/image-map";
import { Download, Maximize2, X, Sparkles, Check, Eye } from "lucide-react";
import { toast } from "sonner";

interface LuxuryInvitationSuiteProps {
  brideUrl?: string | null;
  groomUrl?: string | null;
  brideName: string;
  groomName: string;
}

export function LuxuryInvitationSuite({
  brideUrl,
  groomUrl,
  brideName,
  groomName,
}: LuxuryInvitationSuiteProps) {
  const [activeTab, setActiveTab] = useState<"all" | "bride" | "groom">("all");
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);

  const bImg = resolveImg(brideUrl || "/src/assets/invitation-bride-luxury.jpg");
  const gImg = resolveImg(groomUrl || "/src/assets/invitation-groom-luxury.jpg");

  const cards = [
    {
      id: "bride",
      type: "bride" as const,
      tag: "LỄ VU QUY",
      subtitle: `Thiệp Mời Nhà Gái — Cô Dâu ${brideName}`,
      img: bImg,
      details: [
        "Giấy mỹ thuật Cotton 350gsm xé cạnh thủ công (Deckled Edge)",
        "Kỹ thuật ép kim vàng 24K (Hot Foil Stamping)",
        "Dấu niêm phong sáp Bordeaux hoàng gia khắc chìm độc bản TM",
        "Ruy băng lụa tơ tằm tự nhiên & hoa khô phong cách Haute Couture",
      ],
      palette: "Bordeaux & Champagne Gold",
    },
    {
      id: "groom",
      type: "groom" as const,
      tag: "LỄ TÂN HÔN",
      subtitle: `Thiệp Mời Nhà Trai — Chú Rể ${groomName}`,
      img: gImg,
      details: [
        "Chất liệu nhung dạ hoàng gia (Royal Emerald Velvet)",
        "Dập nổi Typography & Khắc chìm gia huy vàng kim",
        "Dấu sáp vàng đồng hoàng gia khắc triện HN",
        "Kích thước chuẩn Editorial Atelier 140 x 200 mm",
      ],
      palette: "Emerald & Burnished Gold",
    },
  ];

  const handleDownload = (url: string, name: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.jpg`;
      a.click();
      toast.success(`Đang tải ảnh thiệp: ${name}`);
    } catch {
      toast.error("Không thể tải ảnh, vui lòng thử lại");
    }
  };

  const displayCards =
    activeTab === "all"
      ? cards
      : cards.filter((c) => c.id === activeTab);

  return (
    <div className="relative">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-serif uppercase tracking-[0.2em] transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-foreground text-background shadow-soft"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
          }`}
        >
          Trọn Bộ Thiệp Mời
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bride")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-serif uppercase tracking-[0.2em] transition-all cursor-pointer ${
            activeTab === "bride"
              ? "bg-foreground text-background shadow-soft"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
          }`}
        >
          Thiệp Nhà Gái (Vu Quy)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("groom")}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-serif uppercase tracking-[0.2em] transition-all cursor-pointer ${
            activeTab === "groom"
              ? "bg-foreground text-background shadow-soft"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
          }`}
        >
          Thiệp Nhà Trai (Tân Hôn)
        </button>
      </div>

      {/* Cards Display Grid */}
      <div
        className={`grid gap-10 sm:gap-14 max-w-5xl mx-auto ${
          displayCards.length === 1 ? "max-w-xl" : "md:grid-cols-2"
        }`}
      >
        {displayCards.map((c) => (
          <div
            key={c.id}
            className="group relative bg-card rounded-3xl p-6 sm:p-8 border border-gold/35 shadow-elegant transition-all duration-500 hover:border-gold/60 hover:-translate-y-1"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-gold font-semibold bg-gold/10 px-3.5 py-1 rounded-full border border-gold/25">
                {c.tag}
              </span>
              <span className="text-[11px] text-muted-foreground font-serif tracking-wider">
                {c.palette}
              </span>
            </div>

            {/* Image Preview with Hover Overlay */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/30 shadow-inner border border-gold/20 mb-6">
              <img
                src={c.img}
                alt={c.subtitle}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <div className="flex items-center gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => setLightboxImg({ url: c.img, title: c.subtitle })}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/90 hover:bg-white text-black text-xs font-serif uppercase tracking-wider flex items-center justify-center gap-2 shadow-soft transition cursor-pointer backdrop-blur"
                  >
                    <Maximize2 size={14} />
                    <span>Xem cận cảnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(c.img, `thiep-${c.id}-${brideName}-${groomName}`)}
                    aria-label="Tải thiệp độ phân giải cao"
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition backdrop-blur cursor-pointer"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Card Information */}
            <div className="text-center sm:text-left">
              <h4 className="font-script text-3xl sm:text-4xl text-foreground font-normal">
                {c.subtitle}
              </h4>

              {/* Atelier Specs */}
              <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold/90 font-serif font-medium">
                  Quy cách chế tác Haute Couture
                </p>
                <ul className="text-xs text-muted-foreground font-serif space-y-1.5 leading-relaxed">
                  {c.details.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Sparkles size={12} className="text-gold shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons for Mobile/Desktop */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLightboxImg({ url: c.img, title: c.subtitle })}
                  className="flex-1 py-2.5 px-4 rounded-full border border-gold/40 hover:bg-gold/10 text-foreground text-xs uppercase tracking-widest font-serif flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Eye size={14} className="text-gold" />
                  <span>Phóng to chi tiết</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(c.img, `thiep-${c.id}-${brideName}-${groomName}`)}
                  className="py-2.5 px-4 rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs uppercase tracking-widest font-serif flex items-center justify-center gap-1.5 transition cursor-pointer shadow-soft"
                >
                  <Download size={14} />
                  <span>Tải ảnh HD</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            aria-label="Đóng"
            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={24} />
          </button>
          <div
            className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImg.url}
              alt={lightboxImg.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <p className="font-script text-3xl text-gold">{lightboxImg.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
