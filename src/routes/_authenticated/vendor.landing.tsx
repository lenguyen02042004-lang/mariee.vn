import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getMyVendor, upsertMyVendor, publishMyVendor,
  listMyProducts, upsertMyProduct, deleteMyProduct,
} from "@/lib/vendor-owner.functions";
import { ImagePicker, ImageUploadButton } from "@/components/ImagePicker";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Trash2, Plus, Eye, RefreshCw, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor/landing")({
  component: LandingEditor,
  head: () => ({ meta: [{ title: "Trang giới thiệu — Vendor" }] }),
});

function LandingEditor() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchMine = useServerFn(getMyVendor);
  const save = useServerFn(upsertMyVendor);
  const publish = useServerFn(publishMyVendor);
  const fetchProducts = useServerFn(listMyProducts);
  const upProd = useServerFn(upsertMyProduct);
  const delProd = useServerFn(deleteMyProduct);

  const { data, isLoading } = useQuery({ queryKey: ["my-vendor"], queryFn: () => fetchMine() });
  const { data: products } = useQuery({ queryKey: ["my-products"], queryFn: () => fetchProducts(), enabled: !!data });

  const [form, setForm] = useState<any>({ gallery: [] });
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [tab, setTab] = useState<"hero" | "gallery" | "services">("hero");

  useEffect(() => { if (data) setForm({ ...data, gallery: (data as any).gallery ?? [] }); }, [data]);

  const payload = useMemo(() => ({
    name: form.name, slug: form.slug, category: form.category ?? "other",
    tagline: form.tagline, description: form.description,
    cover_image: form.cover_image, logo_url: form.logo_url,
    phone: form.phone, email: form.email, address: form.address,
    city: form.city, website: form.website, price_range: form.price_range,
    youtube_url: form.youtube_url,
    gallery: form.gallery ?? [],
  }), [form]);

  const m = useMutation({
    mutationFn: () => save({ data: payload }),
    onSuccess: () => { toast.success("Đã lưu bản nháp."); qc.invalidateQueries({ queryKey: ["my-vendor"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const pub = useMutation({
    mutationFn: async () => { await save({ data: payload }); return publish(); },
    onSuccess: () => { toast.success("Đã xuất bản trang."); qc.invalidateQueries({ queryKey: ["my-vendor"] }); setPreviewKey((k) => k + 1); },
    onError: (e: any) => toast.error(e.message),
  });

  const moveGallery = (i: number, dir: -1 | 1) => {
    const g = [...(form.gallery ?? [])];
    const j = i + dir;
    if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]];
    setForm({ ...form, gallery: g });
  };
  const removeGallery = (i: number) => setForm({ ...form, gallery: form.gallery.filter((_: any, j: number) => j !== i) });
  const setCoverFromGallery = (url: string) => { setForm({ ...form, cover_image: url }); toast.success("Đã chọn làm ảnh bìa"); };

  const onAddGallery = async (file: File) => {
    if (!user) return;
    setUploading("gallery");
    try {
      const url = await uploadImage(file, user.id, "vendor-gallery");
      setForm((f: any) => ({ ...f, gallery: [...(f.gallery ?? []), url] }));
      toast.success("Đã thêm ảnh");
    } catch (e: any) { toast.error(e.message || "Tải ảnh thất bại"); throw e; }
    finally { setUploading(null); }
  };

  if (isLoading) return <p className="text-center py-20 text-muted-foreground">Đang tải…</p>;
  if (!data) return (
    <div className="p-8 rounded-lg border border-dashed text-center">
      <p className="text-muted-foreground">Bạn chưa có hồ sơ nhà cung cấp. <Link to="/vendor" className="text-primary underline">Tạo hồ sơ</Link>.</p>
    </div>
  );

  const slug = (data as any).slug as string | undefined;
  const approved = (data as any).is_approved;
  const published = (data as any).published_at;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <p className="font-script text-2xl text-primary leading-none">landing editor</p>
          <h1 className="font-display text-3xl mt-1">Trang giới thiệu</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chỉnh sửa nội dung, hình ảnh và dịch vụ; xem trước và xuất bản trang công khai.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => m.mutate()} disabled={m.isPending}
            className="px-3 py-2 rounded border border-border text-sm hover:border-primary/60 disabled:opacity-50">
            {m.isPending ? "Đang lưu…" : "Lưu nháp"}
          </button>
          <button type="button" onClick={() => pub.mutate()} disabled={pub.isPending || !approved}
            title={!approved ? "Chờ admin duyệt trước khi xuất bản" : ""}
            className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50">
            {pub.isPending ? "Đang xuất bản…" : "Lưu & Xuất bản"}
          </button>
          {slug && (
            <a href={`/vendors/${slug}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded border border-primary text-primary text-sm hover:bg-primary hover:text-primary-foreground">
              <ExternalLink className="h-3.5 w-3.5" /> Mở trang công khai
            </a>
          )}
        </div>
      </header>

      <div className="p-3 bg-secondary/50 rounded-md text-sm flex flex-wrap items-center gap-3">
        {!approved ? <span>⏳ Chờ admin duyệt — bạn vẫn có thể chỉnh sửa và lưu nháp.</span>
          : published ? <span>✓ Đã xuất bản {new Date(published).toLocaleString("vi-VN")}</span>
          : <span>✓ Đã duyệt — nhấn "Lưu & Xuất bản" để hiển thị công khai.</span>}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] gap-6">
        {/* Editor pane */}
        <div className="space-y-4">
          <div className="flex gap-1 border-b border-border/60">
            {[
              ["hero", "Hero & Thông tin"],
              ["gallery", `Thư viện (${(form.gallery ?? []).length})`],
              ["services", `Dịch vụ (${products?.length ?? 0})`],
            ].map(([k, label]) => (
              <button key={k} type="button" onClick={() => setTab(k as any)}
                className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${tab === k ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === "hero" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <ImagePicker label="Ảnh bìa (hero)" value={form.cover_image ?? ""} onChange={(url) => setForm({ ...form, cover_image: url })} folder="vendor" />
                <ImagePicker label="Logo" value={form.logo_url ?? ""} onChange={(url) => setForm({ ...form, logo_url: url })} folder="vendor" aspect="aspect-square" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Tên thương hiệu" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Slug (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
                <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} full />
                <label className="text-sm sm:col-span-2">
                  <span className="text-muted-foreground">Mô tả</span>
                  <textarea rows={6} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
                </label>
                <Field label="Khoảng giá" value={form.price_range} onChange={(v) => setForm({ ...form, price_range: v })} />
                <Field label="Thành phố" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="Điện thoại" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} full />
                <Field label="YouTube embed" value={form.youtube_url} onChange={(v) => setForm({ ...form, youtube_url: v })} full />
              </div>
            </div>
          )}

          {tab === "gallery" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Ảnh đầu tiên hiển thị nổi bật. Nhấn "Đặt bìa" để dùng làm ảnh hero.</p>
                <ImageUploadButton disabled={uploading === "gallery"} buttonLabel="+ Thêm ảnh" helper="" onUpload={onAddGallery} />
              </div>
              {(form.gallery ?? []).length === 0 ? (
                <div className="p-10 border-2 border-dashed border-border rounded-lg text-center text-sm text-muted-foreground">
                  Chưa có ảnh trong thư viện.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(form.gallery as string[]).map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-md overflow-hidden border border-border/60 bg-muted">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 p-2">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveGallery(i, -1)} disabled={i === 0}
                            className="p-1.5 bg-background/90 rounded disabled:opacity-30" title="Lên"><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => moveGallery(i, 1)} disabled={i === form.gallery.length - 1}
                            className="p-1.5 bg-background/90 rounded disabled:opacity-30" title="Xuống"><ArrowDown className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => removeGallery(i)}
                            className="p-1.5 bg-destructive text-destructive-foreground rounded" title="Xoá"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        <button type="button" onClick={() => setCoverFromGallery(url)}
                          className="text-[11px] px-2 py-1 bg-primary text-primary-foreground rounded">Đặt bìa</button>
                      </div>
                      {form.cover_image === url && (
                        <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">Bìa</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "services" && (
            <ServicesInline
              products={(products as any[]) ?? []}
              onSave={async (p) => { await upProd({ data: p }); qc.invalidateQueries({ queryKey: ["my-products"] }); }}
              onDelete={async (id) => { await delProd({ data: { id } }); qc.invalidateQueries({ queryKey: ["my-products"] }); }}
              userId={user?.id}
            />
          )}
        </div>

        {/* Preview pane */}
        <aside className="lg:sticky lg:top-20 lg:self-start space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Xem trước trang công khai</p>
            <button type="button" onClick={() => setPreviewKey((k) => k + 1)}
              className="text-xs inline-flex items-center gap-1 text-primary hover:underline"><RefreshCw className="h-3 w-3" /> Làm mới</button>
          </div>
          {slug ? (
            <div className="border border-border rounded-md overflow-hidden bg-card">
              <iframe key={previewKey} src={`/vendors/${slug}`} title="Xem trước" className="w-full h-[720px]" />
            </div>
          ) : (
            <div className="p-6 border border-dashed rounded-md text-sm text-muted-foreground">Điền slug để xem trước.</div>
          )}
          <p className="text-[11px] text-muted-foreground">Trang xem trước hiển thị nội dung đã <b>xuất bản</b>. Bấm "Lưu & Xuất bản" để cập nhật.</p>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, full }: { label: string; value: any; onChange: (v: string) => void; full?: boolean }) {
  return (
    <label className={`text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
    </label>
  );
}

function ServicesInline({ products, onSave, onDelete, userId }: {
  products: any[]; onSave: (p: any) => Promise<void>; onDelete: (id: string) => Promise<void>; userId?: string;
}) {
  const [editing, setEditing] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const startNew = () => setEditing({ title: "", description: "", price_text: "", image_url: "", sort_order: products.length, is_active: true });

  const submit = async () => {
    if (!editing?.title?.trim()) { toast.error("Nhập tên dịch vụ"); return; }
    setBusy(true);
    try {
      await onSave({
        id: editing.id, title: editing.title, description: editing.description || "",
        price_text: editing.price_text || "", image_url: editing.image_url || "",
        sort_order: editing.sort_order ?? 0, is_active: editing.is_active ?? true,
      });
      toast.success("Đã lưu"); setEditing(null);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const uploadForEditor = async (file: File) => {
    if (!userId) return;
    try {
      const url = await uploadImage(file, userId, "vendor-product");
      setEditing((e: any) => ({ ...e, image_url: url }));
    } catch (e: any) { toast.error(e.message); }
  };

  const move = async (row: any, dir: -1 | 1) => {
    const idx = products.findIndex((p) => p.id === row.id);
    const other = products[idx + dir];
    if (!other) return;
    await onSave({ id: row.id, title: row.title, description: row.description ?? "", price_text: row.price_text ?? "", image_url: row.image_url ?? "", sort_order: other.sort_order ?? 0, is_active: row.is_active ?? true });
    await onSave({ id: other.id, title: other.title, description: other.description ?? "", price_text: other.price_text ?? "", image_url: other.image_url ?? "", sort_order: row.sort_order ?? 0, is_active: other.is_active ?? true });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Danh sách dịch vụ / gói hiển thị trên trang công khai. Kéo thứ tự bằng nút ↑↓.</p>
        <button type="button" onClick={startNew}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm">
          <Plus className="h-3.5 w-3.5" /> Thêm dịch vụ
        </button>
      </div>

      {products.length === 0 && !editing && (
        <div className="p-10 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground">
          Chưa có dịch vụ nào.
        </div>
      )}

      <div className="space-y-2">
        {products.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 p-3 border border-border/60 rounded-md bg-card">
            {p.image_url ? <img src={p.image_url} alt="" className="w-14 h-14 object-cover rounded" />
              : <div className="w-14 h-14 rounded bg-muted" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.title}</p>
              {p.price_text && <p className="text-sm text-primary">{p.price_text}</p>}
              {!p.is_active && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ẩn</span>}
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(p, -1)} disabled={i === 0} className="p-1.5 rounded border disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(p, 1)} disabled={i === products.length - 1} className="p-1.5 rounded border disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setEditing(p)} className="px-2 py-1 rounded border text-xs">Sửa</button>
              <button type="button" onClick={async () => { if (confirm("Xoá dịch vụ?")) { await onDelete(p.id); toast.success("Đã xoá"); } }}
                className="p-1.5 rounded border border-destructive/50 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="p-4 border border-primary/40 rounded-md bg-card space-y-3">
          <p className="font-display text-lg">{editing.id ? "Sửa dịch vụ" : "Dịch vụ mới"}</p>
          <Field label="Tên dịch vụ" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} full />
          <Field label="Giá (hiển thị)" value={editing.price_text} onChange={(v) => setEditing({ ...editing, price_text: v })} />
          <label className="text-sm block">
            <span className="text-muted-foreground">Mô tả</span>
            <textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
          </label>
          <div className="flex items-center gap-3">
            {editing.image_url ? <img src={editing.image_url} alt="" className="w-20 h-20 rounded object-cover" />
              : <div className="w-20 h-20 rounded bg-muted" />}
            <ImageUploadButton buttonLabel={editing.image_url ? "Đổi ảnh" : "Tải ảnh"} helper="" onUpload={uploadForEditor} />
            {editing.image_url && <button type="button" onClick={() => setEditing({ ...editing, image_url: "" })} className="text-xs text-destructive underline">Xoá ảnh</button>}
          </div>
          <label className="text-sm inline-flex items-center gap-2">
            <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            Đang hoạt động (hiển thị công khai)
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={submit} disabled={busy} className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50">
              {busy ? "Đang lưu…" : "Lưu"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 rounded border text-sm">Huỷ</button>
          </div>
        </div>
      )}
    </div>
  );
}