import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyVendor, upsertMyVendor, publishMyVendor } from "@/lib/vendor-owner.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const fetchMine = useServerFn(getMyVendor);
  const save = useServerFn(upsertMyVendor);
  const publish = useServerFn(publishMyVendor);
  const { data, isLoading } = useQuery({ queryKey:["my-vendor"], queryFn:()=>fetchMine() });
  const [form, setForm] = useState<any>({ category: "other", gallery: [] });
  const [uploading, setUploading] = useState<string | null>(null);

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
    mutationFn: () => publish(),
    onSuccess: () => { toast.success("Đã xuất bản phiên bản hiển thị công khai."); qc.invalidateQueries({queryKey:["my-vendor"]}); },
    onError: (e:any)=>toast.error(e.message),
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
    } catch (e:any) { toast.error(e.message); } finally { setUploading(null); }
  };

  if (isLoading) return <p className="text-center py-20 text-muted-foreground">Đang tải…</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-script text-3xl text-primary">vendor portal</p>
          <h1 className="font-display text-4xl">Hồ sơ dịch vụ</h1>
          <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <button onClick={signOut} className="text-sm text-primary underline">Đăng xuất</button>
      </div>
      <nav className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/vendor/products" className="px-3 py-1.5 rounded bg-secondary/60 hover:bg-secondary">Sản phẩm/Dịch vụ</Link>
        <Link to="/vendor/testimonials" className="px-3 py-1.5 rounded bg-secondary/60 hover:bg-secondary">Đánh giá</Link>
        <Link to="/vendor/leads" className="px-3 py-1.5 rounded bg-secondary/60 hover:bg-secondary">Yêu cầu tư vấn</Link>
        <Link to="/vendor/billing" className="px-3 py-1.5 rounded bg-secondary/60 hover:bg-secondary">Gói thành viên</Link>
        {data && (data as any).slug && (
          <Link to="/vendors/$slug" params={{ slug: (data as any).slug }} target="_blank" className="px-3 py-1.5 rounded border border-primary text-primary hover:bg-primary hover:text-primary-foreground">Xem trang công khai ↗</Link>
        )}
      </nav>
      {data && !(data as any).is_approved && <p className="mt-4 p-3 bg-secondary/60 rounded text-sm">⏳ Đang chờ admin duyệt.</p>}
      {data && (data as any).is_approved && (
        <p className="mt-4 p-3 bg-secondary/60 rounded text-sm">
          {(data as any).published_at
            ? <>✓ Bản công khai cập nhật lần cuối: {new Date((data as any).published_at).toLocaleString("vi-VN")}</>
            : "Chưa xuất bản — lưu trước rồi nhấn “Xuất bản” để hiển thị công khai."}
        </p>
      )}

      <form onSubmit={(e)=>{e.preventDefault(); m.mutate();}} className="mt-8 space-y-6">
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

        <div className="grid sm:grid-cols-2 gap-4">
          <ImageUpload label="Ảnh bìa" value={form.cover_image} onUpload={(f)=>onUpload("cover_image",f)} onClear={()=>setForm({...form,cover_image:""})} busy={uploading==="cover_image"} />
          <ImageUpload label="Logo" value={form.logo_url} onUpload={(f)=>onUpload("logo_url",f)} onClear={()=>setForm({...form,logo_url:""})} busy={uploading==="logo_url"} />
        </div>

        <div>
          <h3 className="font-display text-xl mb-3">Thư viện</h3>
          <input type="file" accept="image/*" disabled={uploading==="gallery"} onChange={e=>{ const f=e.target.files?.[0]; if(f) onAddGallery(f); }} className="text-sm" />
          <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
            {(form.gallery ?? []).map((url:string,i:number)=>(
              <div key={i} className="relative group aspect-square rounded overflow-hidden border border-border/60">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={()=>setForm({...form, gallery: form.gallery.filter((_:any,j:number)=>j!==i)})} className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">Xoá</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={m.isPending} className="px-6 py-3 bg-primary text-primary-foreground rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">{m.isPending?"Đang lưu…":"Lưu bản nháp"}</button>
          <button type="button" onClick={()=>pub.mutate()} disabled={pub.isPending || !data || !(data as any).is_approved} title={!(data as any)?.is_approved ? "Cần admin duyệt trước" : ""} className="px-6 py-3 border border-primary text-primary rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">{pub.isPending?"Đang xuất bản…":"Xuất bản"}</button>
        </div>
      </form>
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
function ImageUpload({ label, value, onUpload, onClear, busy }: { label:string; value:string; onUpload:(f:File)=>void; onClear:()=>void; busy:boolean }) {
  return (
    <div className="border border-border/60 rounded p-3 bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 aspect-[4/3] bg-secondary/50 rounded overflow-hidden flex items-center justify-center">
        {value ? <img src={value} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">Chưa có</span>}
      </div>
      <input type="file" accept="image/*" disabled={busy} onChange={e=>{ const f=e.target.files?.[0]; if(f) onUpload(f); }} className="mt-2 text-xs w-full" />
      {value && <button type="button" onClick={onClear} className="mt-1 text-xs text-destructive">Xoá</button>}
    </div>
  );
}
