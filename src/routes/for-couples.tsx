import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-wedding-2.jpg";
import { PricingSection } from "@/components/PricingSection";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/for-couples")({
  component: ForCouples,
  head: () => ({ meta: [
    { title: "Dành cho cặp đôi — Mariée" },
    { name: "description", content: "Tạo landing page cưới sang trọng, nhận RSVP và lưu giữ kỷ niệm với Mariée." },
  ]}),
});

function ForCouples() {
  const features = [
    { t: "Hero 3 slide + Video YouTube", d: "Trình bày kỷ niệm theo phong cách điện ảnh, slide tự đổi với hiệu ứng mềm mại." },
    { t: "RSVP tự động & sổ lưu bút", d: "Khách xác nhận tham dự và gửi lời chúc — bạn xem tất cả trong một bảng quản lý." },
    { t: "Đếm ngược ngày cưới", d: "Countdown lung linh đến giờ G, tự ẩn khi đám cưới đã diễn ra." },
    { t: "Hộp mừng cưới", d: "Hiển thị STK cô dâu / chú rể đẹp mắt cho khách ở xa gửi quà." },
    { t: "Lịch trình chương trình", d: "Mỗi mốc thời gian trong ngày được trình bày như một dòng chảy điện ảnh." },
    { t: "Thư viện ảnh không giới hạn", d: "Tải lên ảnh cưới đẹp nhất, khách chiêm ngưỡng full-screen." },
    { t: "Liên kết riêng — chia sẻ dễ", d: "mariee.app/couples/ten-cua-ban — share Facebook, Zalo, in QR thiệp mời." },
    { t: "SEO chuẩn & og:image", d: "Khi share lên mạng xã hội, hiện ảnh cưới và tên hai bạn." },
  ];
  const steps = [
    { n: "1", t: "Tạo tài khoản miễn phí", d: "Email & mật khẩu hoặc Google trong 30 giây." },
    { n: "2", t: "Điền thông tin & tải ảnh", d: "Đội ngũ admin Mariée sẽ giúp bạn nếu cần." },
    { n: "3", t: "Xuất bản & chia sẻ", d: "Trang cưới của bạn sẵn sàng đón khách." },
  ];
  return (
    <>
      <PageHero
        image={hero}
        script="for couples"
        title="Trang cưới đẹp riêng cho hai bạn"
        subtitle="Khách mời truy cập, gửi lời chúc và RSVP chỉ với một liên kết — bạn lưu giữ kỷ niệm trọn vẹn."
      >
        <Link to="/register" className="mt-8 px-8 py-4 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm shadow-elegant">Tạo trang ngay</Link>
      </PageHero>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="font-script text-3xl text-primary">tính năng</p>
          <h2 className="font-display text-4xl md:text-5xl mt-2">Mọi thứ bạn cần cho ngày cưới</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.t} className="border border-border/50 rounded-lg p-6 bg-card hover:shadow-soft transition">
              <h3 className="font-display text-xl">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-script text-3xl text-primary">3 bước</p>
            <h2 className="font-display text-4xl mt-2">Sẵn sàng trong chiều nay</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.n} className="text-center">
                <div className="font-display text-6xl text-primary">{s.n}</div>
                <h3 className="font-display text-2xl mt-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-romance py-24 text-center text-white">
        <p className="font-script text-3xl text-white">ready?</p>
        <h2 className="font-display text-4xl md:text-5xl mt-2">Bắt đầu câu chuyện của bạn</h2>
        <p className="mt-3 text-white/85">Miễn phí cho cặp đôi. Không cần thẻ tín dụng.</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/register" className="px-8 py-4 bg-white text-primary rounded-md uppercase tracking-[0.2em] text-sm">Tạo trang miễn phí</Link>
          <Link to="/couples/$slug" params={{ slug: "minh-anh-quoc-bao" }} className="px-8 py-4 border border-white/60 rounded-md uppercase tracking-[0.2em] text-sm">Xem mẫu</Link>
        </div>
      </section>

      <PricingSection
        audience="couple"
        title="Gói cho cặp đôi"
        subtitle="Bản miễn phí đã đủ cho hầu hết đám cưới. Nâng cấp khi cần thêm tính năng cao cấp."
        ctaLabel="Tạo trang ngay"
      />
    </>
  );
}