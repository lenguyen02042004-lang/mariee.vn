import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetVendor } from "@/lib/admin.functions";
import { VendorForm } from "@/components/VendorForm";

export const Route = createFileRoute("/_authenticated/admin/vendors/$id")({ component: EditVendor });

function EditVendor() {
  const { id } = Route.useParams();
  const fn = useServerFn(adminGetVendor);
  const { data, isLoading } = useQuery({ queryKey:["a-vendor-detail", id], queryFn:()=>fn({ data:{ id } }) });
  if (isLoading) return <p className="text-muted-foreground">Đang tải…</p>;
  if (!data) return <p>Không tìm thấy vendor.</p>;
  return (
    <div>
      <h1 className="font-display text-3xl">Sửa vendor: {data.name}</h1>
      <div className="mt-6"><VendorForm initial={data} /></div>
    </div>
  );
}
