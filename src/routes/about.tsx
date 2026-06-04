import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-wedding-1.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [
    { title: "Giới thiệu — Mariée" },
    { name: "description", content: "Mariée là nền tảng landing page cưới sang trọng kết nối cặp đôi với những vendor cưới hàng đầu Việt Nam." },
  ]}),
});

function About() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
          <p className="font-script text-3xl md:text-5xl text-blush">about us</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-balance max-w-3xl">Câu chuyện của Mariée</h1>
          <p className="mt-4 text-white/85 max-w-2xl">Một nền tảng dành riêng cho ngày trọng đại — nơi mỗi tình yêu được kể bằng ngôn ngữ thiết kế cao cấp.</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        <div>
          <h2 className="font-display text-3xl">Chúng tôi tin</h2>
          <p className="mt-3 text-foreground/80 leading-relaxed">Mỗi đám cưới là một câu chuyện độc nhất xứng đáng được kể bằng cách riêng. Mariée tạo ra nền tảng giúp các cặp đôi có một trang cưới đẹp, sang trọng và dễ chia sẻ — đồng thời kết nối họ với những vendor cưới uy tín nhất.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Thiết kế cao cấp", d: "Layout, typography, màu sắc được tinh chỉnh tỉ mỉ theo phong cách editorial." },
            { t: "Công nghệ hiện đại", d: "Tốc độ tải nhanh, tối ưu SEO, sẵn sàng cho mọi thiết bị." },
            { t: "Đồng hành tận tâm", d: "Hỗ trợ 24/7 từ đội ngũ chuyên gia trong ngành cưới." },
          ].map(b => <div key={b.t} className="border border-border/60 rounded-lg p-6 bg-card"><h3 className="font-display text-xl">{b.t}</h3><p className="text-sm text-muted-foreground mt-2">{b.d}</p></div>)}
        </div>
        <div className="bg-secondary/40 rounded-lg p-8 text-center">
          <h2 className="font-display text-3xl">Liên hệ</h2>
          <p className="mt-2 text-muted-foreground">Email: hello@mariee.vn — Hotline: 1900 0000</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/for-couples" className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-sm uppercase tracking-[0.2em]">Dành cho cặp đôi</Link>
            <Link to="/for-vendors" className="px-6 py-3 border border-input rounded-md text-sm uppercase tracking-[0.2em]">Dành cho vendor</Link>
          </div>
        </div>
      </section>
    </>
  );
}