import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSiteSettings } from "@/lib/plans.functions";
import { adminUpdateSiteSettings } from "@/lib/admin-billing.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SiteSettings });

function SiteSettings() {
  const get = useServerFn(getSiteSettings);
  const upd = useServerFn(adminUpdateSiteSettings);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["site-settings"], queryFn: () => get() });
  const [f, setF] = useState<any>({ site_name: "", logo_url: "", favicon_url: "", primary_color: "", accent_color: "", contact_email: "", contact_phone: "", footer_text: "" });
  useEffect(() => { if (data) setF((p: any) => ({ ...p, ...data })); }, [data]);

  const m = useMutation({
    mutationFn: (v: any) => upd({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-settings"] }); toast.success("Đã lưu cài đặt"); },
    onError: (e: any) => toast.error(e.message),
  });

  async function onUpload(field: "logo_url" | "favicon_url", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadImage(file, user.id, field === "logo_url" ? "branding/logo" : "branding/favicon");
      setF((p: any) => ({ ...p, [field]: url }));
      toast.success("Đã tải ảnh");
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Cài đặt ứng dụng</h1>
      <p className="text-sm text-muted-foreground mt-1">Tên, logo, màu thương hiệu và thông tin liên hệ chung của website.</p>

      <form onSubmit={(e) => { e.preventDefault(); m.mutate(f); }} className="mt-6 grid gap-6 max-w-3xl">
        <section className="bg-card border border-border/60 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-xl">Thương hiệu</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tên website</label>
            <input value={f.site_name ?? ""} onChange={e => setF({ ...f, site_name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Logo</label>
              <input type="file" accept="image/*" onChange={(e) => onUpload("logo_url", e)} className="block mt-1 text-sm" />
              {f.logo_url && <img src={f.logo_url} alt="logo" className="mt-2 h-16 bg-secondary/40 p-2 rounded border border-border/60 object-contain" />}
              <input value={f.logo_url ?? ""} onChange={e => setF({ ...f, logo_url: e.target.value })} placeholder="hoặc dán URL" className="mt-2 w-full px-2 py-1 text-xs border border-input bg-background rounded font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Favicon</label>
              <input type="file" accept="image/*" onChange={(e) => onUpload("favicon_url", e)} className="block mt-1 text-sm" />
              {f.favicon_url && <img src={f.favicon_url} alt="favicon" className="mt-2 h-10 w-10 bg-secondary/40 p-1 rounded border border-border/60 object-contain" />}
              <input value={f.favicon_url ?? ""} onChange={e => setF({ ...f, favicon_url: e.target.value })} placeholder="hoặc dán URL" className="mt-2 w-full px-2 py-1 text-xs border border-input bg-background rounded font-mono" />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border/60 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-xl">Màu sắc</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Màu chính (primary)</label>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={f.primary_color || "#b08968"} onChange={e => setF({ ...f, primary_color: e.target.value })} className="h-10 w-14 border border-input rounded cursor-pointer" />
                <input value={f.primary_color ?? ""} onChange={e => setF({ ...f, primary_color: e.target.value })} placeholder="#b08968 hoặc oklch(...)" className="flex-1 px-3 py-2 border border-input bg-background rounded font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Màu nhấn (accent)</label>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={f.accent_color || "#d4a373"} onChange={e => setF({ ...f, accent_color: e.target.value })} className="h-10 w-14 border border-input rounded cursor-pointer" />
                <input value={f.accent_color ?? ""} onChange={e => setF({ ...f, accent_color: e.target.value })} placeholder="#d4a373" className="flex-1 px-3 py-2 border border-input bg-background rounded font-mono text-sm" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Màu được lưu để hiển thị logo trên các trang công khai. Để đổi toàn bộ giao diện gốc cần cập nhật <code>src/styles.css</code>.</p>
        </section>

        <section className="bg-card border border-border/60 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-xl">Liên hệ & Chân trang</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email liên hệ</label>
              <input type="email" value={f.contact_email ?? ""} onChange={e => setF({ ...f, contact_email: e.target.value })} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Số điện thoại</label>
              <input value={f.contact_phone ?? ""} onChange={e => setF({ ...f, contact_phone: e.target.value })} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nội dung chân trang</label>
            <textarea value={f.footer_text ?? ""} onChange={e => setF({ ...f, footer_text: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
          </div>
        </section>

        <div className="flex justify-end">
          <button disabled={m.isPending} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-60">Lưu cài đặt</button>
        </div>
      </form>
    </div>
  );
}