import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyRole } from "@/lib/admin.functions";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const fetchRole = useServerFn(getMyRole);
  const { data, isLoading } = useQuery({ queryKey: ["my-role"], queryFn: () => fetchRole() });
  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Đang kiểm tra quyền…</div>;
  if (!data?.roles.includes("admin")) return <Navigate to="/vendor" />;
  return <AdminShell />;
}
