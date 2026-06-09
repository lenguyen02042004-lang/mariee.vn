import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Store, Package, Star, Inbox, CreditCard, ExternalLink } from "lucide-react";

const groups = [
  {
    label: "Hồ sơ",
    items: [
      { to: "/vendor", label: "Tổng quan & Hồ sơ", icon: Store, exact: true },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { to: "/vendor/products", label: "Sản phẩm / Dịch vụ", icon: Package },
      { to: "/vendor/testimonials", label: "Đánh giá khách", icon: Star },
    ],
  },
  {
    label: "Khách hàng",
    items: [
      { to: "/vendor/leads", label: "Yêu cầu tư vấn", icon: Inbox },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      { to: "/vendor/billing", label: "Gói thành viên", icon: CreditCard },
    ],
  },
] as const;

export function VendorShell() {
  const loc = useLocation();
  const { user, signOut } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid md:grid-cols-[240px_1fr] gap-6 md:gap-10 min-h-[80vh]">
      <aside className="md:border-r md:border-border/60 md:pr-6">
        <div className="flex items-center gap-2">
          <span className="font-script text-2xl text-primary">vendor</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-secondary/60 rounded-full px-2 py-0.5">portal</span>
        </div>
        <nav className="mt-6 flex flex-col gap-5 text-sm">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">{g.label}</p>
              <div className="flex flex-col gap-0.5">
                {g.items.map((n) => {
                  const active = (n as any).exact
                    ? loc.pathname === n.to
                    : loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{n.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <p className="px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">Liên kết nhanh</p>
            <a
              href="/vendors"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-foreground/80 hover:bg-secondary hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span>Danh sách công khai</span>
            </a>
          </div>
        </nav>
        <div className="mt-8 pt-5 border-t border-border/60 text-xs text-muted-foreground">
          <p className="truncate">{user?.email}</p>
          <button onClick={signOut} className="mt-2 text-primary hover:underline cursor-pointer">Đăng xuất</button>
        </div>
      </aside>
      <main className="min-w-0"><Outlet /></main>
    </div>
  );
}