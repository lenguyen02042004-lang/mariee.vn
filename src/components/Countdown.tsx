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
    ["NGÀY", mounted ? String(d).padStart(2, "0") : "00"],
    ["GIỜ",  mounted ? String(h).padStart(2, "0") : "00"],
    ["PHÚT", mounted ? String(m).padStart(2, "0") : "00"],
    ["GIÂY", mounted ? String(s).padStart(2, "0") : "00"],
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-md border border-gold/35 p-7 sm:p-10 shadow-elegant text-center max-w-2xl mx-auto">
      {/* Delicate antique gold inner framing */}
      <div className="absolute inset-2 sm:inset-3 border border-gold/20 rounded-xl pointer-events-none" />

      {/* Royal Crest / Header */}
      <div className="relative z-10 flex items-center justify-center gap-3 mb-2">
        <span className="h-px w-10 bg-gold/50" />
        <span className="text-[11px] font-serif uppercase tracking-[0.35em] text-gold/90 font-medium">
          COUNTDOWN TO OUR FOREVER
        </span>
        <span className="h-px w-10 bg-gold/50" />
      </div>

      <h3 className="relative z-10 font-script text-3xl sm:text-4xl text-foreground font-normal mb-8">
        Cùng đếm ngược ngày chung đôi
      </h3>

      {/* Chronometer Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-6 items-center">
        {cells.map(([label, val], idx) => (
          <div key={label} className="relative flex flex-col items-center">
            {/* Divider point between units */}
            {idx > 0 && (
              <span className="absolute -left-1 sm:-left-3 top-1/2 -translate-y-1/2 text-gold/40 text-xs sm:text-sm select-none">
                ✦
              </span>
            )}
            <div className="font-display text-4xl sm:text-6xl text-foreground font-light tabular-nums tracking-tight">
              {val}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground mt-2 font-serif font-medium">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
