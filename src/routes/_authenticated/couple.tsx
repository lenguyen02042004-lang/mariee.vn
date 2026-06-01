import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  myCouples,
  getMyCouple,
  createMyCouple,
  toggleMyCouplePublish,
  listMyWishes,
  toggleMyWish,
  deleteMyWish,
} from "@/lib/couple-owner.functions";
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
          <PublishCard coupleId={detail.couple.id} isPublished={!!(detail.couple as any).is_published} />
          {detail.couple.slug && (
            <div className="mb-10">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-2xl">Thiệp cưới online &amp; mã QR</h2>
                <span className="text-xs text-muted-foreground">Chia sẻ cho khách mời</span>
              </div>
              <WeddingShareCard couple={detail.couple as any} />
            </div>
          )}
          <WishesPanel coupleId={detail.couple.id} />
          <CoupleForm mode="owner" initial={detail.couple} gallery={detail.gallery} />
        </div>
      )}
    </div>
  );
}

function PublishCard({ coupleId, isPublished }: { coupleId: string; isPublished: boolean }) {
  void coupleId;
  return (
    <div className={`mb-8 rounded-lg border p-5 flex items-center justify-between gap-4 ${isPublished ? "border-primary/40 bg-primary/5" : "border-amber-300/60 bg-amber-50/60"}`}>
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded ${isPublished ? "bg-primary text-primary-foreground" : "bg-amber-200 text-amber-900"}`}>
            {isPublished ? "Đang công khai" : "Bản nháp"}
          </span>
          <h2 className="font-display text-xl">Trạng thái hiển thị</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isPublished
            ? "Trang đang hiển thị công khai. Khách có thể truy cập, gửi RSVP và lời chúc. Cuộn xuống cuối form và nhấn “Lưu & chuyển về nháp” nếu muốn tạm ẩn."
            : "Trang đang ở chế độ nháp — chỉ bạn xem được. Cuộn xuống cuối form và nhấn “Lưu & xuất bản” khi sẵn sàng — dữ liệu đang nhập sẽ được lưu cùng lúc."}
        </p>
      </div>
    </div>
  );
}

function WishesPanel({ coupleId }: { coupleId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyWishes);
  const toggleFn = useServerFn(toggleMyWish);
  const delFn = useServerFn(deleteMyWish);
  const { data: wishes = [], isLoading } = useQuery({
    queryKey: ["my-wishes", coupleId],
    queryFn: () => listFn({ data: { couple_id: coupleId } }),
  });
  const onToggle = useMutation({
    mutationFn: (v: { id: string; is_approved: boolean }) => toggleFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-wishes", coupleId] }),
    onError: (e: any) => toast.error(e.message),
  });
  const onDelete = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Đã xoá"); qc.invalidateQueries({ queryKey: ["my-wishes", coupleId] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const pending = (wishes as any[]).filter(w => !w.is_approved).length;
  return (
    <section className="mb-10 border border-border/60 rounded-lg p-5 bg-card">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-2xl">Sổ lưu bút & lời chúc</h2>
          <p className="text-sm text-muted-foreground">Duyệt hoặc ẩn các lời chúc trên trang công khai.</p>
        </div>
        {pending > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">{pending} chưa duyệt</span>
        )}
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground mt-4">Đang tải…</p>
      ) : wishes.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">Chưa có lời chúc nào.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/40">
          {(wishes as any[]).map(w => (
            <li key={w.id} className="py-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{w.guest_name}
                  <span className="ml-2 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString("vi-VN")}</span>
                  {!w.is_approved && <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Đang ẩn</span>}
                </div>
                <p className="text-sm text-foreground/85 mt-1 whitespace-pre-wrap">{w.message}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => onToggle.mutate({ id: w.id, is_approved: !w.is_approved })}
                  className={`text-xs px-3 py-1 rounded ${w.is_approved ? "border border-input hover:bg-secondary" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                >
                  {w.is_approved ? "Ẩn" : "Duyệt"}
                </button>
                <button
                  onClick={() => confirm("Xoá lời chúc này?") && onDelete.mutate(w.id)}
                  className="text-xs px-3 py-1 rounded text-destructive hover:bg-destructive/10"
                >
                  Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
