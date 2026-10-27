import { useEffect, useState } from "react";

export function Countdown({ target }: { target: string }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = mounted ? Math.max(0, new Date(target).getTime() - now) : 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const cells: ReadonlyArray<readonly [string, string]> = [
    ["Ngày", mounted ? String(d).padStart(2, "0") : "00"],
    ["Giờ",  mounted ? String(h).padStart(2, "0") : "00"],
    ["Phút", mounted ? String(m).padStart(2, "0") : "00"],
    ["Giây", mounted ? String(s).padStart(2, "0") : "00"],
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card/90 backdrop-blur-md border border-gold/30 p-6 sm:p-10 shadow-elegant text-center">
      {/* Decorative floral or corner accent */}
      <div className="absolute top-2 left-4 text-xs font-serif text-gold/60 uppercase tracking-[0.3em]">
        Counting Down
      </div>
      <div className="font-script text-3xl sm:text-4xl text-primary mb-6">
        Cùng đếm ngược ngày chung đôi
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-6 max-w-xl mx-auto">
        {cells.map(([label, val]) => (
          <div
            key={label}
            className="group relative rounded-2xl bg-gradient-to-b from-secondary/40 via-card to-secondary/20 p-3 sm:p-5 border border-border/60 shadow-soft transition-all duration-300 hover:border-gold/50 hover:shadow-elegant"
          >
            <div className="font-display text-3xl sm:text-5xl text-primary font-semibold tabular-nums tracking-tight">
              {val}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1.5 font-medium">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
