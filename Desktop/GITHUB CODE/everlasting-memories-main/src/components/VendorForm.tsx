import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetVendor, adminUpsertVendor } from "@/lib/admin.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const CAT_LABEL: Record<string, string> = {
  venue: "Trung tâm tiệc cưới",
  photography: "Chụp ảnh",
  videography: "Quay phim",
  wedding_planner: "Tổ chức cưới",
  makeup: "Trang điểm",
  attire: "Trang phục",
  flowers: "Hoa cưới",
  catering: "Ẩm thực",
  music: "Âm nhạc",
  decor: "Trang trí",
  invitation: "Thiệp cưới",
  other: "Khác",
};

const fields = [
  { k: "name", label: "Tên thương hiệu", required: true },
  { k: "slug", label: "Slug", required: true },
  { k: "tagline", label: "Tagline" },
  { k: "description", label: "Mô tả", textarea: true, full: true },
  { k: "price_range", label: "Khoảng giá" },
  { k: "phone", label: "Điện thoại" },
  { k: "email", label: "Email" },
  { k: "website", label: "Website" },
  { k: "city", label: "Thành phố" },
  { k: "address", label: "Địa chỉ", full: true },
  { k: "youtube_url", label: "Link YouTube (embed)", full: true },
];

const imageFields = [
  { k: "cover_image", label: "Ảnh bìa" },
  { k: "logo_url", label: "Logo" },
];

export function VendorForm({ initial }: { initial: any }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<any>({ category: "other", gallery: [], ...initial });
  const [uploading, setUploading] = useState<string | null>(null);
  const upsert = useServerFn(adminUpsertVendor);

  useEffect(() => {
    if (!form) return;
    if (!form.name) return;
    if (form.slug && form.slug.length > 0) return;
    const slug = form.name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setForm((f:any) => ({ ...f, slug }));
  }, [form.name]);

  const save = useMutation({
    mutationFn: () => upsert({ data: form }),
    onSuccess: (res:any) => {
      toast.success("Đã lưu vendor.");
      qc.invalidateQueries({ queryKey:["a-vendors"] });
      if (res?.id) {
        setForm((f:any) => ({ ...f, ...res }));
        if (!form.id) navigate({ to: "/admin/vendors/$id", params: { id: res.id } });
      }
    },
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

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); save.mutate(); }} className="space-y-8">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm sm:col-span-2">
          <span className="text-muted-foreground">Danh mục</span>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background">
            {Object.keys(CAT_LABEL).map(c => (
              <option key={c} value={c}>{CAT_LABEL[c] ?? c}</option>
            ))}
          </select>
        </label>
        {fields.map(field => (
          <label key={field.k} className={`text-sm ${field.full?"sm:col-span-2":""}`}>
            <span className="text-muted-foreground">{field.label}</span>
            {field.textarea ? (
              <textarea rows={4} value={form[field.k] ?? ""} onChange={e=>setForm({...form,[field.k]:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
            ) : (
              <input type="text" required={field.required} value={form[field.k] ?? ""} onChange={e=>setForm({...form,[field.k]:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
            )}
          </label>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {imageFields.map(img => (
          <div key={img.k} className="border border-border/60 rounded p-3 bg-card">
            <p className="text-xs text-muted-foreground">{img.label}</p>
            <div className="mt-2 aspect-[4/3] bg-secondary/50 rounded overflow-hidden flex items-center justify-center">
              {form[img.k] ? <img src={form[img.k]} alt={img.label} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">Chưa có</span>}
            </div>
            <input aria-label={`Tải ${img.label}`} type="file" accept="image/*" disabled={uploading===img.k} onChange={e=>{ const file=e.target.files?.[0]; if(file) onUpload(img.k,file); }} className="mt-2 text-xs w-full" />
            {form[img.k] && <button type="button" onClick={()=>setForm((f:any)=>({...f,[img.k]:""}))} className="mt-1 text-xs text-destructive">Xoá</button>}
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-center">
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={!!form.is_approved} onChange={e=>setForm({...form,is_approved:e.target.checked})} />
          Đã duyệt
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={!!form.is_featured} onChange={e=>setForm({...form,is_featured:e.target.checked})} />
          Nổi bật
        </label>
      </div>

      <button disabled={save.isPending} className="px-6 py-3 bg-primary text-primary-foreground rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">{save.isPending?"Đang lưu…":"Lưu vendor"}</button>
    </form>
  );
}
