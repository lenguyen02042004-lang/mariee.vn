import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { getCoupleBySlug, submitRsvp, submitWish } from "@/lib/couples.functions";
import { resolveImg } from "@/lib/image-map";
import { absoluteImage, canonical } from "@/lib/seo";
import {
  Heart,
  CalendarDays,
  MapPin,
  Gift,
  Volume2,
  VolumeX,
  Copy,
  Share2,
  Menu,
  X,
  Check,
  Play,
  MessageCircle,
  Link as LinkIcon,
  Send
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import WeddingHero from "@/components/WeddingHero";
import FallingPetals from "@/components/FallingPetals";
import SectionDivider from "@/components/SectionDivider";
import BackToTop from "@/components/BackToTop";
import MarieeFooter from "@/components/MarieeFooter";
import "../wedding-studio.css";

const WEDDING_AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=wedding-piano-112191.mp3";

export const themes = {
  pink: {
    label: "Blush Pink Romance",
    bg: "#fff7f8",       // Luminous fresh rosewater white
    paper: "#ffffff",    // Pure clean white
    soft: "#fdebf0",     // Fresh cherry blossom / sweet blush
    ink: "#3b1d25",      // Crisp readable berry dark (high clarity)
    muted: "#9e596d",    // Fresh rose petal
    accent: "#e25c80",   // Radiant blooming rose pink (vibrant, tươi tắn)
    deep: "#c43d63",     // Rich vibrant rose
    line: "#fcd4df",     // Soft fresh rose hairline
  },
  champagne: {
    label: "Champagne Luxury",
    bg: "#fdfbf7",       // Luminous warm ivory silk (fresh & bright)
    paper: "#ffffff",    // Pure clean white
    soft: "#fbf3e4",     // Warm golden cream glow
    ink: "#382a1d",      // Sharp deep espresso bronze (high contrast)
    muted: "#8f755a",    // Refined warm gold-taupe
    accent: "#c9983e",   // Sparkling warm radiant gold (vàng gold tươi sáng)
    deep: "#a67728",     // Rich polished royal gold
    line: "#ede0c8",     // Delicate warm gold hairline
  },
};

function toYouTubeEmbed(url: string): string {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|\/v\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

export const Route = createFileRoute("/couples/$slug")({
  loader: async ({ params }) => {
    const data = await getCoupleBySlug({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  component: CouplePage,
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-muted-foreground">Không tìm thấy cặp đôi này.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
      <div><p className="text-muted-foreground">{error.message}</p></div>
    </div>
  ),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [] };
    const c: any = loaderData.couple;
    const url = canonical(`/couples/${params.slug}`);
    const img = absoluteImage(resolveImg(c.cover_image || c.hero_image_1 || "/assets/hero.jpg"));
    const title = `${c.bride_name} & ${c.groom_name}`;
    const desc = c.quote ?? `Lễ cưới của ${title} — Mariée`;
    return {
      meta: [
        { title: `${title} | Wedding Invitation` },
        { name: "description", content: desc },
        { property: "og:title", content: `${title} | Wedding Invitation` },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function SafeImage({ src, alt = "", className = "" }: { src?: string | null; alt?: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState<string>(() => resolveImg(src));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(resolveImg(src));
    setFailed(false);
  }, [src]);

  const handleError = () => {
    const fname = (src || "").split("/").pop();
    if (fname && imgSrc !== `/assets/${fname}`) {
      setImgSrc(`/assets/${fname}`);
    } else {
      setFailed(true);
    }
  };

  if (!imgSrc || failed) {
    return (
      <div className={"image-placeholder " + className}>
        <span>✿</span>
        <small>{alt || "Hình ảnh lễ cưới"}</small>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
    />
  );
}

function Floral({ position = "", theme = "blush" }: { position?: string; theme?: string }) {
  const t = theme === "champagne" ? "champagne" : "blush";
  return <img className={"floral " + position} src={`/assets/wedding-florals/${t}/${t}-corner-top-left.webp`} alt="" aria-hidden="true" style={{ pointerEvents: "none" }} />;
}

function Heading({ eyebrow, children, className = "" }: { eyebrow: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`section-heading ${className}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{children}</h2>
      <div className="heading-ornament">──── ♡ ────</div>
    </div>
  );
}

function CouplePage() {
  const { couple, gallery, wishes } = Route.useLoaderData();
  const submitRsvpFn = useServerFn(submitRsvp);
  const submitWishFn = useServerFn(submitWish);

  // Theme state: defaults to couple preference from database or localStorage
  const initialTheme = (couple as any).theme_style === "champagne" ? "champagne" : "pink";
  const [theme, setTheme] = useState<"pink" | "champagne">(initialTheme);
  const [nav, setNav] = useState(false);
  const [gift, setGift] = useState<number>(-1);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qTheme = params.get("theme");
      if (qTheme === "champagne" || qTheme === "pink") {
        setTheme(qTheme as "pink" | "champagne");
        return;
      }
      const stored = localStorage.getItem("wedding-theme");
      if (stored === "champagne" || stored === "pink") {
        setTheme(stored as "pink" | "champagne");
      }
    }
  }, []);

  // Luxury Scroll Reveal Observer
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [theme]);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(WEDDING_AUDIO_URL);
    audio.loop = true;
    audioRef.current = audio;

    const handleFirstClick = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      window.removeEventListener("click", handleFirstClick);
    };
    window.addEventListener("click", handleFirstClick, { once: true });

    return () => {
      audio.pause();
      window.removeEventListener("click", handleFirstClick);
    };
  }, []);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Form states
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [wishList, setWishList] = useState(wishes || []);

  const [rsvp, setRsvp] = useState({
    name: "",
    phone: "",
    email: "",
    attendance: "yes",
    guests: "1",
    group: "Khách chung",
    note: "",
  });
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const formStartedAt = useRef(Date.now());

  const t = themes[theme];
  const cssVars = Object.fromEntries(
    Object.entries(t).map(([k, val]) => ["--" + k, val])
  ) as React.CSSProperties;

  const dateLabel = couple.wedding_date
    ? new Date(couple.wedding_date).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Thứ Bảy, 28 tháng 11, 2026";

  const initials = (couple as any).initials || `${couple.bride_name?.[0] || "T"}M · ${couple.groom_name?.[0] || "H"}N`;

  const storyParagraphs = couple.story
    ? couple.story.split("\n\n").filter(Boolean)
    : [
        "Mười năm bên nhau, từ những chiều dạo bước dưới tán hoa giấy Sài Gòn cho đến ngày hẹn ước dưới vòm lễ đường lộng lẫy.",
        "Chúng mình tin rằng tình yêu đích thực không phải là tìm kiếm một ai đó hoàn hảo, mà là cùng nhau vun đắp những khoảnh khắc đời thường thành điều kỳ diệu vĩnh cửu.",
        "Hân hoan chào đón bạn đến chứng kiến và chia sẻ khoảnh khắc thiêng liêng nhất của cuộc đời chúng mình.",
      ];

  const families = [
    {
      side: "Nhà cô dâu",
      title: "Lễ Vu Quy",
      time: couple.bride_party_time || "08:30 — 28/11/2026",
      address: couple.bride_party_address || "Tư gia Nhà Gái: 128 Nam Kỳ Khởi Nghĩa, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    {
      side: "Nhà chú rể",
      title: "Lễ Tân Hôn",
      time: couple.groom_party_time || "10:30 — 28/11/2026",
      address: couple.groom_party_address || "Tư gia Nhà Trai: 45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
  ];

  const program = Array.isArray((couple as any).schedule) && (couple as any).schedule.length > 0
    ? (couple as any).schedule
    : [
        { time: "17:30", title: "Đón tiếp quý khách", desc: "Tiệc trà nhẹ ngắm hoàng hôn & chụp ảnh lưu niệm cùng Cô Dâu - Chú Rể" },
        { time: "18:30", title: "Cử hành Lễ Thành Hôn", desc: "Nghi thức trao nhẫn thiêng liêng và thề nguyện trọn đời" },
        { time: "19:00", title: "Khai tiệc chiêu đãi", desc: "Thưởng thức thực đơn ẩm thực Haute Cuisine hảo hạng" },
        { time: "20:30", title: "First Dance & After Party", desc: "Âm nhạc giao hưởng sống, khiêu vũ và những khoảnh khắc bùng nổ tình thân" },
      ];

  const dressCode = Array.isArray((couple as any).dress_code) && (couple as any).dress_code.length > 0
    ? (couple as any).dress_code
    : [
        { name: "Champagne", color: "#ead9c2" },
        { name: "Dusty Rose", color: "#d6a3a7" },
        { name: "Warm Ivory", color: "#f3e7d9" },
        { name: "Burgundy", color: "#762d3c" },
      ];

  const gifts = [
    {
      name: `Cô dâu ${couple.bride_name}`,
      bank: couple.gift_bride_bank || "Vietcombank — CN Bến Thành",
      account: couple.gift_bride_account || "1019888999",
      owner: couple.gift_bride_holder || couple.bride_name,
      qr: (couple as any).gift_bride_qr_url,
    },
    {
      name: `Chú rể ${couple.groom_name}`,
      bank: couple.gift_groom_bank || "Techcombank — Hội Sở",
      account: couple.gift_groom_account || "19036888666",
      owner: couple.gift_groom_holder || couple.groom_name,
      qr: (couple as any).gift_groom_qr_url,
    },
  ];

  const ytEmbed = toYouTubeEmbed(couple.youtube_url ?? "");

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Thiệp cưới ${couple.bride_name} & ${couple.groom_name}`,
          text: `Trân trọng kính mời bạn đến tham dự lễ cưới của ${couple.bride_name} & ${couple.groom_name}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết thiệp cưới!");
      }
    } catch {
      // User cancelled
    }
  };

  const onSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishText.trim() || wishSubmitting) return;
    setWishSubmitting(true);
    try {
      await submitWishFn({
        data: {
          couple_id: couple.id,
          guest_name: wishName.trim(),
          message: wishText.trim(),
          _hp: "",
          _ts: formStartedAt.current,
        },
      });
      const newWish = {
        id: "temp-" + Date.now(),
        guest_name: wishName.trim(),
        message: wishText.trim(),
        created_at: new Date().toISOString(),
      };
      setWishList([newWish, ...wishList]);
      setWishName("");
      setWishText("");
      toast.success("Đã gửi lời chúc phúc thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Không gửi được lời chúc, vui lòng thử lại.");
    } finally {
      setWishSubmitting(false);
    }
  };

  const onSendRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvp.name.trim() || rsvpSubmitting) return;
    setRsvpSubmitting(true);
    try {
      await submitRsvpFn({
        data: {
          couple_id: couple.id,
          guest_name: rsvp.name.trim(),
          guest_phone: rsvp.phone.trim(),
          guest_email: rsvp.email.trim(),
          attending: rsvp.attendance === "yes",
          num_guests: Number(rsvp.guests || 1),
          side: (rsvp.group === "Nhà cô dâu" ? "bride" : rsvp.group === "Nhà chú rể" ? "groom" : "both"),
          message: rsvp.note.trim(),
          _hp: "",
          _ts: formStartedAt.current,
        },
      });
      setRsvpDone(true);
      toast.success("Đã gửi xác nhận tham dự thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi khi gửi xác nhận, vui lòng thử lại.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const invitationCards = [
    {
      label: "Thiệp nhà cô dâu",
      subtitle: "Lễ Vu Quy",
      img: couple.invitation_bride_url || `/assets/visual/${theme}-invitation-bride.svg`,
    },
    {
      label: "Thiệp nhà cô dâu",
      subtitle: "Lễ Thành Hôn",
      img: `/assets/visual/${theme}-invitation-ceremony.svg`,
    },
    {
      label: "Thiệp nhà cô dâu",
      subtitle: "Tiệc Chiêu Đãi",
      img: `/assets/visual/${theme}-invitation-reception.svg`,
    },
    {
      label: "Thiệp nhà chú rể",
      subtitle: "Lễ Tân Hôn",
      img: couple.invitation_groom_url || `/assets/visual/${theme}-invitation-groom.svg`,
    },
  ];

  return (
    <div className="site" data-theme={theme} style={cssVars}>
      {/* FLOATING WATERCOLOR FALLING PETALS OVERLAY */}
      <FallingPetals theme={theme === "champagne" ? "champagne" : "blush"} />

      {/* FLOATING BACK TO TOP BUTTON */}
      <BackToTop theme={theme === "champagne" ? "champagne" : "blush"} />

      {/* BOTANICAL SIDE FRAMING FOR DESKTOP */}
      <img
        src={
          theme === "champagne"
            ? "/assets/wedding-florals/champagne/champagne-vertical-branch.webp"
            : "/assets/wedding-florals/blush/blush-vertical-branch.webp"
        }
        className="side-branch side-branch--left"
        alt=""
        aria-hidden="true"
      />
      <img
        src={
          theme === "champagne"
            ? "/assets/wedding-florals/champagne/champagne-vertical-branch.webp"
            : "/assets/wedding-florals/blush/blush-vertical-branch.webp"
        }
        className="side-branch side-branch--right"
        alt=""
        aria-hidden="true"
      />

      {/* STICKY HEADER */}
      <header className="header">
        <a href="#home" className="monogram">
          {initials}
        </a>

        <nav className={nav ? "open" : ""}>
          {[
            ["#home", "Trang chủ"],
            ["#story", "Câu chuyện"],
            ["#celebration", "Lễ cưới"],
            ["#gallery", "Hình ảnh"],
            ["#wishes", "Lời chúc"],
            ["#rsvp", "RSVP"],
          ].map(([id, name]) => (
            <a key={id} href={id} onClick={() => setNav(false)}>
              {name}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          {/* THEME SWITCHER */}
          <select
            aria-label="Chọn phong cách"
            value={theme}
            onChange={(e) => {
              const val = e.target.value as "pink" | "champagne";
              setTheme(val);
              if (typeof window !== "undefined") {
                localStorage.setItem("wedding-theme", val);
              }
            }}
          >
            <option value="pink">Hồng phấn</option>
            <option value="champagne">Champagne</option>
          </select>

          {/* AUDIO TOGGLE BUTTON */}
          <button
            type="button"
            onClick={toggleAudio}
            className="small-cta"
            title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
          >
            {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{isPlaying ? "Tắt nhạc" : "Bật nhạc ♫"}</span>
          </button>

          <a className="small-cta hidden sm:inline-flex" href="#rsvp">
            ♥ Đặt lịch
          </a>

          <button className="mobile-menu" aria-label="Menu" onClick={() => setNav(!nav)}>
            {nav ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO / SAVE OUR DATE & COUNTDOWN */}
        {(() => {
          const heroImages = [
            couple.hero_image_1,
            couple.hero_image_2,
            couple.hero_image_3,
          ]
            .filter(Boolean)
            .map((img) => resolveImg(img));

          if (heroImages.length === 0) {
            if (couple.cover_image) heroImages.push(resolveImg(couple.cover_image));
            heroImages.push(resolveImg("/assets/hero-wedding-1.jpg"));
            heroImages.push(resolveImg("/assets/hero-wedding-2.jpg"));
          } else if (heroImages.length === 1) {
            heroImages.push(resolveImg("/assets/hero-wedding-1.jpg"));
            heroImages.push(resolveImg("/assets/hero-wedding-2.jpg"));
          } else if (heroImages.length === 2) {
            heroImages.push(resolveImg("/assets/hero-wedding-2.jpg"));
          }

          const dateStr = couple.wedding_date
            ? new Date(couple.wedding_date).toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Thứ Bảy, 28 tháng 11, 2026";

          const locStr =
            [couple.venue_name, couple.venue_address].filter(Boolean).join(" · ") ||
            "GEM Center · TP. Hồ Chí Minh";

          return (
            <WeddingHero
              theme={theme === "champagne" ? "champagne" : "blush"}
              images={heroImages}
              image={heroImages[0]}
              bride={couple.bride_name || "Thảo My"}
              groom={couple.groom_name || "Hoàng Nam"}
              dateText={dateStr}
              locationText={locStr}
              onRSVP={() => {
                document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          );
        })()}

        {/* SECTION DIVIDER: HERO -> STORY */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="garland"
        />

        {/* OUR JOURNEY STORY */}
        <section id="story" className="section story">
          <Floral position="left-floral" theme={theme} />
          <div className="story-images reveal-on-scroll">
            <SafeImage
              src={couple.hero_image_2 || "/assets/story.jpg"}
              alt="Kỷ niệm tình yêu"
            />
            <div className="photo-sticker">Our love story ♡</div>
          </div>
          <div className="story-copy reveal-on-scroll">
            <span className="eyebrow">OUR JOURNEY</span>
            <h2>Câu chuyện của chúng mình</h2>
            {storyParagraphs.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* SECTION DIVIDER: STORY -> CELEBRATION */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="monogram"
          monogram={initials}
        />

        {/* CELEBRATION VENUE */}
        <section id="celebration" className="section venue-section">
          <Heading eyebrow="CELEBRATION" className="reveal-on-scroll">Thông tin tiệc cưới</Heading>
          <div className="venue-layout reveal-on-scroll">
            <div className="venue-copy">
              <h3>{couple.venue_name || "GEM Center — Grand Ballroom"}</h3>
              {couple.venue_address && (
                <p>
                  <MapPin size={18} />
                  <span>{couple.venue_address}</span>
                </p>
              )}
              <p>
                <CalendarDays size={18} />
                <span>{dateLabel}</span>
              </p>
              <div className="venue-times">
                <div>
                  <small>Lễ thành hôn</small>
                  <strong>{couple.ceremony_time || "17:30"}</strong>
                </div>
                <div>
                  <small>Tiệc chiêu đãi</small>
                  <strong>{couple.reception_time || "18:30"}</strong>
                </div>
              </div>
              <a
                className="btn"
                href={(couple as any).venue_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(couple.venue_name ? `${couple.venue_name}, ${couple.venue_address}` : couple.venue_address || "GEM Center Ho Chi Minh")}`}
                target="_blank"
                rel="noreferrer"
              >
                Chỉ đường trên Google Maps ↗
              </a>
            </div>

            <div className="venue-image-wrapper">
              <SafeImage
                src={(couple as any).venue_image || "/assets/venue.jpg"}
                alt="Địa điểm tổ chức tiệc cưới"
                className="venue-image"
              />
              <div className="venue-sticker">See you there ♡</div>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER: CELEBRATION -> FAMILIES */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="garland"
        />

        {/* RECEPTION: TWO FAMILIES */}
        <section className="section families">
          <Heading eyebrow="RECEPTION" className="reveal-on-scroll">Lễ gia tiên hai họ</Heading>
          <div className="two-cols stagger-grid">
            {families.map((f) => (
              <article className="soft-card reveal-on-scroll" key={f.side}>
                <span className="eyebrow">{f.side}</span>
                <h3>{f.title}</h3>
                <strong>{f.time}</strong>
                <p>{f.address}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION DIVIDER: FAMILIES -> PROGRAM */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="clean"
        />

        {/* PROGRAM TIMELINE */}
        <section className="section program">
          <Heading eyebrow="PROGRAM" className="reveal-on-scroll">Chương trình ngày cưới</Heading>
          <div className="timeline">
            {program.map((p: any, i: number) => (
              <div className="timeline-item reveal-on-scroll" key={p.time || i}>
                <div className="timeline-dot">{["♡", "✧", "✿", "♫"][i % 4]}</div>
                <strong>{p.time}</strong>
                <h3>{p.title}</h3>
                <p>{p.desc || p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION DIVIDER: PROGRAM -> DRESS */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="monogram"
          monogram={initials}
        />

        {/* DRESS CODE */}
        <section className="section dress">
          <Heading eyebrow="DRESS CODE" className="reveal-on-scroll">Gợi ý trang phục</Heading>
          <div className="dress-layout reveal-on-scroll">
            <div>
              <p>
                Để cùng nhau tạo nên những khung hình kỷ niệm hài hòa và trọn vẹn nhất, quý khách có thể ưu tiên lựa chọn trang phục theo bảng màu gợi ý dưới đây:
              </p>
              <div className="swatches">
                {dressCode.map((c: any) => (
                  <div key={c.name}>
                    <span style={{ background: c.color }} />
                    <small>{c.name}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="dress-photo-card">
              <SafeImage src="/assets/dress-code.jpg" alt="Trang phục gợi ý" />
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER: DRESS -> GALLERY */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="garland"
        />

        {/* MOMENTS & OUR GALLERY SIDE-BY-SIDE */}
        <section id="gallery" className="section">
          <div className="media-showcase-section">
            {/* LEFT: MOMENTS */}
            <div className="moments-col reveal-on-scroll">
              <div className="section-heading" style={{ textAlign: "left" }}>
                <span className="eyebrow">MOMENTS</span>
                <h2 style={{ fontSize: "32px", margin: "8px 0" }}>Thước phim kỷ niệm</h2>
                <div className="heading-ornament" style={{ textAlign: "left" }}>──── ♡ ────</div>
              </div>
              <div className="video-card-container">
                <div className="video-main-frame">
                  {ytEmbed ? (
                    <iframe
                      src={ytEmbed}
                      title="Wedding video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <SafeImage src="/assets/video-poster.jpg" alt="Thước phim kỷ niệm" />
                      <button
                        type="button"
                        className="video-play-btn"
                        onClick={() => toast.info("Video đang được đồng bộ...")}
                        aria-label="Phát video"
                      >
                        <Play size={24} fill="currentColor" />
                      </button>
                    </>
                  )}
                </div>
                <div className="video-thumbnails-strip">
                  {["/assets/gallery-1.jpg", "/assets/gallery-2.jpg", "/assets/gallery-3.jpg"].map((img, i) => (
                    <div
                      key={i}
                      className="video-thumb-item"
                      onClick={() => setLightbox(resolveImg(img))}
                    >
                      <SafeImage src={img} alt={`Video preview ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: GALLERY */}
            <div className="gallery-col reveal-on-scroll">
              <div className="section-heading" style={{ textAlign: "left" }}>
                <span className="eyebrow">OUR GALLERY</span>
                <h2 style={{ fontSize: "32px", margin: "8px 0" }}>Bộ sưu tập khoảnh khắc</h2>
                <div className="heading-ornament" style={{ textAlign: "left" }}>──── ♡ ────</div>
              </div>
              <div className="gallery-grid-6 stagger-grid">
                {[
                  "/assets/gallery-1.jpg",
                  "/assets/gallery-2.jpg",
                  "/assets/gallery-3.jpg",
                  "/assets/gallery-4.jpg",
                  "/assets/gallery-5.jpg",
                  "/assets/gallery-6.jpg",
                ].map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    className="reveal-on-scroll"
                    onClick={() => setLightbox(resolveImg(img))}
                    aria-label={`Xem ảnh cưới ${i + 1}`}
                  >
                    <SafeImage src={img} alt={`Khoảnh khắc cưới ${i + 1}`} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn outline gallery-more-btn"
                onClick={() => setLightbox(resolveImg("/assets/gallery-1.jpg"))}
              >
                Xem thêm →
              </button>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER: GALLERY -> INVITATIONS */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="monogram"
          monogram={initials}
        />

        {/* INVITATION CARDS (4 IN A ROW) */}
        <section className="section invitations">
          <Heading eyebrow="INVITATION" className="reveal-on-scroll">Thiệp mời trân trọng</Heading>
          <div className="invitations-grid-4 stagger-grid">
            {invitationCards.map((c, i) => (
              <div
                className="invitation-card-item reveal-on-scroll"
                key={i}
                onClick={() => setLightbox(resolveImg(c.img))}
              >
                <div className="invitation-card-preview">
                  <SafeImage src={c.img} alt={c.label} />
                </div>
                <h3>{c.label}</h3>
                <small>{c.subtitle} ↗</small>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION DIVIDER: INVITATIONS -> GIFTS */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="garland"
        />

        {/* WEDDING GIFTS: HỘP MỪNG DUYÊN */}
        <section className="section gifts">
          <Heading eyebrow="WEDDING GIFT" className="reveal-on-scroll">Hộp mừng duyên</Heading>
          <p className="reveal-on-scroll">
            Sự hiện diện và lời chúc của bạn là món quà ý nghĩa nhất. Nếu muốn gửi mừng cưới, bạn có thể nhấn vào hộp quà bên dưới để xem thông tin chuyển khoản.
          </p>
          <div className="two-cols stagger-grid">
            {gifts.map((g, i) => (
              <article className="soft-card gift-card reveal-on-scroll" key={i}>
                <div className="inline-block p-4 rounded-full bg-soft mb-3 border border-line">
                  <Gift size={32} className="text-accent" />
                </div>
                <h3>{g.name}</h3>
                {gift === i ? (
                  <div className="gift-info">
                    {g.qr && <SafeImage src={g.qr} alt="Mã QR chuyển khoản" />}
                    {g.bank && g.account ? (
                      <>
                        <p>{g.bank} · {g.owner}</p>
                        <strong>{g.account}</strong>
                        <button
                          className="text-btn"
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(g.account);
                            toast.success("Đã sao chép số tài khoản!");
                          }}
                        >
                          <Copy size={14} /> Sao chép số tài khoản
                        </button>
                      </>
                    ) : (
                      <p>Chưa cập nhật thông tin chuyển khoản.</p>
                    )}
                  </div>
                ) : (
                  <p>Nhấn vào hộp quà để xem thông tin chuyển khoản</p>
                )}
                <button className="btn" type="button" onClick={() => setGift(gift === i ? -1 : i)}>
                  {gift === i ? "Đóng hộp" : "Mở hộp ✶"}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION DIVIDER: GIFTS -> RSVP */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="monogram"
          monogram={initials}
        />

        {/* BLESSINGS & RSVP SIDE-BY-SIDE */}
        <section id="rsvp" className="section">
          <div className="wishes-rsvp-row">
            {/* LEFT: BLESSINGS */}
            <div id="wishes" className="wishes-card-wrapper reveal-on-scroll">
              <div className="section-heading" style={{ textAlign: "left", marginBottom: "20px" }}>
                <span className="eyebrow">BLESSINGS</span>
                <h2 style={{ fontSize: "28px", margin: "6px 0" }}>Sổ lưu bút chúc phúc</h2>
                <div className="heading-ornament" style={{ textAlign: "left" }}>──── ♡ ────</div>
              </div>

              <form onSubmit={onSendWish}>
                <label>
                  Tên của bạn *
                  <input
                    required
                    value={wishName}
                    onChange={(e) => setWishName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                  />
                </label>
                <label>
                  Lời chúc của bạn...
                  <textarea
                    required
                    rows={4}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Viết lời chúc gửi tới đôi uyên ương..."
                  />
                </label>
                <button className="btn w-full justify-center" type="submit" disabled={wishSubmitting}>
                  {wishSubmitting ? "Đang gửi…" : "Gửi lời chúc →"}
                </button>
              </form>

              <div className="wish-list mt-6">
                {(wishList.length > 0
                  ? wishList
                  : [
                      {
                        guest_name: "Phương Thảo & Minh Đức",
                        message: "Chúc hai bạn một đời an yên, cùng nhau vượt qua mọi sóng gió và mãi giữ nụ cười rạng rỡ như ngày hôm nay!",
                        date: "27/10/2026",
                      },
                      {
                        guest_name: "Gia đình Bác Hải",
                        message: "Chúc hai cháu trăm năm hạnh phúc, gia đình êm ấm thuận hòa, sớm đón quý tử!",
                        date: "27/10/2026",
                      },
                      {
                        guest_name: "Hội Bạn Thân Đại Học",
                        message: "Cuối cùng ngày này cũng tới! Chúc cô dâu chú rể trăm năm hòa hợp, mãi ngọt ngào như thuở ban đầu!",
                        date: "27/10/2026",
                      },
                    ]
                ).map((x: any, i: number) => {
                  const initial = (x.guest_name || x.name || "K").trim()[0];
                  return (
                    <article className="wish-entry" key={x.id || i}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="wishes-avatar">{initial}</div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "15px" }}>{x.guest_name || x.name}</h4>
                          <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                            {x.created_at
                              ? new Date(x.created_at).toLocaleDateString("vi-VN")
                              : x.date || "27/10/2026"}
                          </small>
                        </div>
                      </div>
                      <p style={{ margin: "4px 0 0 46px", fontSize: "13px" }}>{x.message || x.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: RSVP */}
            <div className="rsvp-card-wrapper reveal-on-scroll">
              <div className="section-heading" style={{ textAlign: "left", marginBottom: "15px" }}>
                <span className="eyebrow">R.S.V.P</span>
                <h2 style={{ fontSize: "28px", margin: "6px 0" }}>Xác nhận tham dự</h2>
                <div className="heading-ornament" style={{ textAlign: "left" }}>──── ♡ ────</div>
              </div>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
                Để ban tổ chức chuẩn bị chu đáo nhất, xin quý khách vui lòng phản hồi trước ngày cưới.
              </p>

              {rsvpDone ? (
                <div className="text-center py-12">
                  <Check size={48} className="text-accent mx-auto mb-3" />
                  <h3 style={{ fontSize: "20px" }}>Cảm ơn bạn đã xác nhận!</h3>
                  <p className="mt-2 text-muted-foreground text-sm">
                    Phản hồi của bạn đã được gửi trực tiếp tới cô dâu chú rể.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSendRsvp}>
                  <div className="form-grid">
                    <label>
                      Họ và tên *
                      <input
                        required
                        value={rsvp.name}
                        onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })}
                        placeholder="Nhập họ và tên"
                      />
                    </label>
                    <label>
                      Số điện thoại
                      <input
                        type="tel"
                        value={rsvp.phone}
                        onChange={(e) => setRsvp({ ...rsvp, phone: e.target.value })}
                        placeholder="Nhập số điện thoại"
                      />
                    </label>
                  </div>

                  <label>
                    Email (nếu có)
                    <input
                      type="email"
                      value={rsvp.email}
                      onChange={(e) => setRsvp({ ...rsvp, email: e.target.value })}
                      placeholder="Nhập email (nếu có)"
                    />
                  </label>

                  <div className="form-grid">
                    <label>
                      Tham dự
                      <select
                        value={rsvp.attendance}
                        onChange={(e) => setRsvp({ ...rsvp, attendance: e.target.value })}
                      >
                        <option value="yes">Tôi sẽ tham dự</option>
                        <option value="no">Rất tiếc không thể tham dự</option>
                      </select>
                    </label>

                    <label>
                      Số khách
                      <select
                        value={rsvp.guests}
                        onChange={(e) => setRsvp({ ...rsvp, guests: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} khách
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mb-4">
                    <small className="block mb-2 font-medium" style={{ color: "var(--deep)" }}>Bạn là khách của:</small>
                    <div className="guest-type-group">
                      <label>
                        <input
                          type="radio"
                          name="guestGroup"
                          checked={rsvp.group === "Nhà chú rể"}
                          onChange={() => setRsvp({ ...rsvp, group: "Nhà chú rể" })}
                        />
                        <span>Khách chàng</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="guestGroup"
                          checked={rsvp.group === "Nhà cô dâu"}
                          onChange={() => setRsvp({ ...rsvp, group: "Nhà cô dâu" })}
                        />
                        <span>Khách nàng</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="guestGroup"
                          checked={rsvp.group === "Khách chung"}
                          onChange={() => setRsvp({ ...rsvp, group: "Khách chung" })}
                        />
                        <span>Khách chung</span>
                      </label>
                    </div>
                  </div>

                  <label>
                    Lời chúc gửi tới cô dâu chú rể...
                    <textarea
                      rows={3}
                      value={rsvp.note}
                      onChange={(e) => setRsvp({ ...rsvp, note: e.target.value })}
                      placeholder="Viết lời chúc của bạn..."
                    />
                  </label>

                  <button type="submit" className="btn w-full justify-center" disabled={rsvpSubmitting}>
                    {rsvpSubmitting ? "Đang gửi…" : "Gửi xác nhận →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER: RSVP -> CLOSING TICKET */}
        <SectionDivider
          theme={theme === "champagne" ? "champagne" : "blush"}
          variant="garland"
        />

        {/* CLOSING INVITATION TICKET & SHARE */}
        <section className="section">
          <div className="closing-ticket-layout">
            {/* LEFT: SHARE THE LOVE */}
            <div className="share-column reveal-on-scroll">
              <span className="eyebrow">SHARE THE LOVE</span>
              <h2>Mời thêm bạn bè</h2>
              <div className="social-circle-buttons">
                {/* Zalo */}
                <button
                  type="button"
                  className="social-btn zalo"
                  title="Chia sẻ qua Zalo"
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.href : "";
                    window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}`, "_blank");
                  }}
                >
                  Zalo
                </button>
                {/* Facebook */}
                <button
                  type="button"
                  className="social-btn facebook"
                  title="Chia sẻ lên Facebook"
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.href : "";
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                  }}
                >
                  <Send size={18} />
                </button>
                {/* Copy Link */}
                <button
                  type="button"
                  className="social-btn link"
                  title="Sao chép liên kết"
                  onClick={handleShare}
                >
                  <LinkIcon size={18} />
                </button>
                {/* Messenger */}
                <button
                  type="button"
                  className="social-btn messenger"
                  title="Chia sẻ qua Messenger"
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.href : "";
                    window.open(`fb-messenger://share/?link=${encodeURIComponent(url)}`, "_blank");
                  }}
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>

            {/* RIGHT: VIRTUAL PHYSICAL INVITATION TICKET */}
            <div className="invitation-ticket-card reveal-on-scroll">
              <Floral position="ticket-corner top-left" />
              <Floral position="ticket-corner top-right" />
              <Floral position="ticket-corner bottom-left" />
              <Floral position="ticket-corner bottom-right" />

              <div className="ticket-content">
                <span className="eyebrow" style={{ letterSpacing: "0.2em", fontSize: "10px" }}>SAVE THE DATE</span>
                <div className="ticket-sub">Trân trọng kính mời tham dự tiệc cưới</div>
                <div className="ticket-names">{couple.bride_name} &amp; {couple.groom_name}</div>
                <div className="ticket-date">{dateLabel}</div>
                <div className="ticket-venue">
                  {couple.venue_name || "GEM Center — Grand Ballroom"} — {couple.venue_address || "08 Nguyễn Bỉnh Khiêm, P. Đa Kao, Quận 1, TP. Hồ Chí Minh"}
                </div>
                {couple.quote && (
                  <blockquote>“{couple.quote}”</blockquote>
                )}
                <div style={{ fontFamily: "'Charm', cursive", fontSize: "16px", color: "var(--accent)", marginTop: "8px" }}>
                  {couple.bride_name} &amp; {couple.groom_name} ♡
                </div>
              </div>

              <div className="ticket-qr-col">
                <span>Quét để mở thiệp</span>
                <div className="ticket-qr-frame">
                  <QRCodeSVG
                    value={typeof window !== "undefined" ? window.location.href : "http://localhost:3000/couples/demo"}
                    size={104}
                    bgColor="#ffffff"
                    fgColor="#683c42"
                    level="M"
                  />
                </div>
                <small>{typeof window !== "undefined" ? window.location.href : "http://localhost:3000/couples/demo"}</small>
              </div>
            </div>
          </div>
        </section>

        {/* MARIEE FOOTER & TELEGRAM CONTACT */}
        <MarieeFooter
          theme={theme === "champagne" ? "champagne" : "blush"}
          coupleName={`${couple.bride_name} & ${couple.groom_name}`}
        />
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center cursor-pointer hover:bg-white/30"
          >
            <X size={24} />
          </button>
          <img
            src={lightbox}
            alt="Phóng to ảnh"
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
