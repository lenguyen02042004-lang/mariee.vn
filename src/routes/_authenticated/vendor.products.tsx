import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyProducts, upsertMyProduct, deleteMyProduct } from "@/lib/vendor-owner.functions";
import { ImagePicker } from "@/components/ImagePicker";
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
  useEffect(()=>setF(item),[item]);
  void userId;
  return (
    <div className="mt-4 bg-card border border-border rounded-lg p-5 space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Tên dịch vụ *</label>
        <input value={f.title ?? ""} onChange={e=>setF({...f,title:e.target.value})} placeholder="VD: Gói chụp ảnh trọn gói" className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Mô tả</label>
        <textarea value={f.description ?? ""} onChange={e=>setF({...f,description:e.target.value})} rows={3} placeholder="Mô tả chi tiết dịch vụ, bao gồm gì…" className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Khoảng giá</label>
        <input value={f.price_text ?? ""} onChange={e=>setF({...f,price_text:e.target.value})} placeholder="VD: từ 20.000.000đ" className="mt-1 w-full px-3 py-2 border border-input bg-background rounded" />
      </div>
      <ImagePicker
        label="Ảnh dịch vụ"
        value={f.image_url ?? ""}
        onChange={(url)=>setF((p:any)=>({ ...p, image_url: url }))}
        folder="product"
        maxMB={MAX_IMG_MB}
        aspect="aspect-[4/3]"
      />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={f.is_active ?? true} onChange={e=>setF({...f,is_active:e.target.checked})} />
        Hiển thị công khai trên trang vendor
      </label>
      <div className="flex gap-2 pt-2 border-t border-border/40">
        <button onClick={()=>{ if(!f.title?.trim()) { toast.error("Vui lòng nhập tên dịch vụ"); return; } onSave(f); }} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium disabled:opacity-50 hover:bg-primary/90">{busy?"Đang lưu…":"💾 Lưu"}</button>
        <button onClick={onCancel} className="px-4 py-2 border border-input bg-background hover:bg-secondary rounded text-sm">Huỷ</button>
      </div>
    </div>
  );
}
