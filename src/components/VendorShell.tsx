import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  Store,
  Package,
  Star,
  Inbox,
  CreditCard,
  ExternalLink,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Store;
  exact?: boolean;
};

const groups: { label: string; items: NavItem[] }[] = [
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
    items: [{ to: "/vendor/leads", label: "Yêu cầu tư vấn", icon: Inbox }],
  },
  {
    label: "Tài khoản",
    items: [{ to: "/vendor/billing", label: "Gói thành viên", icon: CreditCard }],
  },
];

function findActive(pathname: string) {
  let match: NavItem | null = null;
  let group = "";
  for (const g of groups) {
    for (const it of g.items) {
      const active = it.exact
        ? pathname === it.to
        : pathname === it.to || pathname.startsWith(it.to + "/");
      if (active && (!match || it.to.length > match.to.length)) {
        match = it;
        group = g.label;
      }
    }
  }
  return { match, group };
}

export function VendorShell() {
  const loc = useLocation();
  const { user, signOut } = useAuth();
  const { match, group } = findActive(loc.pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border/60">
          <SidebarHeader className="px-4 pt-4 pb-2">
            <Link
              to="/vendor"
              className="flex items-center gap-2 no-hover group-data-[collapsible=icon]:justify-center"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-romance text-primary-foreground font-display text-lg shadow-soft">
                M
              </span>
              <span className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-script text-xl text-primary -mb-0.5">Mariée</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Vendor portal
                </span>
              </span>
            </Link>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent className="px-2">
            {groups.map((g) => (
              <SidebarGroup key={g.label}>
                <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">
                  {g.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {g.items.map((n) => {
                      const Icon = n.icon;
                      const active = n.exact
                        ? loc.pathname === n.to
                        : loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
                      return (
                        <SidebarMenuItem key={n.to}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={n.label}
                            className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-soft data-[active=true]:hover:bg-primary data-[active=true]:hover:text-primary-foreground"
                          >
                            <Link to={n.to}>
                              <Icon className="h-4 w-4 shrink-0" />
                              <span>{n.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">
                Liên kết nhanh
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Danh sách công khai">
                      <a href="/vendors" target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        <span>Danh sách công khai</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/60 px-3 py-3">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                {(user?.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-xs text-foreground/80">{user?.email}</p>
                <button
                  onClick={signOut}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                >
                  <LogOut className="h-3 w-3" /> Đăng xuất
                </button>
              </div>
            </div>
          </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-transparent">
        <header className="sticky top-0 z-20 grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-sm"
          >
            <span className="hidden text-muted-foreground lg:inline">Vendor portal</span>
            {match ? (
              <>
                <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/60 lg:inline-block" />
                <span className="hidden text-muted-foreground/80 xl:inline">{group}</span>
                <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/60 xl:inline-block" />
                <span className="truncate font-medium text-foreground">{match.label}</span>
              </>
            ) : (
              <span className="truncate font-medium text-foreground">Vendor portal</span>
            )}
          </nav>
          <a
            href="/vendors"
            target="_blank"
            rel="noreferrer"
            aria-label="Mở trang công khai"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground/80 hover:border-primary/40 hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Trang công khai</span>
          </a>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}