import { useEffect, useState } from "react";
import { resolveImg } from "@/lib/image-map";

export function HeroSlider({ images, brideName, groomName, date }: { images: string[]; brideName: string; groomName: string; date?: string | null }) {
  const [i, setI] = useState(0);
  const list = images.filter(Boolean);
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI(p => (p + 1) % list.length), 5500);
    return () => clearInterval(t);
  }, [list.length]);

  return (
    <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden">
      {list.map((src, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}>
          <img src={resolveImg(src)} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
        </div>
      ))}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
        <p className="font-script text-3xl md:text-5xl text-blush mb-4">the wedding of</p>
        <h1 className="font-display text-5xl md:text-8xl text-balance">
          {brideName} <span className="font-script text-gold inline-block mx-2 md:mx-4">&</span> {groomName}
        </h1>
        {date && <p className="mt-8 text-sm md:text-base uppercase tracking-[0.4em]">{new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}</p>}
      </div>
      {list.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {list.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx+1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-white" : "w-4 bg-white/50"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
