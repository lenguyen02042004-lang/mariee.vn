import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSiteSettings } from "@/lib/plans.functions";
import { adminUpdateSiteSettings } from "@/lib/admin-billing.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { HomeHero, type HeroSlide } from "@/components/HomeHero";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SiteSettings });

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}
function validateYoutube(url: string): { ok: boolean; message?: string } {
  const v = (url || "").trim();
  if (!v) return { ok: true };
  try {
    const u = new URL(v);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtu.be") {
      return { ok: false, message: "Link phải thuộc youtube.com hoặc youtu.be" };
    }
  } catch {
    return { ok: false, message: "Đường dẫn không hợp lệ (thiếu http/https)" };
  }
  if (!extractYoutubeId(v)) return { ok: false, message: "Không tìm thấy mã video YouTube (11 ký tự)" };
  return { ok: true };
}

function SiteSettings() {
  const get = useServerFn(getSiteSettings);
  const upd = useServerFn(adminUpdateSiteSettings);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["site-settings"], queryFn: () => get() });
  const [f, setF] = useState<any>({ site_name: "", logo_url: "", favicon_url: "", primary_color: "", accent_color: "", contact_email: "", contact_phone: "", footer_text: "", hero_youtube_url: "", hero_slides: [] });
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

  async function onUploadSlide(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadImage(file, user.id, "branding/hero");
      setF((p: any) => {
        const arr = [...(p.hero_slides ?? [])];
        arr[i] = { ...(arr[i] ?? {}), image_url: url };
        return { ...p, hero_slides: arr };
      });
      toast.success("Đã tải ảnh");
    } catch (err: any) { toast.error(err.message); }
  }

  const slides: any[] = Array.isArray(f.hero_slides) ? f.hero_slides : [];
  const updateSlide = (i: number, key: string, value: string) => {
    const arr = [...slides];
    arr[i] = { ...(arr[i] ?? {}), [key]: value };
    setF({ ...f, hero_slides: arr });
  };
  const addSlide = () => { if (slides.length >= 3) return; setF({ ...f, hero_slides: [...slides, { eyebrow: "", title: "", subtitle: "", cta_label: "", cta_href: "", image_url: "" }] }); };
  const removeSlide = (i: number) => setF({ ...f, hero_slides: slides.filter((_, idx) => idx !== i) });

  const ytCheck = validateYoutube(f.hero_youtube_url ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ytCheck.ok) {
      toast.error(`Link YouTube không hợp lệ: ${ytCheck.message}`);
      return;
    }
    m.mutate(f);
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Cài đặt ứng dụng</h1>
      <p className="text-sm text-muted-foreground mt-1">Tên, logo, màu thương hiệu và thông tin liên hệ chung của website.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 max-w-3xl">
        <section className="bg-card border border-border/60 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Hero trang chủ</h2>
            <button type="button" onClick={addSlide} disabled={slides.length >= 3} className="text-xs px-3 py-1.5 border border-input rounded hover:bg-secondary/60 disabled:opacity-50">+ Thêm slide ({slides.length}/3)</button>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Link YouTube (tuỳ chọn — nếu nhập sẽ thay thế slide ảnh)</label>
            <input
              value={f.hero_youtube_url ?? ""}
              onChange={e => setF({ ...f, hero_youtube_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`mt-1 w-full px-3 py-2 border bg-background rounded font-mono text-sm ${ytCheck.ok ? "border-input" : "border-destructive ring-1 ring-destructive/40"}`}
              aria-invalid={!ytCheck.ok}
            />
            {!ytCheck.ok && (
              <p className="mt-1 text-xs text-destructive">⚠ {ytCheck.message}. Ví dụ hợp lệ: https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
            )}
            {ytCheck.ok && f.hero_youtube_url && (
              <p className="mt-1 text-xs text-emerald-600">✓ Link hợp lệ — sẽ phát video làm nền hero.</p>
            )}
          </div>
          <div className="space-y-4">
            {slides.length === 0 && <p className="text-sm text-muted-foreground">Chưa có slide nào. Nhấn “+ Thêm slide” để tạo (tối đa 3).</p>}
            {slides.map((s, i) => (
              <div key={i} className="border border-border/60 rounded-lg p-4 space-y-3 bg-background/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Slide {i + 1}</span>
                  <button type="button" onClick={() => removeSlide(i)} className="text-xs text-destructive hover:underline">Xoá</button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Eyebrow (chữ script nhỏ)</label>
                    <input value={s.eyebrow ?? ""} onChange={e => updateSlide(i, "eyebrow", e.target.value)} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Tiêu đề chính</label>
                    <input value={s.title ?? ""} onChange={e => updateSlide(i, "title", e.target.value)} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Mô tả ngắn</label>
                  <textarea rows={2} value={s.subtitle ?? ""} onChange={e => updateSlide(i, "subtitle", e.target.value)} className="mt-1 w-full px-3 py-2 border border-input bg-background rounded text-sm" />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Nút CTA — Chữ</label>
                    <input value={s.cta_label ?? ""} onChange={e => updateSlide(i, "cta_label", e.target.value)} placeholder="Tạo trang cưới của bạn" className="mt-1 w-full px-3 py-2 border border-input bg-background rounded text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Nút CTA — Link</label>
                    <input value={s.cta_href ?? ""} onChange={e => updateSlide(i, "cta_href", e.target.value)} placeholder="/register" className="mt-1 w-full px-3 py-2 border border-input bg-background rounded text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ảnh nền</label>
                  <input type="file" accept="image/*" onChange={(e) => onUploadSlide(i, e)} className="block mt-1 text-sm" />
                  {s.image_url && <img src={s.image_url} alt="" className="mt-2 h-24 rounded border border-border/60 object-cover" />}
                  <input value={s.image_url ?? ""} onChange={e => updateSlide(i, "image_url", e.target.value)} placeholder="hoặc dán URL" className="mt-2 w-full px-2 py-1 text-xs border border-input bg-background rounded font-mono" />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Xem trước trực tiếp</p>
            <div className="rounded-lg overflow-hidden border border-border/60 [&_section]:!h-[360px] [&_section]:!min-h-0">
              <HomeHero
                slides={slides as HeroSlide[]}
                youtubeUrl={ytCheck.ok ? f.hero_youtube_url : null}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Bản xem trước cập nhật theo thời gian thực; bấm “Lưu cài đặt” để áp dụng cho trang chủ.</p>
          </div>
        </section>

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