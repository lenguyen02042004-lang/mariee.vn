import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyVendor, upsertMyVendor, publishMyVendor, setMyVendorHidden } from "@/lib/vendor-owner.functions";
import { listMyProducts } from "@/lib/vendor-owner.functions";
import { uploadImage } from "@/lib/upload";
import { ImagePicker, ImageUploadButton } from "@/components/ImagePicker";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { WizardHeader, WizardFooter, useLocalDraft } from "@/components/FormWizard";

export const Route = createFileRoute("/_authenticated/vendor/")({
  component: VendorPortal,
  head: () => ({ meta: [{ title: "Vendor — Mariée" }] }),
});

const CATS: { value: string; label: string }[] = [
  { value: "venue", label: "Trung tâm tiệc cưới" },
  { value: "photography", label: "Chụp ảnh cưới" },
  { value: "videography", label: "Quay phim cưới" },
  { value: "wedding_planner", label: "Wedding planner" },
  { value: "makeup", label: "Trang điểm cô dâu" },
  { value: "attire", label: "Trang phục cưới" },
  { value: "flowers", label: "Hoa cưới" },
  { value: "catering", label: "Ẩm thực" },
  { value: "music", label: "Âm nhạc & live band" },
  { value: "decor", label: "Trang trí" },
  { value: "invitation", label: "Thiệp cưới" },
  { value: "other", label: "Dịch vụ khác" },
];

function VendorPortal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchMine = useServerFn(getMyVendor);
  const save = useServerFn(upsertMyVendor);
  const publish = useServerFn(publishMyVendor);
  const setHidden = useServerFn(setMyVendorHidden);
  const fetchProducts = useServerFn(listMyProducts);
  const { data, isLoading } = useQuery({ queryKey:["my-vendor"], queryFn:()=>fetchMine() });
  const { data: products } = useQuery({ queryKey:["my-products"], queryFn:()=>fetchProducts(), enabled: !!data });
  const [form, setForm] = useState<any>({ category: "other", gallery: [] });
  const [uploading, setUploading] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const stepTitles = ["Thông tin chung", "Hình ảnh thương hiệu", "Thư viện ảnh"];
  const show = (n: number) => step === n;
  const draftKey = `mariee:draft:vendor-owner:${user?.id ?? "anon"}`;
  const draft = useLocalDraft<any>({
    key: draftKey, value: form, enabled: !!user,
    onRestore: (v) => setForm(v),
  });

  useEffect(() => { if (data) setForm({ ...data, gallery: (data as any).gallery ?? [] }); }, [data]);

  const m = useMutation({
    mutationFn: () => save({ data: {
      name: form.name, slug: form.slug, category: form.category,
      tagline: form.tagline, description: form.description,
      cover_image: form.cover_image, logo_url: form.logo_url,
      phone: form.phone, email: form.email, address: form.address,
      city: form.city, website: form.website, price_range: form.price_range,
      youtube_url: form.youtube_url,
      gallery: form.gallery ?? [],
    }}),
    onSuccess: () => { toast.success("Đã lưu bản nháp."); qc.invalidateQueries({queryKey:["my-vendor"]}); },
    onError: (e:any)=>toast.error(e.message),
  });

  const pub = useMutation({
    mutationFn: async () => {
      // Luôn lưu nháp trước khi xuất bản để không mất dữ liệu đang nhập
      await save({ data: {
        name: form.name, slug: form.slug, category: form.category,
        tagline: form.tagline, description: form.description,
        cover_image: form.cover_image, logo_url: form.logo_url,
        phone: form.phone, email: form.email, address: form.address,
        city: form.city, website: form.website, price_range: form.price_range,
        youtube_url: form.youtube_url,
        gallery: form.gallery ?? [],
      }});
      return publish();
    },
    onSuccess: () => { toast.success("Đã lưu và xuất bản bản công khai."); draft.clear(); qc.invalidateQueries({queryKey:["my-vendor"]}); },
    onError: (e:any)=>toast.error(e.message),
  });

  const visibility = useMutation({
    mutationFn: (hidden: boolean) => setHidden({ data: { hidden } }),
    onSuccess: () => { toast.success("Đã cập nhật trạng thái hiển thị."); qc.invalidateQueries({ queryKey:["my-vendor"] }); },
    onError: (e:any) => toast.error(e.message),
  });

  const onUpload = async (field: string, file: File) => {
    if (!user) return;
    setUploading(field);
    try {
      const url = await uploadImage(file, user.id, "vendor");
      setForm((f:any)=>({ ...f, [field]: url }));
      toast.success("Đã tải ảnh");
    } catch (e:any) { toast.error(e.message); } finally { setUploading(null); }
  };

  const onAddGallery = async (file: File) => {
    if (!user) return;
    setUploading("gallery");
    try {
      const url = await uploadImage(file, user.id, "vendor-gallery");
      setForm((f:any)=>({ ...f, gallery: [...(f.gallery ?? []), url] }));
      toast.success("Đã thêm ảnh vào thư viện");
    } catch (e:any) { toast.error(e.message || "Tải ảnh thất bại"); throw e; }
    finally { setUploading(null); }
  };

  if (isLoading) return <p className="text-center py-20 text-muted-foreground">Đang tải…</p>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <p className="font-script text-2xl text-primary leading-none">vendor portal</p>
          <h1 className="font-display text-3xl mt-1">Hồ sơ dịch vụ</h1>
        </div>
        {data && (data as any).slug && (
          <Link to="/vendors/$slug" params={{ slug: (data as any).slug }} target="_blank" className="text-sm px-3 py-1.5 rounded border border-primary text-primary hover:bg-primary hover:text-primary-foreground">Xem trang công khai ↗</Link>
        )}
      </header>
      {data && (
        <div className="p-4 bg-secondary/60 rounded-md flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="space-y-1">
            {!(data as any).is_approved ? (
              <p>⏳ <span className="font-medium">Chờ admin duyệt</span> — hồ sơ chưa hiển thị công khai.</p>
            ) : (data as any).is_hidden_by_owner ? (
              <p>🚫 Đã duyệt nhưng <span className="font-medium">đang tạm ẩn</span>. Bật công khai để khách hàng nhìn thấy.</p>
            ) : (data as any).published_at ? (
              <p>✓ Đang công khai — cập nhật lần cuối {new Date((data as any).published_at).toLocaleString("vi-VN")}</p>
            ) : (
              <p>✓ Đã duyệt — lưu rồi nhấn “Xuất bản” để hiển thị công khai.</p>
            )}
          </div>
          {(data as any).is_approved && (
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {(data as any).is_hidden_by_owner ? "Tạm ẩn" : "Công khai"}
              </span>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!(data as any).is_hidden_by_owner}
                disabled={visibility.isPending}
                onChange={(e) => visibility.mutate(!e.target.checked)}
              />
              <span className="w-10 h-6 bg-muted rounded-full relative peer-checked:bg-primary transition-colors">
                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </span>
            </label>
          )}
        </div>
      )}

      <form onSubmit={(e)=>{e.preventDefault(); m.mutate();}} className="space-y-6">
        {draft.RestoreBanner}
        <WizardHeader titles={stepTitles} step={step} setStep={setStep} />
        {show(0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tên thương hiệu" value={form.name} onChange={v=>setForm({...form,name:v})} required />
          <Field label="Slug" value={form.slug} onChange={v=>setForm({...form,slug:v})} required />
          <label className="text-sm"><span className="text-muted-foreground">Danh mục</span>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background">
              {CATS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <Field label="Khoảng giá" value={form.price_range} onChange={v=>setForm({...form,price_range:v})} />
          <Field label="Tagline" value={form.tagline} onChange={v=>setForm({...form,tagline:v})} full />
          <label className="text-sm sm:col-span-2"><span className="text-muted-foreground">Mô tả</span>
            <textarea rows={5} value={form.description ?? ""} onChange={e=>setForm({...form,description:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
          </label>
          <Field label="Điện thoại" value={form.phone} onChange={v=>setForm({...form,phone:v})} />
          <Field label="Email" value={form.email} onChange={v=>setForm({...form,email:v})} />
          <Field label="Website" value={form.website} onChange={v=>setForm({...form,website:v})} />
          <Field label="Thành phố" value={form.city} onChange={v=>setForm({...form,city:v})} />
          <Field label="Địa chỉ" value={form.address} onChange={v=>setForm({...form,address:v})} full />
          <Field label="Link YouTube (embed)" value={form.youtube_url} onChange={v=>setForm({...form,youtube_url:v})} full />
          <label className="text-sm sm:col-span-2 text-xs text-muted-foreground -mt-2">Dùng dạng https://www.youtube.com/embed/VIDEO_ID</label>
        </div>
        )}

        {show(1) && (
        <div className="grid sm:grid-cols-2 gap-4">
          <ImagePicker label="Ảnh bìa" value={form.cover_image ?? ""} onChange={(url)=>setForm({...form, cover_image: url})} folder="vendor" />
          <ImagePicker label="Logo" value={form.logo_url ?? ""} onChange={(url)=>setForm({...form, logo_url: url})} folder="vendor" aspect="aspect-square" />
        </div>
        )}

        {show(2) && (
        <div>
          <h3 className="font-display text-xl mb-3">Thư viện</h3>
          <ImageUploadButton
            disabled={uploading==="gallery"}
            buttonLabel="+ Thêm ảnh vào thư viện"
            helper={`${(form.gallery ?? []).length} ảnh`}
            onUpload={onAddGallery}
          />
          <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
            {(form.gallery ?? []).map((url:string,i:number)=>(
              <div key={i} className="relative group aspect-square rounded overflow-hidden border border-border/60">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={()=>setForm({...form, gallery: form.gallery.filter((_:any,j:number)=>j!==i)})} className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">Xoá</button>
              </div>
            ))}
          </div>
        </div>
        )}

        <WizardFooter
          step={step} setStep={setStep} total={stepTitles.length}
          onSubmit={() => m.mutate()}
          submitLabel="Lưu bản nháp"
          isSubmitting={m.isPending}
          onSaveDraft={draft.saveNow}
          onPreview={data && (data as any).slug ? () => window.open(`/vendors/${(data as any).slug}`, "_blank") : undefined}
          previewLabel="Xem trang"
          extra={data && (data as any).is_approved ? (
            <button type="button" onClick={()=>pub.mutate()} disabled={pub.isPending || m.isPending}
              className="px-3 py-2 rounded bg-primary/90 text-primary-foreground text-xs uppercase tracking-wider disabled:opacity-50">
              {pub.isPending ? "Đang xuất bản…" : "Lưu & Xuất bản"}
            </button>
          ) : undefined}
        />
      </form>

      {data && (
        <section className="pt-6 border-t border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Sản phẩm & Dịch vụ</h2>
            <Link to="/vendor/products" className="text-sm text-primary underline">Quản lý →</Link>
          </div>
          {(!products || products.length === 0) ? (
            <p className="text-sm text-muted-foreground">Chưa có sản phẩm. <Link to="/vendor/products" className="text-primary underline">Thêm ngay</Link>.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(products as any[]).slice(0,6).map((p:any)=>(
                <div key={p.id} className="bg-card border border-border/40 rounded overflow-hidden">
                  {p.image_url && <img src={p.image_url} alt="" className="w-full aspect-[4/3] object-cover" />}
                  <div className="p-3">
                    <p className="font-display text-base">{p.title}</p>
                    {p.price_text && <p className="text-sm text-primary mt-0.5">{p.price_text}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required, full }: { label: string; value: any; onChange: (v:string)=>void; required?: boolean; full?: boolean }) {
  return (
    <label className={`text-sm ${full?"sm:col-span-2":""}`}>
      <span className="text-muted-foreground">{label}</span>
      <input required={required} value={value ?? ""} onChange={e=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
    </label>
  );
}
