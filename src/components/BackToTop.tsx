import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  theme?: "blush" | "champagne" | string;
}

export function BackToTop({ theme = "blush" }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const isChampagne = theme === "champagne";

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Cuộn về đầu trang"
      title="Cuộn về đầu trang"
      style={{
        position: "fixed",
        bottom: "22px",
        right: "22px",
        zIndex: 45,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "9px 14px",
        borderRadius: "999px",
        border: isChampagne ? "1px solid rgba(201, 152, 62, 0.4)" : "1px solid rgba(226, 92, 128, 0.4)",
        background: isChampagne
          ? "rgba(255, 252, 245, 0.92)"
          : "rgba(255, 250, 252, 0.92)",
        backdropFilter: "blur(10px)",
        color: isChampagne ? "#9e6f24" : "#c43d63",
        fontSize: "11px",
        fontWeight: 600,
        fontFamily: "'Montserrat', sans-serif",
        letterSpacing: "0.06em",
        cursor: "pointer",
        boxShadow: isChampagne
          ? "0 6px 20px rgba(190, 139, 50, 0.22)"
          : "0 6px 20px rgba(212, 76, 114, 0.22)",
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s, background 0.25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = isChampagne
          ? "0 10px 26px rgba(190, 139, 50, 0.35)"
          : "0 10px 26px rgba(212, 76, 114, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isChampagne
          ? "0 6px 20px rgba(190, 139, 50, 0.22)"
          : "0 6px 20px rgba(212, 76, 114, 0.22)";
      }}
    >
      <ArrowUp size={14} strokeWidth={2.5} />
      <span>Đầu trang</span>
    </button>
  );
}

export default BackToTop;