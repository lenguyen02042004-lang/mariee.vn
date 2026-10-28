import React from "react";
import { MessageSquare, Heart, Sparkles, ExternalLink } from "lucide-react";

interface MarieeFooterProps {
  theme?: "blush" | "champagne" | string;
  coupleName?: string;
}

export default function MarieeFooter({
  theme = "blush",
  coupleName = "Cô dâu & Chú rể",
}: MarieeFooterProps) {
  const isChampagne = theme === "champagne";
  const accentColor = isChampagne ? "#b8832a" : "#d44c72";
  const lightBg = isChampagne ? "rgba(251, 243, 228, 0.6)" : "rgba(253, 235, 240, 0.6)";
  const borderColor = isChampagne ? "#ede0c8" : "#fcd4df";

  return (
    <footer
      style={{
        width: "100%",
        maxWidth: "920px",
        margin: "50px auto 24px",
        padding: "0 16px",
        position: "relative",
        zIndex: 5,
        boxSizing: "border-box",
      }}
    >
      {/* DELICATE DIVIDER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          marginBottom: "20px",
          opacity: 0.65,
        }}
      >
        <span
          style={{
            height: "1px",
            flex: 1,
            maxWidth: "140px",
            background: `linear-gradient(to right, transparent, ${borderColor})`,
          }}
        />
        <Heart size={14} color={accentColor} fill={accentColor} style={{ opacity: 0.8 }} />
        <span
          style={{
            height: "1px",
            flex: 1,
            maxWidth: "140px",
            background: `linear-gradient(to left, transparent, ${borderColor})`,
          }}
        />
      </div>

      {/* SUBTLE BRAND & ATTRIBUTION BAR */}
      <div
        style={{
          background: lightBg,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "20px",
          border: `1px solid ${borderColor}`,
          padding: "16px 22px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* LEFT: TASTEFUL MARIEE BRANDING */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <a
            href="/"
            style={{
              fontFamily: "'Charm', cursive",
              fontSize: "24px",
              fontWeight: 700,
              color: accentColor,
              textDecoration: "none",
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            Mariée.vn
          </a>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "99px",
              background: "#ffffff",
              color: accentColor,
              fontWeight: 600,
              letterSpacing: "0.05em",
              border: `1px solid ${borderColor}`,
            }}
          >
            Thiệp cưới online
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--muted, #666)",
              display: "inline-block",
            }}
          >
            Trang thiệp cưới của <strong>{coupleName}</strong>
          </span>
        </div>

        {/* RIGHT: COMPACT ACTIONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/gui-thong-tin"
            style={{
              fontSize: "12px",
              color: accentColor,
              textDecoration: "none",
              fontWeight: 500,
              padding: "5px 12px",
              borderRadius: "99px",
              background: "#ffffff",
              border: `1px solid ${borderColor}`,
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Sparkles size={12} color={accentColor} />
            <span>Tạo thiệp cưới tương tự</span>
          </a>

          <a
            href="/contact"
            style={{
              fontSize: "12px",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 600,
              padding: "5px 14px",
              borderRadius: "99px",
              background: isChampagne
                ? "linear-gradient(135deg, #d8a548, #be8b32)"
                : "linear-gradient(135deg, #e86588, #d44c72)",
              boxShadow: isChampagne
                ? "0 3px 10px rgba(190, 139, 50, 0.25)"
                : "0 3px 10px rgba(212, 76, 114, 0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <MessageSquare size={12} />
            <span>Liên hệ Mariée</span>
          </a>
        </div>
      </div>

      {/* MINIMAL BOTTOM COPYRIGHT */}
      <div
        style={{
          marginTop: "12px",
          textAlign: "center",
          fontSize: "11px",
          color: "var(--muted, #888)",
          opacity: 0.85,
        }}
      >
        © {new Date().getFullYear()} <strong>{coupleName}</strong>. Trang thiệp cưới cá nhân hóa bởi{" "}
        <a href="/" style={{ color: accentColor, textDecoration: "none", fontWeight: 600 }}>
          Mariée.vn
        </a>
      </div>
    </footer>
  );
}
