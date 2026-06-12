import { Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { BackToTop } from "@/components/BackToTop";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/plans.functions";

function useSite() {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });
  return (data ?? {}) as {
    site_name?: string | null;
    logo_url?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    footer_text?: string | null;
  };
}

export function Header() {
  const { user, signOut } = useAuth();
  const site = useSite();
  const brand = site.site_name?.trim() || "Mariée";
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {site.logo_url ? (
            <img src={site.logo_url} alt={brand} className="h-9 w-auto object-contain" />
          ) : (
            <span className="font-script text-3xl text-primary leading-none">{brand}</span>
          )}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-primary transition hidden md:inline">Trang chủ</Link>
          <Link to="/vendors" className="hover:text-primary transition">Nhà cung cấp</Link>
          <Link to="/blog" className="hover:text-primary transition hidden md:inline">Blog</Link>
          <Link to="/for-couples" className="hover:text-primary transition hidden lg:inline">Cặp đôi</Link>
          <Link to="/for-vendors" className="hover:text-primary transition hidden lg:inline">Vendor</Link>
          <Link to="/about" className="hover:text-primary transition hidden lg:inline">Giới thiệu</Link>
          {user ? (
            <>
              <Link to="/couple" className="hover:text-primary transition hidden md:inline">Trang của tôi</Link>
              <Link to="/admin" className="hover:text-primary transition">Quản trị</Link>
              <Link to="/vendor" className="hover:text-primary transition hidden md:inline">Trang vendor</Link>
              <button onClick={signOut} className="text-muted-foreground hover:text-primary transition">Đăng xuất</button>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs uppercase tracking-[0.2em]">Đăng nhập</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const site = useSite();
  const brand = site.site_name?.trim() || "Mariée";
  const year = new Date().getFullYear();
  const tagline = site.footer_text?.trim() || "Nền tảng landing page cưới sang trọng và đẳng cấp cho mọi cặp đôi Việt.";
  const email = site.contact_email?.trim();
  const phone = site.contact_phone?.trim();
  return (
    <footer className="mt-32 border-t border-border/60 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          {site.logo_url ? (
            <img src={site.logo_url} alt={brand} className="h-10 w-auto object-contain" />
          ) : (
            <div className="font-script text-3xl text-primary">{brand}</div>
          )}
          <p className="text-sm text-muted-foreground mt-3 max-w-xs whitespace-pre-line">{tagline}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Khám phá</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Trang chủ</Link></li>
            <li><Link to="/vendors" className="hover:text-primary">Nhà cung cấp</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/about" className="hover:text-primary">Giới thiệu</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Giải pháp</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/for-couples" className="hover:text-primary">Dành cho cặp đôi</Link></li>
            <li><Link to="/for-vendors" className="hover:text-primary">Dành cho vendor</Link></li>
            <li><Link to="/register" className="hover:text-primary">Đăng ký miễn phí</Link></li>
            <li><Link to="/login" className="hover:text-primary">Đăng nhập</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Liên hệ</h4>
          <p className="text-sm text-muted-foreground">
            {email ? <a href={`mailto:${email}`} className="hover:text-primary">{email}</a> : "—"}
            <br />
            {phone ? <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary">{phone}</a> : null}
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/40">© {year} {brand}. All rights reserved.</div>
    </footer>
  );
}

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <BackToTop />
    </div>
  );
}
