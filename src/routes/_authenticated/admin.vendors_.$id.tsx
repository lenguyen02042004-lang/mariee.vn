import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetVendor } from "@/lib/admin.functions";
import { VendorForm } from "@/components/VendorForm";

export const Route = createFileRoute("/_authenticated/admin/vendors_/$id")({ component: EditVendor });

function EditVendor() {
  const { id } = Route.useParams();
  const fn = useServerFn(adminGetVendor);
  const { data, isLoading } = useQuery({ queryKey: ["a-vendor", id], queryFn: () => fn({ data: { id } }) });
  if (isLoading) return <p className="text-muted-foreground">Đang tải…</p>;
  if (!data?.vendor) return <p>Không tìm thấy vendor. <Link to="/admin/vendors" className="text-primary underline">← Danh sách</Link></p>;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Sửa: {data.vendor.name}</h1>
        <Link to="/admin/vendors" className="text-sm text-primary underline">← Danh sách</Link>
      </div>
      <div className="mt-6"><VendorForm initial={data.vendor} wizard /></div>
    </div>
  );
}