import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetCouple } from "@/lib/admin.functions";
import { CoupleForm } from "@/components/CoupleForm";

export const Route = createFileRoute("/_authenticated/admin/couples_/$id")({ component: EditCouple });

function EditCouple() {
  const { id } = Route.useParams();
  const fn = useServerFn(adminGetCouple);
  const { data, isLoading } = useQuery({ queryKey:["a-couple-detail", id], queryFn:()=>fn({data:{id}}) });
  if (isLoading) return <p className="text-muted-foreground">Đang tải…</p>;
  if (!data?.couple) return <p>Không tìm thấy.</p>;
  return (
    <div>
      <h1 className="font-display text-3xl">Sửa: {data.couple.bride_name} & {data.couple.groom_name}</h1>
      <div className="mt-6"><CoupleForm initial={data.couple} gallery={data.gallery} wizard /></div>
    </div>
  );
}
