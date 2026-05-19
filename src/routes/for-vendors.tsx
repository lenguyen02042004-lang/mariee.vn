import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/for-vendors")({
  component: ForVendors,
  head: () => ({ meta: [
    { title: "Dành cho vendor — Mariée" },
    { name: "description", content: "Tiếp cận hàng ngàn cặp đôi sắp cưới. Đăng ký vendor trên Mariée." },
  ]}),
});

function ForVendors() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="font-script text-3xl text-primary text-center">for vendors</p>
      <h1 className="font-display text-5xl text-center mt-2">Đưa thương hiệu cưới đến đúng khách hàng</h1>
      <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Trang dịch vụ riêng, video YouTube, thư viện ảnh và liên hệ trực tiếp với cặp đôi.</p>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {[
          { t: "Trang dịch vụ riêng", d: "Logo, mô tả, video, ảnh — đầy đủ thương hiệu." },
          { t: "Featured badge", d: "Hiển thị nổi bật trên trang chủ và danh sách." },
          { t: "Thanh toán linh hoạt", d: "QR ngân hàng, gói tháng/năm tuỳ chọn." },
        ].map(b => <div key={b.t} className="border border-border/60 rounded-lg p-6 bg-card"><h3 className="font-display text-xl">{b.t}</h3><p className="text-sm text-muted-foreground mt-2">{b.d}</p></div>)}
      </div>
      <div className="text-center mt-12 flex gap-3 justify-center"><Link to="/register" className="px-8 py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm">Đăng ký vendor</Link><Link to="/pricing" className="px-8 py-3 border border-input rounded-md uppercase tracking-[0.2em] text-sm">Xem bảng giá</Link></div>
    </div>
  );
}