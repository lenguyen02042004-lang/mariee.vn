import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myCouples, getMyCouple, createMyCouple } from "@/lib/couple-owner.functions";
import { CoupleForm } from "@/components/CoupleForm";
import { WeddingShareCard } from "@/components/WeddingShareCard";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/couple")({
  component: CouplePortal,
  head: () => ({ meta: [{ title: "Trang của tôi — Mariée" }] }),
});

function slugify(input: string): string {
  return input
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function buildSlug(bride: string, groom: string, date: string): string {
  const names = [bride, groom].filter(Boolean).map(slugify).filter(Boolean).join("-");
  if (!names) return "";
  if (!date) return names;
  const d = new Date(date);
  if (isNaN(d.getTime())) return names;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${names}-${dd}${mm}${d.getFullYear()}`;
}

function CouplePortal() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(myCouples);
  const get = useServerFn(getMyCouple);
  const create = useServerFn(createMyCouple);
  const { data: mine, isLoading } = useQuery({ queryKey: ["my-couples"], queryFn: () => list() });
  const id = mine?.[0]?.id;
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ["my-couple", id], enabled: !!id, queryFn: () => get({ data: { id: id! } }),
  });
  const [form, setForm] = useState({ slug: "", bride_name: "", groom_name: "", wedding_date: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const updateName = (patch: Partial<typeof form>) => {
    const next = { ...form, ...patch };
    if (!slugTouched) next.slug = buildSlug(next.bride_name, next.groom_name, next.wedding_date);
    setForm(next);
  };
  const mCreate = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => { toast.success("Đã tạo trang cưới, hãy hoàn thiện nội dung."); qc.invalidateQueries({ queryKey: ["my-couples"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-center py-20 text-muted-foreground">Đang tải…</p>;

  if (!mine || mine.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center">
        <p className="font-script text-3xl text-primary">couple portal</p>
        <h1 className="font-display text-4xl mt-2">Tạo trang cưới của bạn</h1>
        <p className="text-muted-foreground mt-3">
          Tài khoản: {user?.email}. Điền thông tin cơ bản dưới đây — bạn có thể chỉnh sửa, tải ảnh và xuất bản ở bước sau.
        </p>
        </div>
        <form onSubmit={e=>{e.preventDefault(); mCreate.mutate();}} className="mt-10 space-y-3 bg-card border border-border/60 rounded-lg p-6 shadow-soft">
          <label className="text-sm block"><span className="text-muted-foreground">Tên cô dâu *</span>
            <input required value={form.bride_name} onChange={e=>updateName({bride_name:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
          </label>
          <label className="text-sm block"><span className="text-muted-foreground">Tên chú rể *</span>
            <input required value={form.groom_name} onChange={e=>updateName({groom_name:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
          </label>
          <label className="text-sm block"><span className="text-muted-foreground">Ngày cưới (có thể bỏ trống)</span>
            <input type="date" value={form.wedding_date} onChange={e=>updateName({wedding_date:e.target.value})} className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
          </label>
          <label className="text-sm block">
            <span className="text-muted-foreground">Đường dẫn (tự tạo từ tên &amp; ngày cưới, có thể sửa)</span>
            <input required pattern="[a-z0-9-]+" value={form.slug}
              onChange={e=>{ setSlugTouched(true); setForm({...form, slug: e.target.value.toLowerCase()}); }}
              className="mt-1 w-full px-3 py-2 rounded border border-input bg-background font-mono text-xs" />
            <span className="text-xs text-muted-foreground">Trang của bạn sẽ ở: /couples/{form.slug || "your-slug"}</span>
          </label>
          <button disabled={mCreate.isPending} className="w-full py-3 bg-primary text-primary-foreground rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">
            {mCreate.isPending ? "Đang tạo…" : "Tạo trang cưới"}
          </button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-6">
          Bạn là nhà cung cấp dịch vụ? <Link to="/vendor" className="text-primary underline">Sang Vendor Portal</Link> · <button onClick={signOut} className="text-primary underline">Đăng xuất</button>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-script text-3xl text-primary">couple portal</p>
          <h1 className="font-display text-3xl md:text-4xl">Trang cưới của bạn</h1>
          <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {detail?.couple?.slug && (
            <Link to="/couples/$slug" params={{ slug: detail.couple.slug }} className="px-3 py-1.5 rounded bg-secondary/60 hover:bg-secondary">Xem trang công khai</Link>
          )}
          <Link to="/couple/rsvp" className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90">Hộp thư RSVP</Link>
          <button onClick={signOut} className="text-primary underline">Đăng xuất</button>
        </div>
      </div>

      {loadingDetail || !detail?.couple ? (
        <p className="mt-10 text-muted-foreground">Đang tải dữ liệu…</p>
      ) : (
        <div className="mt-8">
          {detail.couple.slug && (
            <div className="mb-10">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-2xl">Thiệp cưới online &amp; mã QR</h2>
                <span className="text-xs text-muted-foreground">Chia sẻ cho khách mời</span>
              </div>
              <WeddingShareCard couple={detail.couple as any} />
            </div>
          )}
          <CoupleForm mode="owner" initial={detail.couple} gallery={detail.gallery} />
        </div>
      )}
    </div>
  );
}
