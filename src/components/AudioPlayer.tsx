import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

// Royal wedding romantic piano melody (royalty-free standard audio)
const WEDDING_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=wedding-piano-112191.mp3";

export function AudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(WEDDING_MUSIC_URL);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    // Try auto-play on first user interaction if browser policy blocks autoplay
    const handleFirstInteraction = () => {
      if (audioRef.current && !playing) {
        audioRef.current.play().then(() => {
          setPlaying(true);
        }).catch(() => {
          // Autoplay blocked, wait for user click
        });
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      audio.pause();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setPlaying(true);
      }).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full border border-gold/50 bg-background/90 backdrop-blur-md shadow-elegant transition-all duration-500 hover:scale-105 hover:border-gold cursor-pointer ${
          playing ? "ring-2 ring-gold/40" : "opacity-80"
        }`}
        aria-label={playing ? "Tắt nhạc cưới" : "Bật nhạc cưới"}
      >
        <span
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-gold/20 to-primary/10 transition-opacity ${
            playing ? "animate-pulse" : "opacity-0"
          }`}
        />
        <div className={`relative transition-transform duration-700 ${playing ? "rotate-180" : ""}`}>
          {playing ? (
            <Volume2 size={20} className="text-gold group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX size={20} className="text-muted-foreground group-hover:text-gold transition-colors" />
          )}
        </div>
      </button>

      {/* Music label tooltip */}
      <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/90 backdrop-blur-md border border-gold/30 text-xs text-foreground shadow-sm pointer-events-none animate-fade-in">
        <Music size={12} className={playing ? "text-gold animate-bounce" : "text-muted-foreground"} />
        <span className="font-serif italic tracking-wider">{playing ? "Giai điệu tình yêu" : "Bật nhạc nền"}</span>
      </div>
    </div>
  );
}
