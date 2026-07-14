import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminUpsertVendor, adminPublishVendor, listActiveCategories } from "@/lib/admin.functions";
import { uploadImage, validateImage } from "@/lib/upload";
import { ImagePicker, ImageUploadButton } from "@/components/ImagePicker";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FormSection, SelectOrOther, FieldLabel } from "@/components/FormSection";
import { VN_PROVINCES, VENDOR_PRICE_RANGES } from "@/lib/form-presets";
import { WizardHeader, WizardFooter, useLocalDraft } from "@/components/FormWizard";

const FALLBACK_CATS = [
  { slug: "other", label: "Khác", sort_order: 999 },
];

export function VendorForm({ initial, wizard = false }: { initial: any; wizard?: boolean }) {
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
  const [step, setStep] = useState(0);
  const stepTitles = ["Thông tin chung", "Hình ảnh thương hiệu", "Thư viện"];
  const show = (n: number) => !wizard || step === n;
  const draftKey = wizard ? `mariee:draft:vendor:${form.id ?? initial?.slug ?? "new"}` : "noop";
  const draft = useLocalDraft<any>({
    key: draftKey, value: form, enabled: wizard,
    onRestore: (v) => setForm(v),
  });
  const upsert = useServerFn(adminUpsertVendor);
  const pub = useServerFn(adminPublishVendor);

  const buildPayload = (extra?: any) => ({
    id: form.id, name: form.name, slug: form.slug, category: form.category,
    tagline: form.tagline, description: form.description,
    cover_image: form.cover_image, logo_url: form.logo_url,
    phone: form.phone, email: form.email, address: form.address, city: form.city,
    website: form.website, price_range: form.price_range, youtube_url: form.youtube_url,
    gallery: form.gallery ?? [],
    owner_id: form.owner_id || null,
    is_approved: !!form.is_approved, is_featured: !!form.is_featured,
    ...(extra ?? {}),
  });

  const save = useMutation({
    mutationFn: () => upsert({ data: buildPayload() }),
    onSuccess: (r: any) => {
      toast.success("Đã lưu vendor");
      qc.invalidateQueries({ queryKey: ["a-vendors"] });
      qc.invalidateQueries({ queryKey: ["a-vendor", form.id] });
      if (wizard) draft.clear();
      if (!form.id && r?.id) navigate({ to: "/admin/vendors/$id", params: { id: r.id } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const publish = useMutation({
    mutationFn: async () => {
      // Luôn lưu form trước rồi snapshot xuất bản — tránh mất dữ liệu đang nhập
      await upsert({ data: buildPayload({ is_approved: true }) });
      return pub({ data: { id: form.id } });
    },
    onSuccess: () => {
      toast.success("Đã lưu và xuất bản bản công khai");
      setForm((f: any) => ({ ...f, is_approved: true }));
      qc.invalidateQueries({ queryKey: ["a-vendors"] });
      qc.invalidateQueries({ queryKey: ["a-vendor", form.id] });
    },
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
      {wizard && draft.RestoreBanner}
      {wizard && <WizardHeader titles={stepTitles} step={step} setStep={setStep} />}
      <FormSection
        hidden={!show(0)}
        title="Thông tin chung"
        description="Tên thương hiệu sẽ hiển thị nổi bật. Slug tạo nên URL công khai và không thể đổi sau khi nhiều người đã biết."
        helper={
          <>
            <p><strong>Tên thương hiệu</strong>: viết hoa đầu mỗi từ, không thêm hậu tố "studio/photography" nếu không cần.</p>
            <p><strong>Slug</strong>: chỉ dùng chữ thường, số, dấu gạch ngang. VD <code className="text-primary">lumiere-photography</code>.</p>
            <p><strong>Tagline</strong>: 6–12 từ, nêu phong cách hoặc thế mạnh. VD "Phim cưới điện ảnh chuẩn Pháp".</p>
            <p><strong>Mô tả</strong>: 150–400 từ. Tránh sao chép từ Facebook — kể câu chuyện thương hiệu.</p>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tên thương hiệu *" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <Field label="Slug *" value={form.slug} onChange={v => setForm({ ...form, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") })} required placeholder="lumiere-photography" />
          <label className="text-sm">
            <FieldLabel required>Danh mục</FieldLabel>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background">
              {(cats as any[]).map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <FieldLabel>Khoảng giá</FieldLabel>
            <div className="mt-1">
              <SelectOrOther value={form.price_range ?? ""} onChange={v => setForm({ ...form, price_range: v })} options={VENDOR_PRICE_RANGES} inputPlaceholder="VD: từ 25 triệu" />
            </div>
          </label>
          <Field label="Tagline" value={form.tagline} onChange={v => setForm({ ...form, tagline: v })} full />
          <label className="text-sm sm:col-span-2">
            <FieldLabel>Mô tả</FieldLabel>
            <textarea rows={5} value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" />
            <span className="text-[11px] text-muted-foreground">{(form.description ?? "").length} ký tự</span>
          </label>
          <Field label="Điện thoại" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="VD: 0901 234 567" />
          <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="hello@studio.vn" type="email" />
          <Field label="Website" value={form.website} onChange={v => setForm({ ...form, website: v })} />
          <label className="text-sm">
            <FieldLabel>Thành phố</FieldLabel>
            <div className="mt-1">
              <SelectOrOther value={form.city ?? ""} onChange={v => setForm({ ...form, city: v })} options={VN_PROVINCES} inputPlaceholder="Tên tỉnh/thành" />
            </div>
          </label>
          <Field label="Địa chỉ" value={form.address} onChange={v => setForm({ ...form, address: v })} full />
          <Field label="Link YouTube (embed)" value={form.youtube_url} onChange={v => setForm({ ...form, youtube_url: v })} full placeholder="https://www.youtube.com/embed/..." />
          <label className="text-sm sm:col-span-2">
            <FieldLabel>Owner ID (UUID người dùng — để trống nếu vendor chưa có tài khoản)</FieldLabel>
            <input value={form.owner_id ?? ""} onChange={e => setForm({ ...form, owner_id: e.target.value || null })} placeholder="UUID người dùng" className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background font-mono text-xs" />
          </label>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={!!form.is_approved} onChange={e => setForm({ ...form, is_approved: e.target.checked })} /> Đã duyệt — hiển thị công khai</label>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={!!form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Đánh dấu nổi bật</label>
        </div>
      </FormSection>

      <FormSection
        hidden={!show(1)}
        title="Hình ảnh thương hiệu"
        description="Ảnh bìa hiển thị trên thẻ vendor và đầu trang chi tiết. Logo dùng cho danh sách và trang chia sẻ."
        helper={
          <>
            <p><strong>Ảnh bìa</strong>: ngang 1600×900px, ≤ 10MB. Ưu tiên ảnh thực tế đám cưới, tránh ảnh logo phóng to.</p>
            <p><strong>Logo</strong>: vuông tối thiểu 512×512, nền trong hoặc trắng. PNG hoặc WEBP.</p>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-border/60 rounded-md p-3 bg-card">
            <ImagePicker label="Ảnh bìa" value={form.cover_image ?? ""} onChange={(url) => setForm({ ...form, cover_image: url })} folder="vendor" />
          </div>
          <div className="border border-border/60 rounded-md p-3 bg-card">
            <ImagePicker label="Logo" value={form.logo_url ?? ""} onChange={(url) => setForm({ ...form, logo_url: url })} folder="vendor" aspect="aspect-square" />
          </div>
        </div>
      </FormSection>

      <FormSection
        hidden={!show(2)}
        title={`Thư viện ảnh (${(form.gallery ?? []).length}/30)`}
        description="Hiển thị slideshow ở trang chi tiết. Khuyến nghị 12–20 ảnh chất lượng cao."
        helper={
          <>
            <p>Sắp xếp theo thứ tự bạn muốn khách xem — ảnh đầu tiên là ấn tượng quan trọng nhất.</p>
            <p>Tránh watermark lớn hoặc ảnh chèn logo nặng tay.</p>
            <p>Mỗi ảnh ≤ 10MB, định dạng JPG/PNG/WEBP.</p>
          </>
        }
      >
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
      </FormSection>

      {wizard ? (
        <WizardFooter
          step={step} setStep={setStep} total={stepTitles.length}
          onSubmit={() => save.mutate()}
          submitLabel={form.id ? "Lưu thay đổi" : "Tạo vendor"}
          isSubmitting={save.isPending}
          onSaveDraft={draft.saveNow}
          onPreview={form.slug ? () => window.open(`/vendors/${form.slug}`, "_blank") : undefined}
          previewLabel="Xem trang"
          extra={form.id ? (
            <button type="button" disabled={publish.isPending || save.isPending} onClick={() => publish.mutate()}
              className="px-3 py-2 rounded bg-primary/90 text-primary-foreground text-xs uppercase tracking-wider disabled:opacity-50">
              {publish.isPending ? "Đang xuất bản…" : "Lưu & Xuất bản"}
            </button>
          ) : undefined}
        />
      ) : (
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-6 px-6 border-t border-border/40 flex flex-wrap gap-3">
        <button disabled={save.isPending} className="px-6 py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-sm font-medium disabled:opacity-50 hover:bg-primary/90">
          {save.isPending ? "Đang lưu…" : (form.id ? "Lưu thay đổi" : "Tạo vendor")}
        </button>
        {form.id && (
          <button type="button" disabled={publish.isPending || save.isPending} onClick={() => publish.mutate()} className="px-6 py-3 border border-primary text-primary rounded-md uppercase tracking-[0.2em] text-sm font-medium disabled:opacity-50 hover:bg-primary hover:text-primary-foreground">
            {publish.isPending ? "Đang lưu & xuất bản…" : "Lưu & Xuất bản công khai"}
          </button>
        )}
        {form.slug && (
          <a href={`/vendors/${form.slug}`} target="_blank" rel="noopener" className="px-6 py-3 border border-input bg-background hover:bg-secondary rounded-md uppercase tracking-[0.2em] text-sm">
            Xem trang ↗
          </a>
        )}
      </div>
      )}
    </form>
  );
}

function Field({ label, value, onChange, required, full, placeholder, type }: { label: string; value: any; onChange: (v: string) => void; required?: boolean; full?: boolean; placeholder?: string; type?: string }) {
  return (
    <label className={`text-sm ${full ? "sm:col-span-2" : ""}`}>
      <FieldLabel required={required}>{label.replace(/\s*\*\s*$/, "")}</FieldLabel>
      <input required={required} type={type ?? "text"} value={value ?? ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" />
    </label>
  );
}