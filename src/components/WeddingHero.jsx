import React, { useEffect, useState } from 'react';
import './WeddingHero.css';

const TARGET = new Date('2026-11-28T17:30:00+07:00').getTime();
function remaining() {
  const seconds = Math.max(0, Math.floor((TARGET - Date.now()) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}

function FloralCorner({ className = '' }) {
  return <svg className={`wh-floral ${className}`} viewBox="0 0 320 360" fill="none" aria-hidden="true">
    <path d="M4 330C70 290 90 213 135 155S236 70 308 12" stroke="#9B8C70" strokeWidth="2" opacity=".65"/>
    {[[45,288,1],[95,229,.8],[145,156,1.2],[207,104,.9],[270,48,1.1],[117,264,.6],[223,167,.7]].map(([x,y,s],i)=><g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
      {[0,72,144,216,288].map(a=><ellipse key={a} cx="0" cy="-18" rx="11" ry="22" transform={`rotate(${a})`} fill={i%2?'#F2C8C8':'#E9ADB8'} opacity=".83" stroke="#D69AA6" strokeWidth=".8"/>)}
      <circle r="8" fill="#F8E7B9"/><circle r="3" fill="#C8A16E"/>
    </g>)}
    {[[60,260,-25],[118,196,30],[170,130,-40],[237,81,30],[275,105,-30],[89,303,20]].map(([x,y,a],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${a})`}><ellipse cx="-11" cy="-8" rx="9" ry="20" fill="#9AA68C" opacity=".7"/><ellipse cx="11" cy="-8" rx="9" ry="20" fill="#B3BDA7" opacity=".7"/></g>)}
  </svg>;
}

export default function WeddingHero({
  theme = 'blush',
  image = '/assets/wedding/hero.jpg',
  bride = 'Thảo My',
  groom = 'Hoàng Nam',
  onRSVP,
}) {
  const [time, setTime] = useState(remaining);
  useEffect(() => { const id = window.setInterval(() => setTime(remaining()), 1000); return () => window.clearInterval(id); }, []);
  const goRSVP = () => { if (onRSVP) onRSVP(); else document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }); };
  
  const floralTheme = theme === 'champagne' ? 'champagne' : 'blush';
  const cornerTop = `/assets/wedding-florals/${floralTheme}/${floralTheme}-corner-top-left.webp`;
  const cornerBottom = `/assets/wedding-florals/${floralTheme}/${floralTheme}-corner-bottom-right.webp`;
  const garland = `/assets/wedding-florals/${floralTheme}/${floralTheme}-horizontal-garland.webp`;

  return <section className={`wedding-hero wedding-hero--${theme}`} id="wedding-home">
    <div className="wh-stage">
      <div className="wh-photo">
        <img src={image} alt={`Ảnh cưới của ${bride} và ${groom}`} />
        <div className="wh-photo-caption">Cùng nhau đi qua thanh xuân<br/>và những mùa yêu thương...</div>
      </div>
      <div className="wh-content">
        <img src={cornerTop} className="wh-floral wh-floral--top" alt="" aria-hidden="true" />
        <span className="wh-eyebrow">SAVE OUR DATE</span>
        <h1 className="wh-names"><span>{bride}</span><em>&amp;</em><span>{groom}</span></h1>
        <div className="wh-rule"><span>♡</span></div>
        <p className="wh-date">Thứ Bảy, 28 tháng 11, 2026</p>
        <p className="wh-location">GEM Center · TP. Hồ Chí Minh</p>
        <button className="wh-rsvp" type="button" onClick={goRSVP}>Gửi lời chúc &amp; RSVP <span aria-hidden="true">♡</span></button>
        <img src={cornerBottom} className="wh-floral wh-floral--bottom" alt="" aria-hidden="true" />
      </div>
    </div>
    <div className="wh-countdown" aria-label="Đếm ngược đến ngày cưới">
      <img src={garland} className="wh-countdown-garland" alt="" aria-hidden="true" />
      <p className="wh-count-label">COUNTING DOWN</p><p className="wh-count-subtitle">Cùng đếm ngược ngày chung đôi</p>
      <div className="wh-time-grid">{['Ngày','Giờ','Phút','Giây'].map((label,i)=><div className="wh-time-unit" key={label}><strong>{String(time[i]).padStart(2,'0')}</strong><span>{label}</span></div>)}</div>
    </div>
    <blockquote className="wh-quote">“Hạnh phúc nhất trên đời là khi tìm được một người muốn cùng bạn già đi theo năm tháng.”<cite>— {bride} &amp; {groom} — ♡</cite></blockquote>
  </section>;
}
