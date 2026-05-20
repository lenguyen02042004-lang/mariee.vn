import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyProducts, upsertMyProduct, deleteMyProduct } from "@/lib/vendor-owner.functions";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Sản phẩm — Vendor" }] }),
});

const MAX_IMG_MB = 10;

function ProductsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchAll = useServerFn(listMyProducts);
  const save = useServerFn(upsertMyProduct);
  const del = useServerFn(deleteMyProduct);
  const { data, isLoading } = useQuery({ queryKey:["my-products"], queryFn:()=>fetchAll() });
  const [editing, setEditing] = useState<any>(null);

  const m = useMutation({
    mutationFn: (v:any) => save({ data: v }),
    onSuccess: () => { toast.success("Đã lưu"); setEditing(null); qc.invalidateQueries({ queryKey:["my-products"] }); },
    onError: (e:any) => toast.error(e.message),
  });
  const dm = useMutation({
    mutationFn: (id:string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá"); qc.invalidateQueries({ queryKey:["my-products"] }); },
    onError: (e:any) => toast.error(e.message),
  });

  const items = (data ?? []) as any[];

  function move(idx: number, dir: -1 | 1) {
    const next = items[idx + dir];
    const cur = items[idx];
    if (!next || !cur) return;
    m.mutate({ id: cur.id, title: cur.title, description: cur.description ?? "", price_text: cur.price_text ?? "", image_url: cur.image_url ?? "", is_active: cur.is_active ?? true, sort_order: next.sort_order ?? (idx + dir) });
    m.mutate({ id: next.id, title: next.title, description: next.description ?? "", price_text: next.price_text ?? "", image_url: next.image_url ?? "", is_active: next.is_active ?? true, sort_order: cur.sort_order ?? idx });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-script text-3xl text-primary">services</p>
          <h1 className="font-display text-4xl">Sản phẩm & Dịch vụ</h1>
          <p className="text-sm text-muted-foreground mt-1">Tối đa {MAX_IMG_MB}MB / ảnh. Định dạng JPG, PNG hoặc WebP.</p>
        </div>
        <Link to="/vendor" className="text-sm text-primary underline">← Về hồ sơ</Link>
      </div>

      <button onClick={()=>setEditing({ title:"", is_active:true, sort_order: items.length })} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">+ Thêm dịch vụ</button>

      {editing && <ProductEditor item={editing} userId={user?.id ?? ""} onCancel={()=>setEditing(null)} onSave={(v)=>m.mutate(v)} busy={m.isPending} />}

      {isLoading && <p className="mt-6 text-muted-foreground">Đang tải…</p>}
      {!isLoading && items.length === 0 && !editing && (
        <p className="mt-6 text-muted-foreground">Chưa có sản phẩm/dịch vụ nào. Nhấn “+ Thêm dịch vụ” để bắt đầu.</p>
      )}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p:any, idx:number) => (
          <div key={p.id} className="bg-card border border-border/40 rounded-lg overflow-hidden">
            {p.image_url && <img src={p.image_url} alt="" className="w-full aspect-[4/3] object-cover" />}
            <div className="p-4">
              <p className="font-display text-lg">{p.title}</p>
              {p.price_text && <p className="text-sm text-primary">{p.price_text}</p>}
              <p className="text-xs text-muted-foreground mt-1">{p.is_active ? "Đang hiển thị" : "Ẩn"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={()=>setEditing(p)} className="text-sm text-primary underline">Sửa</button>
                <button onClick={()=>{ if(confirm("Xoá?")) dm.mutate(p.id); }} className="text-sm text-destructive underline">Xoá</button>
                <button disabled={idx===0} onClick={()=>move(idx,-1)} className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30">↑</button>
                <button disabled={idx===items.length-1} onClick={()=>move(idx,1)} className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30">↓</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductEditor({ item, userId, onCancel, onSave, busy }: { item:any; userId:string; onCancel:()=>void; onSave:(v:any)=>void; busy:boolean }) {
  const [f, setF] = useState<any>(item);
  const [uploading, setUploading] = useState(false);
  useEffect(()=>setF(item),[item]);
  async function onUpload(file:File) {
    if (!userId) return;
    if (!/^image\/(jpeg|png|webp|jpg)$/i.test(file.type)) { toast.error("Chỉ chấp nhận JPG, PNG hoặc WebP"); return; }
    if (file.size > MAX_IMG_MB * 1024 * 1024) { toast.error(`Ảnh vượt quá ${MAX_IMG_MB}MB`); return; }
    setUploading(true);
    try { const url = await uploadImage(file, userId, "product"); setF((p:any)=>({ ...p, image_url:url })); }
    catch(e:any){ toast.error(e.message); } finally { setUploading(false); }
  }
  return (
    <div className="mt-4 bg-card border border-border rounded-lg p-5 space-y-3">
      <input value={f.title ?? ""} onChange={e=>setF({...f,title:e.target.value})} placeholder="Tên dịch vụ *" className="w-full px-3 py-2 border border-input bg-background rounded" />
      <textarea value={f.description ?? ""} onChange={e=>setF({...f,description:e.target.value})} rows={3} placeholder="Mô tả" className="w-full px-3 py-2 border border-input bg-background rounded" />
      <input value={f.price_text ?? ""} onChange={e=>setF({...f,price_text:e.target.value})} placeholder="Khoảng giá (vd: từ 20 triệu)" className="w-full px-3 py-2 border border-input bg-background rounded" />
      <div className="flex items-center gap-3">
        {f.image_url ? (
          <div className="relative">
            <img src={f.image_url} alt="" className="w-24 h-24 object-cover rounded border border-border" />
            <button type="button" onClick={()=>setF({...f,image_url:""})} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full">×</button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded border border-dashed border-border bg-secondary/40 flex items-center justify-center text-xs text-muted-foreground">Preview</div>
        )}
        <div className="flex-1">
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>{const x=e.target.files?.[0]; if(x) onUpload(x);}} className="text-sm w-full" />
          <p className="text-xs text-muted-foreground mt-1">{uploading ? "Đang tải lên…" : `Tối đa ${MAX_IMG_MB}MB. JPG/PNG/WebP.`}</p>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active ?? true} onChange={e=>setF({...f,is_active:e.target.checked})} /> Hiển thị công khai</label>
      <div className="flex gap-2">
        <button onClick={()=>{ if(!f.title?.trim()) { toast.error("Vui lòng nhập tên dịch vụ"); return; } onSave(f); }} disabled={busy || uploading} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50">{busy?"Đang lưu…":"Lưu"}</button>
        <button onClick={onCancel} className="px-4 py-2 border rounded text-sm">Huỷ</button>
      </div>
    </div>
  );
}
