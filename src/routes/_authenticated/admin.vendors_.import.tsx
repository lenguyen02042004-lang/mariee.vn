import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminBulkImportVendors } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/vendors_/import")({
  component: BulkImportPage,
});

const SAMPLE = `[
  {
    "name": "ABC Wedding Studio",
    "slug": "abc-wedding-studio",
    "category": "photography",
    "tagline": "Chụp ảnh cưới phong cách điện ảnh",
    "phone": "0901234567",
    "email": "hello@abc.vn",
    "city": "Hồ Chí Minh",
    "gallery": ["https://.../1.jpg", "https://.../2.jpg"],
    "products": [
      { "title": "Gói Pre-wedding Đà Lạt 2N1Đ", "price_text": "Từ 18.000.000đ" }
    ]
  },
  {
    "name": "Hoa Cưới Mộc",
    "category": "flowers"
  }
]`;

function BulkImportPage() {
  const qc = useQueryClient();
  const importFn = useServerFn(adminBulkImportVendors);
  const [text, setText] = useState("");
  const [autoApprove, setAutoApprove] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      let parsed: any;
      try { parsed = JSON.parse(text); }
      catch (e: any) { throw new Error("JSON không hợp lệ: " + e.message); }
      const items = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.vendors) ? parsed.vendors : null);
      if (!items) throw new Error("Dữ liệu phải là mảng JSON các vendor, hoặc { vendors: [...] }");
      return importFn({ data: { items, auto_approve: autoApprove } });
    },
    onSuccess: (res: any) => {
      setResults(res.results);
      setSummary(res.summary);
      qc.invalidateQueries({ queryKey: ["a-vendors"] });
      const s = res.summary;
      toast.success(`Đã xử lý ${s.total}: ${s.inserted} thêm mới, ${s.updated} cập nhật, ${s.errors} lỗi`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Nhập vendor hàng loạt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dán mảng JSON các nhà cung cấp. Chỉ cần <b>name</b> là bắt buộc — các trường thiếu sẽ để trống để vendor bổ sung sau.
            Trùng <b>slug</b> sẽ được <b>cập nhật</b>; không có slug sẽ tự tạo từ tên.
          </p>
        </div>
        <Link to="/admin/vendors" className="text-sm text-primary underline">← Về danh sách</Link>
      </div>

      <div className="mt-6 grid gap-4">
        <details className="rounded-md border border-border/60 bg-card p-3 text-sm">
          <summary className="cursor-pointer font-medium">Xem schema & ví dụ</summary>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <p><b>Trường vendor:</b> name (bắt buộc), slug, category, tagline, description, cover_image, logo_url, phone, email, address, city, website, price_range, youtube_url, gallery (mảng URL), products (mảng).</p>
            <p><b>Category hợp lệ:</b> venue, photography, videography, wedding_planner, makeup, attire, flowers, catering, music, decor, invitation, other. Sai/thiếu sẽ mặc định "other".</p>
            <p><b>Trường product:</b> title (bắt buộc), description, price_text, image_url, sort_order, is_active.</p>
          </div>
          <pre className="mt-3 p-3 bg-secondary/40 rounded text-xs overflow-x-auto">{SAMPLE}</pre>
          <button
            type="button"
            onClick={() => setText(SAMPLE)}
            className="mt-2 px-3 py-1.5 text-xs border border-input rounded hover:bg-secondary"
          >Dùng mẫu này</button>
        </details>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dán JSON tại đây…"
          rows={18}
          className="w-full font-mono text-xs px-3 py-2 rounded-md border border-input bg-background"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />
            Tự động duyệt ngay (is_approved = true)
          </label>
          <button
            onClick={() => mutation.mutate()}
            disabled={!text.trim() || mutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "Đang nhập…" : "Nhập dữ liệu"}
          </button>
        </div>

        {summary && (
          <div className="rounded-md border border-border/60 bg-card p-4 text-sm">
            <div className="font-medium">Kết quả: {summary.total} bản ghi</div>
            <div className="text-xs text-muted-foreground mt-1">
              ✅ {summary.inserted} thêm mới · ✏️ {summary.updated} cập nhật · ❌ {summary.errors} lỗi
            </div>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="border border-border/60 rounded-lg overflow-hidden bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Tên</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Kết quả</th>
                  <th className="p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r: any) => (
                  <tr key={r.row} className="border-t border-border/40">
                    <td className="p-3 text-muted-foreground">{r.row}</td>
                    <td className="p-3">{r.name || <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 font-mono text-xs">{r.slug || "—"}</td>
                    <td className="p-3">
                      {r.action === "inserted" && <span className="text-emerald-600">Thêm mới</span>}
                      {r.action === "updated" && <span className="text-blue-600">Cập nhật</span>}
                      {r.action === "error" && <span className="text-destructive">Lỗi</span>}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {r.error ? r.error : (r.id ? <Link to="/admin/vendors/$id" params={{ id: r.id }} className="text-primary underline">Sửa</Link> : null)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}