import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myCouples, listMyRsvp, deleteMyRsvp } from "@/lib/couple-owner.functions";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/couple/rsvp")({
  component: RsvpInbox,
  head: () => ({ meta: [{ title: "Hộp thư xác nhận — Mariée" }] }),
});

function RsvpInbox() {
  const qc = useQueryClient();
  const list = useServerFn(myCouples);
  const fetchRsvp = useServerFn(listMyRsvp);
  const del = useServerFn(deleteMyRsvp);
  const { data: mine } = useQuery({ queryKey: ["my-couples"], queryFn: () => list() });
  const coupleId = mine?.[0]?.id;
  const coupleName = mine?.[0] ? `${mine[0].bride_name} & ${mine[0].groom_name}` : "";

  const { data: rows, isLoading } = useQuery({
    queryKey: ["my-rsvp", coupleId],
    enabled: !!coupleId,
    queryFn: () => fetchRsvp({ data: { couple_id: coupleId! } }),
  });

  const [status, setStatus] = useState<"all" | "yes" | "no">("all");
  const [side, setSide] = useState<"all" | "bride" | "groom" | "both">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return (rows ?? []).filter((r: any) => {
      if (status === "yes" && !r.attending) return false;
      if (status === "no" && r.attending) return false;
      if (side !== "all" && (r.side ?? "both") !== side) return false;
      if (q) {
        const t = q.toLowerCase();
        const hay = `${r.guest_name} ${r.guest_phone ?? ""} ${r.guest_email ?? ""} ${r.message ?? ""}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [rows, status, side, q]);

  const stats = useMemo(() => {
    const all = rows ?? [];
    const yes = all.filter((r: any) => r.attending);
    const no = all.filter((r: any) => !r.attending);
    const guestsYes = yes.reduce((s: number, r: any) => s + (r.num_guests || 0), 0);
    return { total: all.length, yes: yes.length, no: no.length, guestsYes };
  }, [rows]);

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá"); qc.invalidateQueries({ queryKey: ["my-rsvp", coupleId] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const sideLabel = (s: string | null) => s === "bride" ? "Khách cô dâu" : s === "groom" ? "Khách chú rể" : "Khách chung";

  const exportExcel = () => {
    const data = filtered.map((r: any, i: number) => ({
      "STT": i + 1,
      "Họ và tên": r.guest_name,
      "Số điện thoại": r.guest_phone ?? "",
      "Email": r.guest_email ?? "",
      "Tham dự": r.attending ? "Có" : "Không",
      "Số lượng khách": r.num_guests,
      "Phía": sideLabel(r.side),
      "Lời nhắn": r.message ?? "",
      "Thời gian gửi": new Date(r.created_at).toLocaleString("vi-VN"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 5 }, { wch: 24 }, { wch: 14 }, { wch: 26 },
      { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 40 }, { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RSVP");
    const safe = (coupleName || "rsvp").replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase();
    XLSX.writeFile(wb, `rsvp-${safe}-${Date.now()}.xlsx`);
  };

  if (!coupleId) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground">Bạn chưa có trang cưới. <Link to="/couple" className="text-primary underline">Tạo trang cưới</Link></p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-script text-2xl text-primary">guest inbox</p>
          <h1 className="font-display text-3xl md:text-4xl">Hộp thư xác nhận tham dự</h1>
          <p className="text-sm text-muted-foreground mt-1">{coupleName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/couple" className="px-3 py-2 rounded bg-secondary/60 hover:bg-secondary text-sm">← Quay lại</Link>
          <button onClick={exportExcel} disabled={!filtered.length} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50">Tải Excel</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Tổng lời phản hồi", value: stats.total },
          { label: "Sẽ tham dự", value: stats.yes },
          { label: "Vắng mặt", value: stats.no },
          { label: "Tổng khách dự kiến", value: stats.guestsYes },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border/60 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="font-display text-2xl mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm theo tên, sđt, email…" className="px-3 py-2 rounded border border-input bg-background text-sm flex-1 min-w-[200px]" />
        <select value={status} onChange={e=>setStatus(e.target.value as any)} className="px-3 py-2 rounded border border-input bg-background text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="yes">Tham dự</option>
          <option value="no">Vắng mặt</option>
        </select>
        <select value={side} onChange={e=>setSide(e.target.value as any)} className="px-3 py-2 rounded border border-input bg-background text-sm">
          <option value="all">Tất cả phía</option>
          <option value="bride">Khách cô dâu</option>
          <option value="groom">Khách chú rể</option>
          <option value="both">Khách chung</option>
        </select>
      </div>

      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Họ tên</th>
                  <th className="p-3">Liên hệ</th>
                  <th className="p-3">Tham dự</th>
                  <th className="p-3">SL</th>
                  <th className="p-3">Phía</th>
                  <th className="p-3">Lời nhắn</th>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any, i: number) => (
                  <tr key={r.id} className="border-t border-border/40 align-top">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium">{r.guest_name}</td>
                    <td className="p-3 text-xs">{r.guest_phone}<br/>{r.guest_email}</td>
                    <td className="p-3">{r.attending ? <span className="text-emerald-600">✓ Có</span> : <span className="text-destructive">✗ Không</span>}</td>
                    <td className="p-3">{r.num_guests}</td>
                    <td className="p-3 text-xs">{sideLabel(r.side)}</td>
                    <td className="p-3 max-w-xs text-xs text-muted-foreground whitespace-pre-wrap">{r.message}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString("vi-VN")}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => { if (confirm("Xoá phản hồi này?")) remove.mutate(r.id); }} className="text-destructive underline text-xs">Xoá</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Chưa có phản hồi phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}