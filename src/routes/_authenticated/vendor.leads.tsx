import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyLeads, updateLeadStatus } from "@/lib/vendor-owner.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/leads")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Yêu cầu tư vấn — Vendor" }] }),
});

const STATUSES = ["new","contacted","won","lost"] as const;
const LABEL: Record<string,string> = { new:"Mới", contacted:"Đã liên hệ", won:"Thành công", lost:"Đã đóng" };

function LeadsPage() {
  const qc = useQueryClient();
  const fetchLeads = useServerFn(listMyLeads);
  const update = useServerFn(updateLeadStatus);
  const { data, isLoading } = useQuery({ queryKey:["my-leads"], queryFn:()=>fetchLeads() });

  const m = useMutation({
    mutationFn: (v: { id: string; status: typeof STATUSES[number] }) => update({ data: v }),
    onSuccess: () => { toast.success("Đã cập nhật"); qc.invalidateQueries({ queryKey:["my-leads"] }); },
    onError: (e:any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-script text-3xl text-primary">leads</p>
          <h1 className="font-display text-4xl">Yêu cầu tư vấn</h1>
        </div>
        <Link to="/vendor" className="text-sm text-primary underline">← Về hồ sơ</Link>
      </div>
      {isLoading && <p className="text-muted-foreground">Đang tải…</p>}
      {data && data.length === 0 && <p className="text-muted-foreground">Chưa có yêu cầu nào.</p>}
      <div className="space-y-3">
        {data?.map((l:any) => (
          <div key={l.id} className="bg-card border border-border/40 rounded-lg p-5">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <p className="font-medium text-lg">{l.guest_name}</p>
                <p className="text-sm text-muted-foreground">{l.guest_phone} {l.guest_email && `• ${l.guest_email}`}</p>
                {l.event_date && <p className="text-sm">Ngày sự kiện: {new Date(l.event_date).toLocaleDateString("vi-VN")}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("vi-VN")}</p>
                <select value={l.status} onChange={e=>m.mutate({ id:l.id, status:e.target.value as any })}
                  className="mt-2 px-3 py-1 text-sm border border-input bg-background rounded">
                  {STATUSES.map(s => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
              </div>
            </div>
            {l.message && <p className="mt-3 text-sm whitespace-pre-line">{l.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
