import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminUpsertCouple, adminAddGallery, adminDeleteGallery } from "@/lib/admin.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const fields: { k: string; label: string; type?: string; full?: boolean }[] = [
  { k:"bride_name", label:"Tên cô dâu" }, { k:"groom_name", label:"Tên chú rể" },
  { k:"slug", label:"Slug" }, { k:"wedding_date", label:"Ngày cưới", type:"date" },
  { k:"ceremony_time", label:"Giờ lễ thành hôn" },
  { k:"reception_time", label:"Giờ tiệc chiêu đãi" },
  { k:"venue_name", label:"Tên địa điểm", full:true }, { k:"venue_address", label:"Địa chỉ", full:true },
  { k:"quote", label:"Câu trích dẫn", full:true },
  { k:"youtube_url", label:"Link YouTube", full:true },
  { k:"story", label:"Câu chuyện", full:true },
];

const imageFields = [
  { k:"cover_image", label:"Ảnh bìa" },
  { k:"hero_image_1", label:"Hero 1" },
  { k:"hero_image_2", label:"Hero 2" },
  { k:"hero_image_3", label:"Hero 3" },
];

export function CoupleForm({ initial, gallery = [] }: { initial: any; gallery?: any[] }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<any>({ is_published: true, ...initial, schedule: Array.isArray(initial?.schedule) ? initial.schedule : [] });
  const [uploading, setUploading] = useState<string | null>(null);
  const upsert = useServerFn(adminUpsertCouple);
  const addG = useServerFn(adminAddGallery);
  const delG = useServerFn(adminDeleteGallery);

  const save = useMutation({
    mutationFn: () => upsert({ data: form }),
    onSuccess: (r:any) => {
      toast.success("Đã lưu");
      qc.invalidateQueries({ queryKey:["a-couples"] });
      if (!form.id) navigate({ to: "/admin/couples/$id", params: { id: r.id } });
    },
    onError: (e:any) => toast.error(e.message),
  });

  const onUpload = async (field: string, file: File) => {
    if (!user) return;
    setUploading(field);
    try {
      const url = await uploadImage(file, user.id, "couples");
      setForm((f:any) => ({ ...f, [field]: url }));
      toast.success("Đã tải");
    } catch (e:any) { toast.error(e.message); } finally { setUploading(null); }
  };

  const onAddGallery = async (file: File) => {
    if (!form.id || !user) { toast.error("Lưu cặp đôi trước"); return; }
    setUploading("gallery");
    try {
      const url = await uploadImage(file, user.id, "gallery");
      await addG({ data: { couple_id: form.id, image_url: url, caption: "" } });
      qc.invalidateQueries({ queryKey:["a-couple-detail", form.id] });
    } catch (e:any) { toast.error(e.message); } finally { setUploading(null); }
  };

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); save.mutate(); }} className="space-y-8">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map(f=>(
          <label key={f.k} className={`text-sm ${f.full?"sm:col-span-2":""}`}>
            <span className="text-muted-foreground">{f.label}</span>
            {f.k === "story" || f.k === "quote" ? (
              <textarea rows={f.k==="story"?6:2} value={form[f.k] ?? ""} onChange={e=>setForm({...form,[f.k]:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
            ) : (
              <input type={f.type ?? "text"} required={["bride_name","groom_name","slug"].includes(f.k)} value={form[f.k] ?? ""} onChange={e=>setForm({...form,[f.k]:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
            )}
          </label>
        ))}
        <label className="text-sm sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" checked={!!form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})} /> Xuất bản
        </label>
      </div>

      <div>
        <h3 className="font-display text-xl mb-3">Hình ảnh chính</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {imageFields.map(f=>(
            <div key={f.k} className="border border-border/60 rounded p-3 bg-card">
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <div className="mt-2 aspect-[4/3] bg-secondary/50 rounded overflow-hidden flex items-center justify-center">
                {form[f.k] ? <img src={form[f.k]} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">Chưa có</span>}
              </div>
              <input type="file" accept="image/*" disabled={uploading===f.k} onChange={e=>{ const file=e.target.files?.[0]; if(file) onUpload(f.k,file); }} className="mt-2 text-xs w-full" />
              {form[f.k] && <button type="button" onClick={()=>setForm({...form,[f.k]:""})} className="mt-1 text-xs text-destructive">Xoá</button>}
            </div>
          ))}
        </div>
      </div>

      {form.id && (
        <div>
          <h3 className="font-display text-xl mb-3">Thư viện ảnh</h3>
          <input type="file" accept="image/*" disabled={uploading==="gallery"} onChange={e=>{ const f=e.target.files?.[0]; if(f) onAddGallery(f); }} className="text-sm" />
          <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
            {gallery.map((g:any)=>(
              <div key={g.id} className="relative group aspect-square rounded overflow-hidden border border-border/60">
                <img src={g.image_url} className="w-full h-full object-cover" />
                <button type="button" onClick={async ()=>{ await delG({data:{id:g.id}}); qc.invalidateQueries({queryKey:["a-couple-detail",form.id]}); }} className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">Xoá</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display text-xl mb-3">Thông tin chuyển khoản mừng cưới</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2 bg-secondary/40 p-4 rounded">
            <p className="font-script text-2xl text-primary">Cô dâu</p>
            <input value={form.gift_bride_holder ?? ""} onChange={e=>setForm({...form,gift_bride_holder:e.target.value})} placeholder="Chủ tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_bride_bank ?? ""} onChange={e=>setForm({...form,gift_bride_bank:e.target.value})} placeholder="Ngân hàng" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_bride_account ?? ""} onChange={e=>setForm({...form,gift_bride_account:e.target.value})} placeholder="Số tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
          </div>
          <div className="space-y-2 bg-secondary/40 p-4 rounded">
            <p className="font-script text-2xl text-primary">Chú rể</p>
            <input value={form.gift_groom_holder ?? ""} onChange={e=>setForm({...form,gift_groom_holder:e.target.value})} placeholder="Chủ tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_groom_bank ?? ""} onChange={e=>setForm({...form,gift_groom_bank:e.target.value})} placeholder="Ngân hàng" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_groom_account ?? ""} onChange={e=>setForm({...form,gift_groom_account:e.target.value})} placeholder="Số tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl mb-3">Chương trình lễ cưới</h3>
        <div className="space-y-2">
          {(form.schedule ?? []).map((s:any, i:number) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={s.time ?? ""} onChange={e=>{ const n=[...form.schedule]; n[i]={...n[i],time:e.target.value}; setForm({...form,schedule:n}); }} placeholder="Giờ" className="col-span-2 px-3 py-2 rounded border border-input bg-background text-sm" />
              <input value={s.title ?? ""} onChange={e=>{ const n=[...form.schedule]; n[i]={...n[i],title:e.target.value}; setForm({...form,schedule:n}); }} placeholder="Tiêu đề *" className="col-span-4 px-3 py-2 rounded border border-input bg-background text-sm" />
              <input value={s.description ?? ""} onChange={e=>{ const n=[...form.schedule]; n[i]={...n[i],description:e.target.value}; setForm({...form,schedule:n}); }} placeholder="Mô tả" className="col-span-5 px-3 py-2 rounded border border-input bg-background text-sm" />
              <button type="button" onClick={()=>setForm({...form, schedule: form.schedule.filter((_:any,j:number)=>j!==i)})} className="col-span-1 text-destructive text-sm">×</button>
            </div>
          ))}
          <button type="button" onClick={()=>setForm({...form, schedule:[...(form.schedule??[]),{ time:"",title:"",description:"" }]})} className="text-sm text-primary underline">+ Thêm mục</button>
        </div>
      </div>

      <button disabled={save.isPending} className="px-6 py-3 bg-primary text-primary-foreground rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">{save.isPending?"Đang lưu…":"Lưu"}</button>
    </form>
  );
}
