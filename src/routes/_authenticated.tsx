import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: Gate,
});

function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Đang tải…</div>;
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
}