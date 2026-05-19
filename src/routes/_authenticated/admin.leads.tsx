import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  const [vendorSlug, setVendorSlug] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const vendorOptions = useMemo(() => {
    const map = new Map<string, string>();
    (data as any[]).forEach((l: any) => { if (l.vendors?.slug) map.set(l.vendors.slug, l.vendors.name); });
    return Array.from(map.entries());
  }, [data]);
  const filtered = (data as any[]).filter((l: any) => {
    if (vendorSlug !== "all" && l.vendors?.slug !== vendorSlug) return false;
    if (status !== "all" && l.status !== status) return false;
    return true;
  });
  const counts = (data as any[]).reduce((acc: Record<string, number>, l: any) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1; return acc;
  }, {});
  return (
    <div>
      <h1 className="font-display text-3xl">Yêu cầu tư vấn (Leads)</h1>
      <p className="text-sm text-muted-foreground mt-1">Toàn bộ yêu cầu khách hàng gửi qua form liên hệ vendor.</p>
      <div className="mt-4 flex flex-wrap gap-3 items-center text-sm">
        <select value={vendorSlug} onChange={e=>setVendorSlug(e.target.value)} className="px-3 py-2 border border-input rounded bg-background">
          <option value="all">Tất cả vendor ({data.length})</option>
          {vendorOptions.map(([slug,name]) => <option key={slug} value={slug}>{name}</option>)}
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 border border-input rounded bg-background">
          <option value="all">Mọi trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v} ({counts[k] ?? 0})</option>)}
        </select>
        <span className="text-xs text-muted-foreground">Hiện: {filtered.length}</span>
      </div>
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm border border-border/60">
          <thead className="bg-secondary/40 text-left">
            <tr><th className="p-2">Khách</th><th className="p-2">Liên hệ</th><th className="p-2">Vendor</th><th className="p-2">Ngày sự kiện</th><th className="p-2">Lời nhắn</th><th className="p-2">Trạng thái</th></tr>
          </thead>
          <tbody>
            {filtered.map((l: any) => (
              <tr key={l.id} className="border-t border-border/60 align-top">
                <td className="p-2"><b>{l.guest_name}</b><br/><span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("vi-VN")}</span></td>
                <td className="p-2 text-xs">{l.guest_phone}<br/>{l.guest_email}</td>
                <td className="p-2 text-xs">{l.vendors ? <Link to="/vendors/$slug" params={{ slug: l.vendors.slug }} className="underline">{l.vendors.name}</Link> : "—"}</td>
                <td className="p-2 text-xs">{l.event_date ? new Date(l.event_date).toLocaleDateString("vi-VN") : "—"}</td>
                <td className="p-2 text-xs max-w-xs">{l.message}</td>
                <td className="p-2"><select value={l.status} onChange={e => m.mutate({ id: l.id, status: e.target.value })} className="text-xs border border-input rounded px-2 py-1">{Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-4 text-muted-foreground text-center">Không có yêu cầu phù hợp.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}