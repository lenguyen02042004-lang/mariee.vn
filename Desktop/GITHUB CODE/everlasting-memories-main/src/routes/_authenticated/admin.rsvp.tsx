import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListRsvp, adminDeleteRsvp } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/rsvp")({ component: RsvpList });

function RsvpList() {
  const qc = useQueryClient();
  const fn = useServerFn(adminListRsvp);
  const del = useServerFn(adminDeleteRsvp);
  const { data, isLoading } = useQuery({ queryKey: ["a-rsvp"], queryFn: () => fn() });
  const [coupleId, setCoupleId] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "yes" | "no">("all");

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá"); qc.invalidateQueries({ queryKey: ["a-rsvp"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const couples = useMemo(() => {
    const m = new Map<string, string>();
    (data ?? []).forEach((r: any) => {
      if (r.couple_id && r.couples) m.set(r.couple_id, `${r.couples.bride_name} & ${r.couples.groom_name}`);
    });
    return Array.from(m.entries());
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((r: any) => {
      if (coupleId !== "all" && r.couple_id !== coupleId) return false;
      if (status === "yes" && !r.attending) return false;
      if (status === "no" && r.attending) return false;
      return true;
    });
  }, [data, coupleId, status]);

  const exportCsv = () => {
    const rows = [
      ["Cặp đôi", "Khách", "Phone", "Email", "Tham dự", "Số lượng", "Phía", "Lời nhắn", "Thời gian"],
      ...filtered.map((r: any) => [
        `${r.couples?.bride_name ?? ""} & ${r.couples?.groom_name ?? ""}`,
        r.guest_name, r.guest_phone ?? "", r.guest_email ?? "",
        r.attending ? "Có" : "Không", r.num_guests, r.side ?? "",
        (r.message ?? "").replace(/\n/g, " "),
        new Date(r.created_at).toLocaleString("vi-VN"),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rsvp-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Xác nhận tham dự (RSVP)</h1>
        <button onClick={exportCsv} disabled={!filtered.length} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50">Xuất CSV</button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <select value={coupleId} onChange={e => setCoupleId(e.target.value)} className="px-3 py-2 rounded border border-input bg-background text-sm">
          <option value="all">Tất cả cặp đôi</option>
          {couples.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="px-3 py-2 rounded border border-input bg-background text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="yes">Tham dự</option>
          <option value="no">Vắng mặt</option>
        </select>
        <p className="text-sm text-muted-foreground self-center">{filtered.length} / {(data ?? []).length} bản ghi</p>
      </div>

      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr><th className="p-3">Cặp đôi</th><th className="p-3">Khách</th><th className="p-3">Liên hệ</th><th className="p-3">Tham dự</th><th className="p-3">SL</th><th className="p-3">Lời nhắn</th><th className="p-3">Thời gian</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id} className="border-t border-border/40">
                  <td className="p-3">{r.couples?.bride_name} & {r.couples?.groom_name}</td>
                  <td className="p-3 font-medium">{r.guest_name}</td>
                  <td className="p-3 text-xs">{r.guest_phone}<br />{r.guest_email}</td>
                  <td className="p-3">{r.attending ? "✓ Có" : "✗ Không"}</td>
                  <td className="p-3">{r.num_guests}</td>
                  <td className="p-3 max-w-xs text-xs text-muted-foreground">{r.message}</td>
                  <td className="p-3 text-xs">{new Date(r.created_at).toLocaleString("vi-VN")}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => { if (confirm("Xoá RSVP này?")) remove.mutate(r.id); }} className="text-destructive underline text-xs">Xoá</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Không có RSVP phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}