import React, { useEffect, useState } from 'react';
import './WeddingHero.css';

const TARGET = new Date('2026-11-28T17:30:00+07:00').getTime();
function remaining() {
  const seconds = Math.max(0, Math.floor((TARGET - Date.now()) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}

export interface WeddingHeroProps {
  theme?: 'blush' | 'champagne' | string;
  image?: string;
  images?: string[];
  bride?: string;
  groom?: string;
  dateText?: string;
  locationText?: string;
  onRSVP?: () => void;
}

export default function WeddingHero({
  theme = 'blush',
  image = '/assets/hero-luxury-couple.jpg',
  images,
  bride = 'Thảo My',
  groom = 'Hoàng Nam',
  dateText = 'Thứ Bảy, 28 tháng 11, 2026',
  locationText = 'GEM Center · TP. Hồ Chí Minh',
  onRSVP,
}: WeddingHeroProps) {
  const [time, setTime] = useState(remaining);
  useEffect(() => {
    const id = window.setInterval(() => setTime(remaining()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // 3-slide carousel for couple photos
  const slideList: string[] = (
    images && images.length > 0
      ? images
      : image
        ? [image]
        : ['/assets/hero-luxury-couple.jpg', '/assets/hero-wedding-1.jpg', '/assets/hero-wedding-2.jpg']
  ).filter(Boolean);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slideList.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideList.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [slideList.length]);

  const goRSVP = () => {
    if (onRSVP) onRSVP();
    else document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
  };

  const floralTheme = theme === 'champagne' ? 'champagne' : 'blush';
  const cornerTop = `/assets/wedding-florals/${floralTheme}/${floralTheme}-corner-top-left.webp`;
  const cornerBottom = `/assets/wedding-florals/${floralTheme}/${floralTheme}-corner-bottom-right.webp`;
  const garland = `/assets/wedding-florals/${floralTheme}/${floralTheme}-horizontal-garland.webp`;

  return (
    <section className={`wedding-hero wedding-hero--${theme}`} id="wedding-home">
      <div className="wh-stage">
        {/* PHOTO SECTION: 3-SLIDE CAROUSEL */}
        <div className="wh-photo">
          {slideList.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Ảnh cưới của ${bride} và ${groom} - hình ${i + 1}`}
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 42%',
                opacity: i === currentSlide ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out, transform 6s ease-out',
                transform: i === currentSlide ? 'scale(1.03)' : 'scale(1)',
                zIndex: i === currentSlide ? 1 : 0,
              }}
            />
          ))}

          {slideList.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                display: 'flex',
                gap: '8px',
              }}
            >
              {slideList.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: i === currentSlide ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '99px',
                    background: i === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    border: 0,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                />
              ))}
            </div>
          )}

          <div className="wh-photo-caption">
            Cùng nhau đi qua thanh xuân
            <br />
            và những mùa yêu thương...
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="wh-content">
          <img src={cornerTop} className="wh-floral wh-floral--top" alt="" aria-hidden="true" />
          <span className="wh-eyebrow">SAVE OUR DATE</span>
          <h1 className="wh-names">
            <span>{bride}</span>
            <em>&amp;</em>
            <span>{groom}</span>
          </h1>
          <div className="wh-rule">
            <span>♡</span>
          </div>
          <p className="wh-date">{dateText}</p>
          <p className="wh-location">{locationText}</p>
          <button className="wh-rsvp" type="button" onClick={goRSVP}>
            Gửi lời chúc &amp; RSVP <span aria-hidden="true">♡</span>
          </button>
          <img src={cornerBottom} className="wh-floral wh-floral--bottom" alt="" aria-hidden="true" />
        </div>
      </div>

      {/* COUNTDOWN SECTION */}
      <div className="wh-countdown" aria-label="Đếm ngược đến ngày cưới">
        <img src={garland} className="wh-countdown-garland" alt="" aria-hidden="true" />
        <p className="wh-count-label">COUNTING DOWN</p>
        <p className="wh-count-subtitle">Cùng đếm ngược ngày chung đôi</p>
        <div className="wh-time-grid">
          {['Ngày', 'Giờ', 'Phút', 'Giây'].map((label, i) => (
            <div className="wh-time-unit" key={label}>
              <strong>{String(time[i]).padStart(2, '0')}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <blockquote className="wh-quote">
        “Hạnh phúc nhất trên đời là khi tìm được một người muốn cùng bạn già đi theo năm tháng.”
        <cite>
          — {bride} &amp; {groom} — ♡
        </cite>
      </blockquote>
    </section>
  );
}
