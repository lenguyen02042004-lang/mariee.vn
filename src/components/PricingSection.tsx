import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listPlans } from "@/lib/plans.functions";

type Props = {
  audience: "vendor" | "couple";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function PricingSection({
  audience,
  eyebrow = "bảng giá",
  title = "Gói thành viên",
  subtitle,
  ctaLabel = "Đăng ký ngay",
  ctaHref = "/register",
}: Props) {
  const fn = useServerFn(listPlans);
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans-pub", audience],
    queryFn: () => fn({ data: { audience } }),
  });

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <p className="font-script text-3xl text-primary">{eyebrow}</p>
        <h2 className="font-display text-4xl md:text-5xl mt-2">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
      {isLoading ? (
        <p className="text-center text-muted-foreground">Đang tải gói…</p>
      ) : plans.length === 0 ? (
        <p className="text-center text-muted-foreground">Chưa có gói nào — hãy quay lại sau.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p: any, i: number) => {
            const featured = i === Math.min(1, plans.length - 1);
            return (
              <div
                key={p.id}
                className={`rounded-lg p-8 border transition flex flex-col ${
                  featured
                    ? "border-primary bg-card shadow-elegant"
                    : "border-border/50 bg-card hover:shadow-soft"
                }`}
              >
                {featured && (
                  <span className="self-start text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-primary text-primary-foreground mb-3">
                    Phổ biến
                  </span>
                )}
                <h3 className="font-display text-2xl">{p.name}</h3>
                {p.description && (
                  <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
                )}
                <div className="mt-5">
                  <span className="font-display text-4xl text-primary">
                    {Number(p.price_vnd).toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-sm text-muted-foreground"> / {p.billing_months} tháng</span>
                </div>
                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul className="mt-5 space-y-2 text-sm text-foreground/80 flex-1">
                    {p.features.map((f: string, j: number) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-primary">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={ctaHref}
                  className={`mt-8 inline-flex justify-center px-6 py-3 rounded uppercase tracking-[0.2em] text-xs transition ${
                    featured
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-input hover:bg-secondary"
                  }`}
                >
                  {ctaLabel}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}