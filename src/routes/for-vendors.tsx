import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/vendor-venue.jpg";
import { PricingSection } from "@/components/PricingSection";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/for-vendors")({
  component: ForVendors,
  head: () => ({ meta: [
    { title: "Dành cho vendor — Mariée" },
    { name: "description", content: "Tiếp cận hàng ngàn cặp đôi sắp cưới. Đăng ký vendor trên Mariée." },
  ]}),
});

function ForVendors() {
  const features = [
    { t: "Trang dịch vụ riêng", d: "Logo, mô tả, video YouTube, thư viện ảnh — đầy đủ thương hiệu." },
    { t: "Featured trên trang chủ", d: "Hiển thị nổi bật trên homepage và đầu danh sách vendor." },
    { t: "Quản lý lead khách hàng", d: "Mỗi yêu cầu tư vấn từ cặp đôi vào thẳng dashboard của bạn." },
    { t: "Đánh giá khách hàng", d: "Bộ sưu tập testimonials chuyên nghiệp — bạn duyệt nội dung." },
    { t: "Bảng giá dịch vụ", d: "Liệt kê các gói dịch vụ kèm giá, ảnh minh hoạ." },
    { t: "Thanh toán linh hoạt", d: "Chuyển khoản ngân hàng + QR. Gói tháng/năm tuỳ chọn." },
  ];
  const steps = [
    { n: "1", t: "Đăng ký vendor", d: "Tạo tài khoản & điền thông tin doanh nghiệp." },
    { n: "2", t: "Chọn gói thành viên", d: "Cơ bản (miễn phí), Pro, hoặc Premium." },
    { n: "3", t: "Xuất bản & nhận lead", d: "Trang vendor lên sóng, cặp đôi liên hệ trực tiếp." },
  ];
  return (
    <>
      <PageHero
        image={hero}
        script="for vendors"
        title="Đưa thương hiệu đến đúng cặp đôi"
        subtitle="Tiếp cận hàng ngàn cặp đôi sắp cưới mỗi tháng. Tạo trang dịch vụ chuyên nghiệp trong 15 phút."
      >
        <div className="mt-8 flex gap-3 flex-wrap justify-center">
          <Link to="/register" className="px-8 py-4 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm shadow-elegant">Đăng ký vendor</Link>
          <a href="#pricing" className="px-8 py-4 border border-white/60 rounded-md uppercase tracking-[0.2em] text-sm">Xem bảng giá</a>
        </div>
      </PageHero>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="font-script text-3xl text-primary">tính năng</p>
          <h2 className="font-display text-4xl md:text-5xl mt-2">Công cụ vendor chuyên nghiệp</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-center mb-12"><p className="font-script text-3xl text-primary">quy trình</p><h2 className="font-display text-4xl mt-2">Chỉ với 3 bước</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.n} className="text-center">
                <div className="font-display text-6xl text-primary">{s.n}</div>
                <h3 className="font-display text-2xl mt-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/vendors/$slug" params={{ slug: "white-palace-venue" }} className="text-primary underline">Xem ví dụ trang vendor →</Link>
          </div>
        </div>
      </section>

      <PricingSection
        audience="vendor"
        title="Chọn gói phù hợp"
        subtitle="Nâng cấp khi bạn sẵn sàng — gói thanh toán qua chuyển khoản, admin duyệt thủ công trong 24h."
        ctaLabel="Đăng ký vendor"
      />
    </>
  );
}