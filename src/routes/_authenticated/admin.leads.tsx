import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListLeads, adminUpdateLeadStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/leads")({ component: LeadsAdmin });

const STATUS_LABEL: Record<string, string> = { new: "Mới", contacted: "Đã liên hệ", won: "Thành công", lost: "Không thành" };

function LeadsAdmin() {
  const fn = useServerFn(adminListLeads);
  const upd = useServerFn(adminUpdateLeadStatus);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-leads"], queryFn: () => fn() });
  const m = useMutation({ mutationFn: (v: any) => upd({ data: v }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leads"] }) });
  return (
    <div>
      <h1 className="font-display text-3xl">Yêu cầu tư vấn (Leads)</h1>
      <p className="text-sm text-muted-foreground mt-1">Toàn bộ yêu cầu khách hàng gửi qua form liên hệ vendor.</p>
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm border border-border/60">
          <thead className="bg-secondary/40 text-left">
            <tr><th className="p-2">Khách</th><th className="p-2">Liên hệ</th><th className="p-2">Vendor</th><th className="p-2">Ngày sự kiện</th><th className="p-2">Lời nhắn</th><th className="p-2">Trạng thái</th></tr>
          </thead>
          <tbody>
            {data.map((l: any) => (
              <tr key={l.id} className="border-t border-border/60 align-top">
                <td className="p-2"><b>{l.guest_name}</b><br/><span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("vi-VN")}</span></td>
                <td className="p-2 text-xs">{l.guest_phone}<br/>{l.guest_email}</td>
                <td className="p-2 text-xs">{l.vendors ? <Link to="/vendors/$slug" params={{ slug: l.vendors.slug }} className="underline">{l.vendors.name}</Link> : "—"}</td>
                <td className="p-2 text-xs">{l.event_date ? new Date(l.event_date).toLocaleDateString("vi-VN") : "—"}</td>
                <td className="p-2 text-xs max-w-xs">{l.message}</td>
                <td className="p-2"><select value={l.status} onChange={e => m.mutate({ id: l.id, status: e.target.value })} className="text-xs border border-input rounded px-2 py-1">{Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="p-4 text-muted-foreground text-center">Chưa có yêu cầu nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}