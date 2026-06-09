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
const QK = ["my-products"] as const;

function ProductsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchAll = useServerFn(listMyProducts);
  const save = useServerFn(upsertMyProduct);
  const del = useServerFn(deleteMyProduct);
  const { data, isLoading } = useQuery({ queryKey: QK, queryFn: () => fetchAll() });
  const [editing, setEditing] = useState<any>(null);
  const [reordering, setReordering] = useState(false);

  // Save (create or update) with optimistic UI
  const m = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onMutate: async (v: any) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<any[]>(QK) ?? [];
      if (v.id) {
        qc.setQueryData<any[]>(QK, prev.map((p) => (p.id === v.id ? { ...p, ...v } : p)));
      } else {
        const tempId = `temp-${crypto.randomUUID()}`;
        qc.setQueryData<any[]>(QK, [...prev, { ...v, id: tempId, _optimistic: true }]);
      }
      return { prev };
    },
    onError: (e: any, _v, ctx) => { if (ctx?.prev) qc.setQueryData(QK, ctx.prev); toast.error(e.message); },
    onSuccess: () => { toast.success("Đã lưu"); setEditing(null); },
    onSettled: () => { qc.invalidateQueries({ queryKey: QK }); },
  });

  // Delete with optimistic UI
  const dm = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<any[]>(QK) ?? [];
      qc.setQueryData<any[]>(QK, prev.filter((p) => p.id !== id));
      return { prev };
    },
    onError: (e: any, _v, ctx) => { if (ctx?.prev) qc.setQueryData(QK, ctx.prev); toast.error(e.message); },
    onSuccess: () => toast.success("Đã xoá"),
    onSettled: () => { qc.invalidateQueries({ queryKey: QK }); },
  });

  const items = (data ?? []) as any[];

  async function move(idx: number, dir: -1 | 1) {
    if (reordering) return;
    const next = items[idx + dir];
    const cur = items[idx];
    if (!next || !cur) return;
    const aOrder = cur.sort_order ?? idx;
    const bOrder = next.sort_order ?? (idx + dir);
    setReordering(true);
    // Optimistic swap
    await qc.cancelQueries({ queryKey: QK });
    const prev = qc.getQueryData<any[]>(QK) ?? [];
    const swapped = [...prev];
    swapped[idx] = { ...next, sort_order: aOrder };
    swapped[idx + dir] = { ...cur, sort_order: bOrder };
    swapped.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    qc.setQueryData(QK, swapped);
    try {
      const payload = (p: any, order: number) => ({
        id: p.id, title: p.title, description: p.description ?? "",
        price_text: p.price_text ?? "", image_url: p.image_url ?? "",
        is_active: p.is_active ?? true, sort_order: order,
      });
      await save({ data: payload(cur, bOrder) });
      await save({ data: payload(next, aOrder) });
    } catch (e: any) {
      qc.setQueryData(QK, prev);
      toast.error(e?.message || "Sắp xếp thất bại");
    } finally {
      setReordering(false);
      qc.invalidateQueries({ queryKey: QK });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-script text-3xl text-primary">services</p>
          <h1 className="font-display text-4xl">Sản phẩm & Dịch vụ</h1>
          <p className="text-sm text-muted-foreground mt-1">Tối đa {MAX_IMG_MB}MB / ảnh. Định dạng JPG, PNG hoặc WebP.</p>
        </div>
        <Link to="/vendor" className="text-sm text-primary underline">← Về hồ sơ</Link>
      </div>

      <button
        onClick={() => setEditing({ title: "", description: "", price_text: "", image_url: "", is_active: true, sort_order: items.length })}
        disabled={!!editing}
        className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50 hover:bg-primary/90"
      >+ Thêm dịch vụ</button>

      {editing && <ProductEditor item={editing} userId={user?.id ?? ""} onCancel={()=>setEditing(null)} onSave={(v)=>m.mutate(v)} busy={m.isPending} />}

      {isLoading && <p className="mt-6 text-muted-foreground">Đang tải…</p>}
      {!isLoading && items.length === 0 && !editing && (
        <p className="mt-6 text-muted-foreground">Chưa có sản phẩm/dịch vụ nào. Nhấn “+ Thêm dịch vụ” để bắt đầu.</p>
      )}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p:any, idx:number) => (
          <div key={p.id} className={`bg-card border border-border/40 rounded-lg overflow-hidden ${p._optimistic ? "opacity-60" : ""}`}>
            {p.image_url && <img src={p.image_url} alt="" className="w-full aspect-[4/3] object-cover" />}
            <div className="p-4">
              <p className="font-display text-lg">{p.title}</p>
              {p.price_text && <p className="text-sm text-primary">{p.price_text}</p>}
              <p className="text-xs text-muted-foreground mt-1">{p.is_active ? "Đang hiển thị" : "Ẩn"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button disabled={p._optimistic} onClick={()=>setEditing(p)} className="text-sm text-primary underline disabled:opacity-40">Sửa</button>
                <button disabled={p._optimistic} onClick={()=>{ if(confirm("Xoá dịch vụ này?")) dm.mutate(p.id); }} className="text-sm text-destructive underline disabled:opacity-40">Xoá</button>
                <button disabled={idx===0 || reordering || p._optimistic} onClick={()=>move(idx,-1)} className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30">↑</button>
                <button disabled={idx===items.length-1 || reordering || p._optimistic} onClick={()=>move(idx,1)} className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30">↓</button>
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
