import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { adminListErrorLogs, adminDeleteErrorLog, adminClearErrorLogs } from "@/lib/admin-logs.functions";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin/logs")({ component: LogsAdmin });

function LogsAdmin() {
  const list = useServerFn(adminListErrorLogs);
  const del = useServerFn(adminDeleteErrorLog);
  const clr = useServerFn(adminClearErrorLogs);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-logs"], queryFn: () => list() });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá"); qc.invalidateQueries({ queryKey: ["admin-logs"] }); },
  });
  const clear = useMutation({
    mutationFn: () => clr(),
    onSuccess: () => { toast.success("Đã dọn log cũ (> 30 ngày)"); qc.invalidateQueries({ queryKey: ["admin-logs"] }); },
  });
  const [open, setOpen] = useState<string | null>(null);
  const rows = data as any[];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Nhật ký lỗi</h1>
          <p className="text-sm text-muted-foreground mt-1">500 lỗi server gần nhất. Lỗi cũ hơn 30 ngày có thể dọn để giữ DB gọn.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(`error-logs-${new Date().toISOString().slice(0,10)}`, rows.map((l: any) => ({
              id: l.id, created_at: l.created_at, source: l.source, message: l.message,
              user_id: l.user_id, context: l.context,
            })))}
            disabled={rows.length === 0}
            className="px-3 py-1.5 text-xs border border-input rounded hover:bg-secondary disabled:opacity-50"
          >Xuất CSV</button>
          <button
            type="button"
            onClick={() => { if (confirm("Xoá log cũ hơn 30 ngày?")) clear.mutate(); }}
            className="px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/5"
          >Dọn log cũ</button>
        </div>
      </div>

      {isLoading ? <p className="mt-6 text-muted-foreground">Đang tải…</p> : (
        <div className="mt-6 border border-border/60 rounded-lg overflow-hidden bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="p-3">Thời gian</th>
                <th className="p-3">Nguồn</th>
                <th className="p-3">Lỗi</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l: any) => (
                <Fragment key={l.id}>
                  <tr className="border-t border-border/40 align-top">
                    <td className="p-3 text-xs whitespace-nowrap text-muted-foreground">{new Date(l.created_at).toLocaleString("vi-VN")}</td>
                    <td className="p-3 text-xs font-mono">{l.source}</td>
                    <td className="p-3">
                      <div className="text-sm">{l.message}</div>
                      <button
                        type="button"
                        onClick={() => setOpen(open === l.id ? null : l.id)}
                        className="mt-1 text-xs text-primary underline"
                      >{open === l.id ? "Ẩn chi tiết" : "Xem chi tiết"}</button>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => { if (confirm("Xoá log này?")) remove.mutate(l.id); }} className="text-destructive underline text-xs">Xoá</button>
                    </td>
                  </tr>
                  {open === l.id && (
                    <tr className="border-t border-border/40 bg-background/40">
                      <td colSpan={4} className="p-3 text-xs">
                        {l.context && Object.keys(l.context).length > 0 && (
                          <details open className="mb-2">
                            <summary className="cursor-pointer text-muted-foreground">Context</summary>
                            <pre className="mt-1 p-2 bg-secondary/50 rounded overflow-x-auto">{JSON.stringify(l.context, null, 2)}</pre>
                          </details>
                        )}
                        {l.stack && (
                          <details>
                            <summary className="cursor-pointer text-muted-foreground">Stack trace</summary>
                            <pre className="mt-1 p-2 bg-secondary/50 rounded overflow-x-auto whitespace-pre-wrap">{l.stack}</pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Chưa có lỗi nào — tuyệt vời!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}