import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminUpsertVendor, adminPublishVendor, listActiveCategories } from "@/lib/admin.functions";
import { uploadImage, validateImage } from "@/lib/upload";
import { ImagePicker, ImageUploadButton } from "@/components/ImagePicker";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const FALLBACK_CATS = [
  { slug: "other", label: "Khác", sort_order: 999 },
];

export function VendorForm({ initial }: { initial: any }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const fetchCats = useServerFn(listActiveCategories);
  const { data: cats = FALLBACK_CATS } = useQuery({ queryKey: ["active-categories"], queryFn: () => fetchCats() });
  const [form, setForm] = useState<any>({
    category: "other",
    is_approved: false,
    is_featured: false,
    ...initial,
    gallery: Array.isArray(initial?.gallery) ? initial.gallery : [],
  });
  const upsert = useServerFn(adminUpsertVendor);
  const pub = useServerFn(adminPublishVendor);

  const save = useMutation({
    mutationFn: () => upsert({ data: {
      id: form.id, name: form.name, slug: form.slug, category: form.category,
      tagline: form.tagline, description: form.description,
      cover_image: form.cover_image, logo_url: form.logo_url,
      phone: form.phone, email: form.email, address: form.address, city: form.city,
      website: form.website, price_range: form.price_range, youtube_url: form.youtube_url,
      gallery: form.gallery ?? [],
      owner_id: form.owner_id || null,
      is_approved: !!form.is_approved, is_featured: !!form.is_featured,
    }}),
    onSuccess: (r: any) => {
      toast.success("Đã lưu vendor");
      qc.invalidateQueries({ queryKey: ["a-vendors"] });
      qc.invalidateQueries({ queryKey: ["a-vendor", form.id] });
      if (!form.id && r?.id) navigate({ to: "/admin/vendors/$id", params: { id: r.id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const publish = useMutation({
    mutationFn: () => pub({ data: { id: form.id } }),
    onSuccess: () => { toast.success("Đã xuất bản bản công khai"); qc.invalidateQueries({ queryKey: ["a-vendors"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  async function addGallery(file: File) {
    if (!user) { toast.error("Cần đăng nhập"); return; }
    const v = validateImage(file, { maxMB: 10 });
    if (v) { toast.error(v); throw new Error(v); }
    const url = await uploadImage(file, user.id, "vendor-gallery");
    setForm((f: any) => ({ ...f, gallery: [...(f.gallery ?? []), url] }));
    toast.success("Đã thêm ảnh");
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-8">
      <section>
        <h3 className="font-display text-xl mb-3">Thông tin chung</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tên thương hiệu *" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Field label="Slug *" value={form.slug} onChange={v => setForm({ ...form, slug: v })} required placeholder="lumiere-photography" />
          <label className="text-sm">
            <span className="text-muted-foreground">Danh mục *</span>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background">
              {(cats as any[]).map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </label>
          <Field label="Khoảng giá" value={form.price_range} onChange={v => setForm({ ...form, price_range: v })} placeholder="VD: từ 25 triệu" />
          <Field label="Tagline" value={form.tagline} onChange={v => setForm({ ...form, tagline: v })} full />
          <label className="text-sm sm:col-span-2">
            <span className="text-muted-foreground">Mô tả</span>
            <textarea rows={5} value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" />
          </label>
          <Field label="Điện thoại" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Field label="Website" value={form.website} onChange={v => setForm({ ...form, website: v })} />
          <Field label="Thành phố" value={form.city} onChange={v => setForm({ ...form, city: v })} />
          <Field label="Địa chỉ" value={form.address} onChange={v => setForm({ ...form, address: v })} full />
          <Field label="Link YouTube (embed)" value={form.youtube_url} onChange={v => setForm({ ...form, youtube_url: v })} full placeholder="https://www.youtube.com/embed/..." />
          <label className="text-sm sm:col-span-2">
            <span className="text-muted-foreground">Owner ID (UUID người dùng — để trống nếu vendor chưa có tài khoản)</span>
            <input value={form.owner_id ?? ""} onChange={e => setForm({ ...form, owner_id: e.target.value || null })} placeholder="UUID người dùng" className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background font-mono text-xs" />
          </label>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={!!form.is_approved} onChange={e => setForm({ ...form, is_approved: e.target.checked })} /> Đã duyệt — hiển thị công khai</label>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={!!form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Đánh dấu nổi bật</label>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl mb-3">Hình ảnh thương hiệu</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-border/60 rounded-md p-3 bg-card">
            <ImagePicker label="Ảnh bìa" value={form.cover_image ?? ""} onChange={(url) => setForm({ ...form, cover_image: url })} folder="vendor" />
          </div>
          <div className="border border-border/60 rounded-md p-3 bg-card">
            <ImagePicker label="Logo" value={form.logo_url ?? ""} onChange={(url) => setForm({ ...form, logo_url: url })} folder="vendor" aspect="aspect-square" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="font-display text-xl">Thư viện ảnh</h3>
          <span className="text-xs text-muted-foreground">{(form.gallery ?? []).length}/30</span>
        </div>
        <ImageUploadButton
          disabled={(form.gallery ?? []).length >= 30}
          buttonLabel="+ Thêm ảnh vào thư viện"
          onUpload={addGallery}
        />
        <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
          {(form.gallery ?? []).map((url: string, i: number) => (
            <div key={i} className="relative group aspect-square rounded overflow-hidden border border-border/60">
              <img src={url} className="w-full h-full object-cover" />
              <button type="button"
                onClick={() => setForm({ ...form, gallery: (form.gallery ?? []).filter((_: any, j: number) => j !== i) })}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">
                Xoá
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-6 px-6 border-t border-border/40 flex flex-wrap gap-3">
        <button disabled={save.isPending} className="px-6 py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm font-medium disabled:opacity-50 hover:bg-primary/90">
          {save.isPending ? "Đang lưu…" : (form.id ? "Lưu thay đổi" : "Tạo vendor")}
        </button>
        {form.id && (
          <button type="button" disabled={publish.isPending} onClick={() => publish.mutate()} className="px-6 py-3 border border-primary text-primary rounded-md uppercase tracking-[0.2em] text-sm font-medium disabled:opacity-50 hover:bg-primary hover:text-primary-foreground">
            {publish.isPending ? "Đang xuất bản…" : "Xuất bản công khai"}
          </button>
        )}
        {form.slug && (
          <a href={`/vendors/${form.slug}`} target="_blank" rel="noopener" className="px-6 py-3 border border-input bg-background hover:bg-secondary rounded-md uppercase tracking-[0.2em] text-sm">
            Xem trang ↗
          </a>
        )}
      </div>
    </form>
  );
}

function Field({ label, value, onChange, required, full, placeholder }: { label: string; value: any; onChange: (v: string) => void; required?: boolean; full?: boolean; placeholder?: string }) {
  return (
    <label className={`text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <input required={required} value={value ?? ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" />
    </label>
  );
}