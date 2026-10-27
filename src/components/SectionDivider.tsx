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
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 2,
        boxSizing: "border-box",
        overflow: "hidden",
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
                ? "linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.45) 70%, rgba(201, 152, 62, 0.85))"
                : "linear-gradient(90deg, transparent, rgba(240, 110, 145, 0.45) 70%, rgba(226, 92, 128, 0.85))",
          }}
        />

        {variant === "monogram" ? (
          <span
            style={{
              fontFamily: "'Charm', cursive",
              fontSize: "19px",
              color: t === "champagne" ? "#c9983e" : "#e25c80",
              letterSpacing: "0.1em",
              padding: "0 8px",
              fontWeight: 600,
            }}
          >
            {monogram} ♡
          </span>
        ) : (
          <span
            style={{
              fontSize: "16px",
              color: t === "champagne" ? "#c9983e" : "#e25c80",
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
                ? "linear-gradient(90deg, rgba(201, 152, 62, 0.85), rgba(218, 165, 32, 0.45) 30%, transparent)"
                : "linear-gradient(90deg, rgba(226, 92, 128, 0.85), rgba(240, 110, 145, 0.45) 30%, transparent)",
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
            width: "clamp(180px, 70vw, 360px)",
            maxWidth: "100%",
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
