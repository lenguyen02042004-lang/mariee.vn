import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { to: "/admin", label: "Tổng quan" },
  { to: "/admin/couples", label: "Cặp đôi" },
  { to: "/admin/vendors", label: "Nhà cung cấp" },
  { to: "/admin/rsvp", label: "RSVP" },
] as const;

export function AdminShell() {
  const loc = useLocation();
  const { user, signOut } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-[220px_1fr] gap-8 min-h-[80vh]">
      <aside className="border-r border-border/60 pr-6">
        <p className="font-script text-2xl text-primary">admin</p>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          {nav.map(n => {
            const active = loc.pathname === n.to || (n.to !== "/admin" && loc.pathname.startsWith(n.to));
            return <Link key={n.to} to={n.to} className={`px-3 py-2 rounded ${active?"bg-primary text-primary-foreground":"hover:bg-secondary"}`}>{n.label}</Link>;
          })}
        </nav>
        <div className="mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground">
          <p className="truncate">{user?.email}</p>
          <button onClick={signOut} className="mt-2 text-primary underline">Đăng xuất</button>
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}