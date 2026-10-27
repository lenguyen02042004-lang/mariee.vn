import React, { useEffect, useRef, useState } from "react";

interface FallingPetalsProps {
  theme?: "blush" | "champagne" | string;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rot: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  petalType: number; // 0 to 4 different petal shapes
}

export default function FallingPetals({ theme = "blush" }: FallingPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const isChampagne = theme === "champagne";

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Number of petals: lightweight and silky smooth (16 on desktop, 8 on mobile)
    const isMobile = width < 768;
    const petalCount = isMobile ? 9 : 18;

    // Palette shades
    const colors = isChampagne
      ? [
          { fill: "rgba(232, 211, 182, 0.82)", stroke: "rgba(185, 152, 104, 0.4)" }, // Champagne
          { fill: "rgba(247, 240, 229, 0.88)", stroke: "rgba(214, 191, 163, 0.35)" }, // Ivory
          { fill: "rgba(214, 191, 163, 0.78)", stroke: "rgba(168, 131, 98, 0.4)" },  // Warm Beige
          { fill: "rgba(242, 230, 210, 0.85)", stroke: "rgba(185, 152, 104, 0.3)" }, // Soft Gold
        ]
      : [
          { fill: "rgba(233, 184, 190, 0.85)", stroke: "rgba(214, 154, 166, 0.45)" }, // Blush
          { fill: "rgba(248, 216, 220, 0.88)", stroke: "rgba(224, 170, 180, 0.4)" },  // Soft Rose
          { fill: "rgba(217, 166, 165, 0.80)", stroke: "rgba(180, 120, 130, 0.45)" }, // Dusty Rose
          { fill: "rgba(255, 242, 244, 0.90)", stroke: "rgba(233, 184, 190, 0.35)" }, // Cream Petal
        ];

    const petals: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 9 + 11, // 11px to 20px
        speedY: Math.random() * 0.9 + 0.7, // gentle descent
        speedX: Math.random() * 0.6 - 0.2, // light drift
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.2,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.02 + 0.015,
        opacity: Math.random() * 0.35 + 0.55,
        petalType: Math.floor(Math.random() * colors.length),
      });
    }

    let time = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(time + i) * 0.75 + p.speedX;
        p.rot += p.rotSpeed;
        p.flip += p.flipSpeed;

        // Reset when falling out of viewport
        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * width;
        }
        if (p.x > width + 40) p.x = -20;
        else if (p.x < -40) p.x = width + 20;

        const color = colors[p.petalType];

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.scale(Math.sin(p.flip), 1); // 3D flipping simulation

        // Draw soft botanical petal curve
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.6, p.size * 1.1, p.size * 0.7, 0, p.size);
        ctx.bezierCurveTo(-p.size * 1.1, p.size * 0.7, -p.size * 0.9, -p.size * 0.6, 0, -p.size);
        ctx.fillStyle = color.fill;
        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.stroke();

        // Inner translucent vein line
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.7);
        ctx.quadraticCurveTo(p.size * 0.15, 0, 0, p.size * 0.7);
        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = p.opacity * 0.5;
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, isChampagne]);

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 35,
          }}
        />
      )}
      {/* Floating Petal Effect Control Pill */}
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        aria-label={enabled ? "Tắt hiệu ứng cánh hoa bay" : "Bật hiệu ứng cánh hoa bay"}
        title={enabled ? "Tắt cánh hoa bay" : "Bật cánh hoa bay"}
        style={{
          position: "fixed",
          bottom: "22px",
          left: "22px",
          zIndex: 45,
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "8px 14px",
          borderRadius: "999px",
          border: "1px solid var(--line, #e8d3b6)",
          background: "rgba(255, 253, 250, 0.85)",
          backdropFilter: "blur(8px)",
          color: "var(--deep, #86654c)",
          fontSize: "11px",
          fontFamily: "'Montserrat', sans-serif",
          letterSpacing: "0.06em",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
          transition: "transform 0.2s, background 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 22px rgba(0, 0, 0, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 18px rgba(0, 0, 0, 0.08)";
        }}
      >
        <span style={{ fontSize: "14px", lineHeight: 1 }}>{enabled ? "🌸" : "🍂"}</span>
        <span>{enabled ? "Cánh hoa: Bật" : "Cánh hoa: Tắt"}</span>
      </button>
    </>
  );
}
