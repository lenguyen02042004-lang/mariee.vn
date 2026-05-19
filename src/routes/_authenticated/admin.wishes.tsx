import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListWishes, adminSetWishApproval, adminDeleteWish } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/wishes")({ component: WishesAdmin });

function WishesAdmin() {
  const fn = useServerFn(adminListWishes);
  const approve = useServerFn(adminSetWishApproval);
  const del = useServerFn(adminDeleteWish);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-wishes"], queryFn: () => fn() });
  const mApprove = useMutation({ mutationFn: (v: any) => approve({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-wishes"] }) });
  const mDel = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-wishes"] }); toast.success("Đã xoá"); } });
  return (
    <div>
      <h1 className="font-display text-3xl">Lời chúc khách mời</h1>
      <p className="text-sm text-muted-foreground mt-1">Duyệt hoặc ẩn các lời chúc trước khi hiển thị công khai trên trang cặp đôi.</p>
      <div className="mt-6 space-y-3">
        {data.map((w: any) => (
          <div key={w.id} className="border border-border/60 rounded p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm"><b>{w.guest_name}</b> · {new Date(w.created_at).toLocaleString("vi-VN")}</p>
              {w.couples && <p className="text-xs text-muted-foreground">Gửi tới: <Link to="/couples/$slug" params={{ slug: w.couples.slug }} className="underline">{w.couples.bride_name} & {w.couples.groom_name}</Link></p>}
              <p className="mt-2 text-sm">{w.message}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs rounded h-fit ${w.is_approved?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}`}>{w.is_approved?"Đã duyệt":"Chờ duyệt"}</span>
              <button onClick={() => mApprove.mutate({ id: w.id, is_approved: !w.is_approved })} className="px-3 py-1 text-xs border border-input rounded">{w.is_approved?"Ẩn":"Duyệt"}</button>
              <button onClick={() => { if(confirm("Xoá lời chúc này?")) mDel.mutate(w.id); }} className="px-3 py-1 text-xs border border-destructive text-destructive rounded">Xoá</button>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-muted-foreground">Chưa có lời chúc nào.</p>}
      </div>
    </div>
  );
}