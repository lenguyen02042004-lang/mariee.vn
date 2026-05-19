import { createFileRoute, Link } from "@tanstack/react-router";
import { listPlans } from "@/lib/plans.functions";

export const Route = createFileRoute("/pricing")({
  loader: () => listPlans(),
  component: Pricing,
  head: () => ({ meta: [
    { title: "Bảng giá vendor — Mariée" },
    { name: "description", content: "Lựa chọn gói thành viên phù hợp để đưa thương hiệu cưới của bạn đến hàng ngàn cặp đôi." },
  ]}),
});

function Pricing() {
  const plans = Route.useLoaderData();
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <p className="font-script text-3xl text-primary text-center">bảng giá</p>
      <h1 className="font-display text-5xl text-center mt-2">Gói thành viên Vendor</h1>
      <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">Chọn gói phù hợp với quy mô dịch vụ của bạn. Thanh toán bằng QR ngân hàng, admin duyệt trong 24h.</p>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {plans.map((p: any) => (
          <div key={p.id} className="border border-border/60 rounded-lg p-8 bg-card flex flex-col">
            <h3 className="font-display text-2xl">{p.name}</h3>
            <p className="text-muted-foreground text-sm mt-1">{p.description}</p>
            <p className="mt-6 text-4xl font-display">{p.price_vnd === 0 ? "Miễn phí" : `${p.price_vnd.toLocaleString("vi-VN")}đ`}<span className="text-sm text-muted-foreground"> /{p.billing_months} tháng</span></p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              {(p.features as string[]).map((f, i) => <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{f}</li>)}
            </ul>
            <Link to="/vendor/billing" className="mt-6 block text-center py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm hover:opacity-90">Đăng ký</Link>
          </div>
        ))}
      </div>
    </div>
  );
}