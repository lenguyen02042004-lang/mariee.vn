import React from "react";

interface SectionDividerProps {
  theme?: "blush" | "champagne" | string;
  variant?: "garland" | "monogram" | "clean";
  monogram?: string;
  className?: string;
}

export default function SectionDivider({
  theme = "blush",
  variant = "garland",
  monogram = "TM · HN",
  className = "",
}: SectionDividerProps) {
  const t = theme === "champagne" ? "champagne" : "blush";
  const garlandSrc = `/assets/wedding-florals/${t}/${t}-horizontal-garland.webp`;

  return (
    <div
      className={`luxury-section-divider ${className}`}
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "920px",
        margin: "60px auto 40px",
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {/* Soft Ombre Blend Line */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <span
          style={{
            flex: 1,
            height: "1px",
            background:
              t === "champagne"
                ? "linear-gradient(90deg, transparent, rgba(185, 152, 104, 0.45) 70%, rgba(185, 152, 104, 0.7))"
                : "linear-gradient(90deg, transparent, rgba(214, 154, 166, 0.45) 70%, rgba(214, 154, 166, 0.7))",
          }}
        />

        {variant === "monogram" ? (
          <span
            style={{
              fontFamily: "'Charm', cursive",
              fontSize: "18px",
              color: t === "champagne" ? "var(--wh-accent, #a78362)" : "var(--wh-accent, #c77d90)",
              letterSpacing: "0.1em",
              padding: "0 8px",
            }}
          >
            {monogram} ♡
          </span>
        ) : (
          <span
            style={{
              fontSize: "15px",
              color: t === "champagne" ? "var(--wh-accent, #a78362)" : "var(--wh-accent, #c77d90)",
            }}
          >
            ♡
          </span>
        )}

        <span
          style={{
            flex: 1,
            height: "1px",
            background:
              t === "champagne"
                ? "linear-gradient(90deg, rgba(185, 152, 104, 0.7), rgba(185, 152, 104, 0.45) 30%, transparent)"
                : "linear-gradient(90deg, rgba(214, 154, 166, 0.7), rgba(214, 154, 166, 0.45) 30%, transparent)",
          }}
        />
      </div>

      {/* Watercolor Garland Feature */}
      {variant === "garland" && (
        <img
          src={garlandSrc}
          alt=""
          loading="lazy"
          style={{
            width: "clamp(240px, 32vw, 360px)",
            height: "auto",
            marginTop: "12px",
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.04))",
            opacity: 0.95,
          }}
        />
      )}
    </div>
  );
}
