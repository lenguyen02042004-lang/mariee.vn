import { Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-script text-3xl text-primary leading-none">Mariée</span>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">Wedding</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-primary transition hidden md:inline">Trang chủ</Link>
          <Link to="/vendors" className="hover:text-primary transition">Nhà cung cấp</Link>
          <Link to="/for-couples" className="hover:text-primary transition hidden lg:inline">Cặp đôi</Link>
          <Link to="/for-vendors" className="hover:text-primary transition hidden lg:inline">Vendor</Link>
          <Link to="/pricing" className="hover:text-primary transition hidden md:inline">Bảng giá</Link>
          <Link to="/about" className="hover:text-primary transition hidden lg:inline">Giới thiệu</Link>
          {user ? (
            <>
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
  return (
    <footer className="mt-32 border-t border-border/60 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="font-script text-3xl text-primary">Mariée</div>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">Nền tảng landing page cưới sang trọng và đẳng cấp cho mọi cặp đôi Việt.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Khám phá</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Trang chủ</Link></li>
            <li><Link to="/vendors" className="hover:text-primary">Nhà cung cấp</Link></li>
            <li><Link to="/pricing" className="hover:text-primary">Bảng giá</Link></li>
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
          <p className="text-sm text-muted-foreground">hello@mariee.vn<br/>+84 901 234 567</p>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/40">© 2026 Mariée Wedding. All rights reserved.</div>
    </footer>
  );
}

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
