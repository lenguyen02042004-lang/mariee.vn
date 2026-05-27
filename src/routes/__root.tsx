import { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { Header, Footer } from "@/components/SiteLayout";
import { BackToTop } from "@/components/BackToTop";
import { AuthProvider } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { assignSignupRole } from "@/lib/signup-role.functions";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-7xl text-primary">404</h1>
        <p className="mt-3 text-muted-foreground">Trang bạn tìm không tồn tại.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-md">Về trang chủ</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-2xl">Đã có lỗi xảy ra</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-md">Thử lại</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mariée — Trang lễ cưới sang trọng cho những cặp đôi" },
      { name: "description", content: "Mariée — Nền tảng cung cấp trang lễ cưới đẳng cấp cho từng cặp đôi và nhà cung cấp dịch vụ cưới hàng đầu Việt Nam." },
      { property: "og:title", content: "Mariée — Trang lễ cưới sang trọng cho những cặp đôi" },
      { name: "twitter:title", content: "Mariée — Trang lễ cưới sang trọng cho những cặp đôi" },
      { property: "og:description", content: "Mariée — Nền tảng cung cấp trang lễ cưới đẳng cấp cho từng cặp đôi và nhà cung cấp dịch vụ cưới hàng đầu Việt Nam." },
      { name: "twitter:description", content: "Mariée — Nền tảng cung cấp trang lễ cưới đẳng cấp cho từng cặp đôi và nhà cung cấp dịch vụ cưới hàng đầu Việt Nam." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/89e0542a-9cbe-482e-9a49-e6a0fdf4d1e7" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/89e0542a-9cbe-482e-9a49-e6a0fdf4d1e7" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthSync />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1"><Outlet /></main>
          <Footer />
        </div>
        <BackToTop />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      router.invalidate();
      qc.invalidateQueries();
      // Gán role + tạo bản nháp couple/vendor khi user đăng nhập lần đầu sau khi chọn vai trò ở /register
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
        try {
          const role = localStorage.getItem("mariee.pendingSignupRole");
          if (role === "couple" || role === "vendor") {
            const display = localStorage.getItem("mariee.pendingDisplayName") || undefined;
            assignSignupRole({ data: { role, display_name: display } })
              .then(() => {
                localStorage.removeItem("mariee.pendingSignupRole");
                localStorage.removeItem("mariee.pendingDisplayName");
                qc.invalidateQueries();
              })
              .catch(() => { /* user có thể đã tồn tại — bỏ qua */ });
          }
        } catch { /* localStorage không khả dụng */ }
      }
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}
