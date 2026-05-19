import { useEffect, useState } from "react";

export function Countdown({ target }: { target: string }) {
  // Avoid SSR/CSR hydration mismatch: render placeholders on first paint,
  // start the live countdown only after mounting on the client.
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
    ["Ngày", mounted ? String(d).padStart(2, "0") : "—"],
    ["Giờ",  mounted ? String(h).padStart(2, "0") : "—"],
    ["Phút", mounted ? String(m).padStart(2, "0") : "—"],
    ["Giây", mounted ? String(s).padStart(2, "0") : "—"],
  ];
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto">
      {cells.map(([label, val]) => (
        <div key={label} className="bg-card/80 backdrop-blur rounded-lg py-5 md:py-7 text-center shadow-soft border border-border/40">
          <div className="font-display text-3xl md:text-5xl text-primary tabular-nums">{val}</div>
          <div className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
