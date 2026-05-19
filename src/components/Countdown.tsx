import { useEffect, useState } from "react";

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const cells = [["Ngày",d],["Giờ",h],["Phút",m],["Giây",s]] as const;
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto">
      {cells.map(([label,val]) => (
        <div key={label} className="bg-card/80 backdrop-blur rounded-lg py-5 md:py-7 text-center shadow-soft border border-border/40">
          <div className="font-display text-3xl md:text-5xl text-primary tabular-nums">{String(val).padStart(2,"0")}</div>
          <div className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
