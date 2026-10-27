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

    // Palette shades - fresh, vibrant & radiant (tươi tắn & không tối)
    const colors = isChampagne
      ? [
          { fill: "rgba(255, 222, 145, 0.92)", stroke: "rgba(224, 172, 55, 0.60)" }, // Radiant Warm Gold
          { fill: "rgba(255, 245, 212, 0.95)", stroke: "rgba(235, 195, 105, 0.50)" }, // Sparkling Champagne
          { fill: "rgba(250, 212, 130, 0.90)", stroke: "rgba(215, 158, 40, 0.55)" },  // Sunlit Yellow Gold
          { fill: "rgba(255, 252, 238, 0.96)", stroke: "rgba(240, 210, 130, 0.45)" }, // Luminous Ivory Gold
        ]
      : [
          { fill: "rgba(255, 168, 192, 0.92)", stroke: "rgba(238, 98, 132, 0.60)" },  // Fresh Rose Petal (tươi tắn)
          { fill: "rgba(255, 202, 218, 0.95)", stroke: "rgba(245, 142, 168, 0.50)" }, // Sweet Sakura Pink
          { fill: "rgba(255, 140, 172, 0.88)", stroke: "rgba(228, 72, 112, 0.60)" },  // Vibrant Blooming Pink
          { fill: "rgba(255, 238, 244, 0.96)", stroke: "rgba(255, 175, 195, 0.45)" }, // Dewy Petal White-Pink
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
