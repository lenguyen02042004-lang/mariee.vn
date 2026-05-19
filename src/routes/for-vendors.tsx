import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/vendor-venue.jpg";

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
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
          <p className="font-script text-3xl md:text-5xl text-blush">for vendors</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl max-w-3xl">Đưa thương hiệu đến đúng cặp đôi</h1>
          <p className="mt-4 text-white/85 max-w-2xl">Tiếp cận hàng ngàn cặp đôi sắp cưới mỗi tháng. Tạo trang dịch vụ chuyên nghiệp trong 15 phút.</p>
          <div className="mt-8 flex gap-3 flex-wrap justify-center">
            <Link to="/register" className="px-8 py-4 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm shadow-elegant">Đăng ký vendor</Link>
            <Link to="/pricing" className="px-8 py-4 border border-white/60 rounded-md uppercase tracking-[0.2em] text-sm">Xem bảng giá</Link>
          </div>
        </div>
      </section>

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
    </>
  );
}