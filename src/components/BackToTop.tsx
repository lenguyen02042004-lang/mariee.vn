import { useEffect, useState } from "react";

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-card/90 text-foreground border border-gold/40 shadow-elegant backdrop-blur-md transition-all duration-300 hover:bg-gold/15 hover:border-gold hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer flex items-center justify-center ${show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-gold" aria-hidden>
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}