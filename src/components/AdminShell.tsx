import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Heart, Store, FileText, ClipboardList, MessageSquareHeart,
  Inbox, Package, Wallet, Users, Settings, AlertTriangle,
} from "lucide-react";

const groups = [
  {
    label: "Tổng quan",
    items: [{ to: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Nội dung",
    items: [
      { to: "/admin/couples", label: "Cặp đôi", icon: Heart },
      { to: "/admin/vendors", label: "Nhà cung cấp", icon: Store },
      { to: "/admin/categories", label: "Danh mục vendor", icon: Package },
      { to: "/admin/blog", label: "Blog & Danh mục", icon: FileText },
    ],
  },
  {
    label: "Tương tác",
    items: [
      { to: "/admin/rsvp", label: "RSVP", icon: ClipboardList },
      { to: "/admin/wishes", label: "Lời chúc", icon: MessageSquareHeart },
      { to: "/admin/leads", label: "Yêu cầu vendor", icon: Inbox },
    ],
  },
  {
    label: "Kinh doanh",
    items: [
      { to: "/admin/plans", label: "Gói & Thanh toán", icon: Package },
      { to: "/admin/payments", label: "Giao dịch", icon: Wallet },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { to: "/admin/users", label: "Người dùng", icon: Users },
      { to: "/admin/logs", label: "Nhật ký lỗi", icon: AlertTriangle },
      { to: "/admin/settings", label: "Cài đặt ứng dụng", icon: Settings },
    ],
  },
] as const;

export function AdminShell() {
  const loc = useLocation();
  const { user, signOut } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid md:grid-cols-[240px_1fr] gap-6 md:gap-10 min-h-[80vh]">
      <aside className="md:border-r md:border-border/60 md:pr-6">
        <div className="flex items-center gap-2">
          <span className="font-script text-2xl text-primary">admin</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-secondary/60 rounded-full px-2 py-0.5">panel</span>
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