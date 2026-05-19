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

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-script text-3xl text-primary">services</p>
          <h1 className="font-display text-4xl">Sản phẩm & Dịch vụ</h1>
        </div>
        <Link to="/vendor" className="text-sm text-primary underline">← Về hồ sơ</Link>
      </div>

      <button onClick={()=>setEditing({ title:"", is_active:true })} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">+ Thêm dịch vụ</button>

      {editing && <ProductEditor item={editing} userId={user?.id ?? ""} onCancel={()=>setEditing(null)} onSave={(v)=>m.mutate(v)} busy={m.isPending} />}

      {isLoading && <p className="mt-6 text-muted-foreground">Đang tải…</p>}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((p:any) => (
          <div key={p.id} className="bg-card border border-border/40 rounded-lg overflow-hidden">
            {p.image_url && <img src={p.image_url} alt="" className="w-full aspect-[4/3] object-cover" />}
            <div className="p-4">
              <p className="font-display text-lg">{p.title}</p>
              {p.price_text && <p className="text-sm text-primary">{p.price_text}</p>}
              <p className="text-xs text-muted-foreground mt-1">{p.is_active ? "Đang hiển thị" : "Ẩn"}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>setEditing(p)} className="text-sm text-primary underline">Sửa</button>
                <button onClick={()=>{ if(confirm("Xoá?")) dm.mutate(p.id); }} className="text-sm text-destructive underline">Xoá</button>
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
        {f.image_url && <img src={f.image_url} className="w-20 h-20 object-cover rounded" />}
        <input type="file" accept="image/*" disabled={uploading} onChange={e=>{const x=e.target.files?.[0]; if(x) onUpload(x);}} className="text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active ?? true} onChange={e=>setF({...f,is_active:e.target.checked})} /> Hiển thị công khai</label>
      <div className="flex gap-2">
        <button onClick={()=>onSave(f)} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">{busy?"Đang lưu…":"Lưu"}</button>
        <button onClick={onCancel} className="px-4 py-2 border rounded text-sm">Huỷ</button>
      </div>
    </div>
  );
}
