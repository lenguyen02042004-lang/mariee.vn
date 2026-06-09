import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyTestimonials, upsertMyTestimonial, deleteMyTestimonial } from "@/lib/vendor-owner.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor/testimonials")({
  component: TestiPage,
  head: () => ({ meta: [{ title: "Đánh giá — Vendor" }] }),
});

function TestiPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listMyTestimonials);
  const save = useServerFn(upsertMyTestimonial);
  const del = useServerFn(deleteMyTestimonial);
  const { data, isLoading } = useQuery({ queryKey:["my-testi"], queryFn:()=>fetchAll() });
  const [editing, setEditing] = useState<any>(null);

  const m = useMutation({
    mutationFn:(v:any)=>save({data:v}),
    onSuccess:()=>{ toast.success("Đã lưu"); setEditing(null); qc.invalidateQueries({queryKey:["my-testi"]}); },
    onError:(e:any)=>toast.error(e.message),
  });
  const dm = useMutation({
    mutationFn:(id:string)=>del({data:{id}}),
    onSuccess:()=>{ toast.success("Đã xoá"); qc.invalidateQueries({queryKey:["my-testi"]}); },
    onError:(e:any)=>toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-script text-3xl text-primary">testimonials</p>
          <h1 className="font-display text-4xl">Đánh giá khách hàng</h1>
        </div>
        <Link to="/vendor" className="text-sm text-primary underline">← Về hồ sơ</Link>
      </div>

      <button onClick={()=>setEditing({ author_name:"", message:"", rating:5, is_approved:true })} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">+ Thêm đánh giá</button>

      {editing && (
        <div className="mt-4 bg-card border border-border rounded-lg p-5 space-y-3">
          <input value={editing.author_name} onChange={e=>setEditing({...editing,author_name:e.target.value})} placeholder="Tên khách hàng *" className="w-full px-3 py-2 border border-input bg-background rounded" />
          <textarea value={editing.message} onChange={e=>setEditing({...editing,message:e.target.value})} rows={4} placeholder="Nội dung *" className="w-full px-3 py-2 border border-input bg-background rounded" />
          <label className="text-sm">Đánh giá:
            <select value={editing.rating ?? 5} onChange={e=>setEditing({...editing,rating:Number(e.target.value)})} className="ml-2 px-2 py-1 border rounded">
              {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} sao</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_approved ?? true} onChange={e=>setEditing({...editing,is_approved:e.target.checked})} /> Hiển thị công khai</label>
          <div className="flex gap-2">
            <button onClick={()=>m.mutate(editing)} disabled={m.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">{m.isPending?"Đang lưu…":"Lưu"}</button>
            <button onClick={()=>setEditing(null)} className="px-4 py-2 border rounded text-sm">Huỷ</button>
          </div>
        </div>
      )}

      {isLoading && <p className="mt-6 text-muted-foreground">Đang tải…</p>}
      <div className="mt-6 space-y-3">
        {data?.map((t:any)=>(
          <div key={t.id} className="bg-card border border-border/40 rounded-lg p-5">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{t.author_name}</p>
                {t.rating && <p className="text-gold text-sm">{"★".repeat(t.rating)}</p>}
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={()=>setEditing(t)} className="text-primary underline">Sửa</button>
                <button onClick={()=>{ if(confirm("Xoá?")) dm.mutate(t.id); }} className="text-destructive underline">Xoá</button>
              </div>
            </div>
            <p className="mt-2 text-sm italic whitespace-pre-line">"{t.message}"</p>
            <p className="text-xs text-muted-foreground mt-1">{t.is_approved ? "✓ Hiển thị" : "Ẩn"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
