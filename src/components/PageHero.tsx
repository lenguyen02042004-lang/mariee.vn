import { ReactNode } from "react";
import { cdnSrc, cdnSrcSet } from "@/lib/cdn-image";

type Props = {
  image: string;
  script: string;
  title: ReactNode;
  subtitle?: ReactNode;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
};

const SIZE = {
  sm: "h-[38vh] min-h-[240px] sm:h-[32vh] sm:min-h-[260px]",
  md: "h-[46vh] min-h-[320px] sm:h-[44vh] sm:min-h-[360px]",
  lg: "h-[54vh] min-h-[360px] sm:h-[52vh] sm:min-h-[420px]",
};

export function PageHero({ image, script, title, subtitle, size = "lg", children }: Props) {
  return (
    <section className={`relative ${SIZE[size]} w-full max-w-full overflow-hidden`}>
      <img
        src={cdnSrc(image, { width: 1600, quality: 78 })}
        srcSet={cdnSrcSet(image, [480, 640, 800, 1080, 1440, 1920], 78)}
        sizes="100vw"
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/40 to-black/55" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
        <p className="font-script text-3xl md:text-5xl text-blush">{script}</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-balance max-w-3xl">{title}</h1>
        {subtitle && <p className="mt-4 text-white/85 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}