import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/for-couples")({
  component: ForCouples,
  head: () => ({ meta: [
    { title: "Dành cho cặp đôi — Mariée" },
    { name: "description", content: "Tạo landing page cưới sang trọng, nhận RSVP và lưu giữ kỷ niệm với Mariée." },
  ]}),
});

function ForCouples() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="font-script text-3xl text-primary text-center">for couples</p>
      <h1 className="font-display text-5xl text-center mt-2">Trang cưới đẹp riêng cho hai bạn</h1>
      <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Khách mời truy cập, gửi lời chúc và RSVP chỉ với một liên kết.</p>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {[
          { t: "Hero 3 slide + Video", d: "Trình bày kỷ niệm của bạn theo phong cách điện ảnh." },
          { t: "RSVP miễn phí", d: "Khách xác nhận tham dự — bạn quản lý mọi lời mời." },
          { t: "Thư viện ảnh", d: "Tải lên không giới hạn ảnh cưới đẹp nhất." },
        ].map(b => <div key={b.t} className="border border-border/60 rounded-lg p-6 bg-card"><h3 className="font-display text-xl">{b.t}</h3><p className="text-sm text-muted-foreground mt-2">{b.d}</p></div>)}
      </div>
      <div className="text-center mt-12"><Link to="/register" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm">Tạo trang ngay</Link></div>
    </div>
  );
}