import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminUpsertCouple, adminAddGallery, adminDeleteGallery } from "@/lib/admin.functions";
import { updateMyCouple, addMyGallery, deleteMyGallery } from "@/lib/couple-owner.functions";
import { uploadImage, validateImage } from "@/lib/upload";
import { ImagePicker, ImageUploadButton } from "@/components/ImagePicker";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const MAX_MB = 10;
const MAX_GALLERY = 30;

const fields: { k: string; label: string; type?: string; full?: boolean; ph?: string }[] = [
  { k: "bride_name", label: "Tên cô dâu" },
  { k: "groom_name", label: "Tên chú rể" },
  { k: "slug", label: "Slug (đường dẫn)" },
  { k: "wedding_date", label: "Ngày cưới", type: "date" },
  { k: "ceremony_time", label: "Giờ lễ thành hôn", ph: "VD: 09:00 — 11:00" },
  { k: "reception_time", label: "Giờ tiệc chiêu đãi (chung)", ph: "VD: 18:00" },
  { k: "venue_name", label: "Tên địa điểm chính", full: true },
  { k: "venue_address", label: "Địa chỉ chính", full: true },
  { k: "quote", label: "Câu trích dẫn", full: true },
  { k: "youtube_url", label: "Link YouTube nhúng", full: true, ph: "https://www.youtube.com/embed/..." },
  { k: "story", label: "Câu chuyện chúng mình", full: true },
];

const imageFields = [
  { k: "cover_image", label: "Ảnh bìa (OG/SEO)" },
  { k: "hero_image_1", label: "Hero 1" },
  { k: "hero_image_2", label: "Hero 2" },
  { k: "hero_image_3", label: "Hero 3" },
];

type Mode = "admin" | "owner";

export function CoupleForm({ initial, gallery = [], mode = "admin" }: { initial: any; gallery?: any[]; mode?: Mode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<any>({
    is_published: true,
    ...initial,
    schedule: Array.isArray(initial?.schedule) ? initial.schedule : [],
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const adminUpsert = useServerFn(adminUpsertCouple);
  const ownerUpsert = useServerFn(updateMyCouple);
  const adminAddG = useServerFn(adminAddGallery);
  const ownerAddG = useServerFn(addMyGallery);
  const adminDelG = useServerFn(adminDeleteGallery);
  const ownerDelG = useServerFn(deleteMyGallery);

  const upsert = mode === "owner" ? ownerUpsert : adminUpsert;
  const addG = mode === "owner" ? ownerAddG : adminAddG;
  const delG = mode === "owner" ? ownerDelG : adminDelG;

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form };
      if (mode === "owner") {
        // owner update doesn't touch slug/owner_id
        delete payload.slug; delete payload.owner_id;
      }
      return upsert({ data: payload } as any);
    },
    onSuccess: (r: any) => {
      toast.success("Đã lưu");
      qc.invalidateQueries({ queryKey: ["a-couples"] });
      qc.invalidateQueries({ queryKey: ["my-couples"] });
      qc.invalidateQueries({ queryKey: ["my-couple", form.id] });
      if (mode === "admin" && !form.id && r?.id) {
        navigate({ to: "/admin/couples/$id", params: { id: r.id } });
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  void uploading;

  const onAddGallery = async (files: FileList) => {
    if (!form.id || !user) { toast.error("Lưu trang trước khi tải ảnh"); return; }
    const remaining = MAX_GALLERY - gallery.length;
    if (remaining <= 0) { toast.error(`Đã đạt giới hạn ${MAX_GALLERY} ảnh`); return; }
    setUploading("gallery");
    try {
      let added = 0;
      for (const file of Array.from(files).slice(0, remaining)) {
        const v = validateImage(file, { maxMB: MAX_MB });
        if (v) { toast.error(v); continue; }
        const url = await uploadImage(file, user.id, "gallery");
        await addG({ data: { couple_id: form.id, image_url: url, caption: "" } } as any);
        added++;
      }
      if (added > 0) toast.success(`Đã thêm ${added} ảnh`);
      qc.invalidateQueries({ queryKey: ["a-couple-detail", form.id] });
      qc.invalidateQueries({ queryKey: ["my-couple", form.id] });
    } catch (e: any) { toast.error(e.message); } finally { setUploading(null); }
  };

  const visibleFields = mode === "owner" ? fields.filter(f => f.k !== "slug") : fields;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-10">
      <section>
        <h3 className="font-display text-xl mb-3">Thông tin cơ bản</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {visibleFields.map(f => (
            <label key={f.k} className={`text-sm ${f.full ? "sm:col-span-2" : ""}`}>
              <span className="text-muted-foreground">{f.label}</span>
              {f.k === "story" || f.k === "quote" ? (
                <textarea rows={f.k === "story" ? 6 : 2} value={form[f.k] ?? ""} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
              ) : (
                <input type={f.type ?? "text"} placeholder={f.ph}
                  required={["bride_name", "groom_name", "slug"].includes(f.k)}
                  value={form[f.k] ?? ""} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
              )}
            </label>
          ))}
          <label className="text-sm sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={!!form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} />
            Xuất bản công khai
          </label>
          {mode === "admin" && (
            <label className="text-sm sm:col-span-2">
              <span className="text-muted-foreground">Chủ trang (user ID — dán UUID của tài khoản cặp đôi để họ tự đăng nhập sửa)</span>
              <input value={form.owner_id ?? ""} onChange={e => setForm({ ...form, owner_id: e.target.value || null })} placeholder="UUID người dùng" className="mt-1 w-full px-3 py-2 rounded border border-input bg-background font-mono text-xs" />
            </label>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl mb-1">Hình ảnh chính</h3>
        <p className="text-xs text-muted-foreground mb-3">Mỗi ảnh tối đa <strong>{MAX_MB}MB</strong>, định dạng JPG/PNG/WEBP.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {imageFields.map(f => (
            <div key={f.k} className="border border-border/60 rounded-md p-3 bg-card">
              <ImagePicker
                label={f.label}
                value={form[f.k] ?? ""}
                onChange={(url) => setForm({ ...form, [f.k]: url })}
                folder="couples"
                maxMB={MAX_MB}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl mb-1">Thiệp cưới hai bên gia đình</h3>
        <p className="text-xs text-muted-foreground mb-3">Tải lên ảnh thiệp (JPG/PNG, tối đa 15MB) để hai bên gia đình có thể xem &amp; tải về.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { k: "invitation_bride_url", label: "Thiệp nhà cô dâu" },
            { k: "invitation_groom_url", label: "Thiệp nhà chú rể" },
          ].map(f => (
            <div key={f.k} className="border border-border/60 rounded-md p-3 bg-card">
              <ImagePicker
                label={f.label}
                value={form[f.k] ?? ""}
                onChange={(url) => setForm({ ...form, [f.k]: url })}
                folder="invitations"
                maxMB={15}
                aspect="aspect-[3/4]"
              />
            </div>
          ))}
        </div>
      </section>

      {form.id && (
        <section>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-display text-xl">Thư viện ảnh cưới</h3>
            <span className="text-xs text-muted-foreground">{gallery.length}/{MAX_GALLERY}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Tải lên tối đa <strong>{MAX_GALLERY} ảnh</strong>, mỗi ảnh ≤ <strong>{MAX_MB}MB</strong>. Có thể chọn nhiều ảnh cùng lúc.
          </p>
          <ImageUploadButton
            disabled={uploading === "gallery" || gallery.length >= MAX_GALLERY}
            buttonLabel="+ Thêm ảnh vào thư viện"
            maxMB={MAX_MB}
            helper={`Còn lại ${Math.max(0, MAX_GALLERY - gallery.length)} chỗ`}
            onUpload={async (file) => {
              const fl = { 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) } as unknown as FileList;
              await onAddGallery(fl);
            }}
          />
          <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
            {gallery.map((g: any) => (
              <div key={g.id} className="relative group aspect-square rounded overflow-hidden border border-border/60">
                <img src={g.image_url} className="w-full h-full object-cover" />
                <button type="button" onClick={async () => {
                  await delG({ data: { id: g.id } } as any);
                  qc.invalidateQueries({ queryKey: ["a-couple-detail", form.id] });
                  qc.invalidateQueries({ queryKey: ["my-couple", form.id] });
                }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">Xoá</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-display text-xl mb-3">Tiệc cưới hai bên</h3>
        <p className="text-xs text-muted-foreground mb-3">Điền riêng tiệc nhà cô dâu và nhà chú rể. Có thể để trống nếu không tổ chức riêng.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-secondary/40 p-4 rounded space-y-2">
            <p className="font-script text-2xl text-primary">Tiệc nhà cô dâu</p>
            <input value={form.bride_party_time ?? ""} onChange={e => setForm({ ...form, bride_party_time: e.target.value })} placeholder="Thời gian (VD: 11:00, 12/10/2026)" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.bride_party_venue ?? ""} onChange={e => setForm({ ...form, bride_party_venue: e.target.value })} placeholder="Tên nhà hàng / địa điểm" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.bride_party_address ?? ""} onChange={e => setForm({ ...form, bride_party_address: e.target.value })} placeholder="Địa chỉ" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
          </div>
          <div className="bg-secondary/40 p-4 rounded space-y-2">
            <p className="font-script text-2xl text-primary">Tiệc nhà chú rể</p>
            <input value={form.groom_party_time ?? ""} onChange={e => setForm({ ...form, groom_party_time: e.target.value })} placeholder="Thời gian" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.groom_party_venue ?? ""} onChange={e => setForm({ ...form, groom_party_venue: e.target.value })} placeholder="Tên nhà hàng / địa điểm" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.groom_party_address ?? ""} onChange={e => setForm({ ...form, groom_party_address: e.target.value })} placeholder="Địa chỉ" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl mb-3">Thông tin mừng cưới</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2 bg-secondary/40 p-4 rounded">
            <p className="font-script text-2xl text-primary">Cô dâu</p>
            <input value={form.gift_bride_holder ?? ""} onChange={e => setForm({ ...form, gift_bride_holder: e.target.value })} placeholder="Chủ tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_bride_bank ?? ""} onChange={e => setForm({ ...form, gift_bride_bank: e.target.value })} placeholder="Ngân hàng" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_bride_account ?? ""} onChange={e => setForm({ ...form, gift_bride_account: e.target.value })} placeholder="Số tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
          </div>
          <div className="space-y-2 bg-secondary/40 p-4 rounded">
            <p className="font-script text-2xl text-primary">Chú rể</p>
            <input value={form.gift_groom_holder ?? ""} onChange={e => setForm({ ...form, gift_groom_holder: e.target.value })} placeholder="Chủ tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_groom_bank ?? ""} onChange={e => setForm({ ...form, gift_groom_bank: e.target.value })} placeholder="Ngân hàng" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <input value={form.gift_groom_account ?? ""} onChange={e => setForm({ ...form, gift_groom_account: e.target.value })} placeholder="Số tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl mb-1">Chương trình lễ cưới</h3>
        <p className="text-xs text-muted-foreground mb-3">Thêm bao nhiêu mục tuỳ ý (tối đa 40). Có thể sắp xếp theo thứ tự thời gian.</p>
        <div className="space-y-2">
          {(form.schedule ?? []).map((s: any, i: number) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={s.time ?? ""} onChange={e => { const n = [...form.schedule]; n[i] = { ...n[i], time: e.target.value }; setForm({ ...form, schedule: n }); }} placeholder="Giờ" className="col-span-2 px-3 py-2 rounded border border-input bg-background text-sm" />
              <input value={s.title ?? ""} onChange={e => { const n = [...form.schedule]; n[i] = { ...n[i], title: e.target.value }; setForm({ ...form, schedule: n }); }} placeholder="Tiêu đề *" className="col-span-4 px-3 py-2 rounded border border-input bg-background text-sm" />
              <input value={s.description ?? ""} onChange={e => { const n = [...form.schedule]; n[i] = { ...n[i], description: e.target.value }; setForm({ ...form, schedule: n }); }} placeholder="Mô tả" className="col-span-5 px-3 py-2 rounded border border-input bg-background text-sm" />
              <button type="button" onClick={() => setForm({ ...form, schedule: form.schedule.filter((_: any, j: number) => j !== i) })} className="col-span-1 text-destructive text-sm">×</button>
            </div>
          ))}
          <button type="button" onClick={() => setForm({ ...form, schedule: [...(form.schedule ?? []), { time: "", title: "", description: "" }] })} className="text-sm text-primary underline">+ Thêm mục</button>
        </div>
      </section>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-6 px-6 border-t border-border/40 flex gap-3">
        <button disabled={save.isPending} className="px-6 py-3 bg-primary text-primary-foreground rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">
          {save.isPending ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
        {form.slug && (
          <a href={`/couples/${form.slug}`} target="_blank" rel="noopener" className="px-6 py-3 border border-input rounded uppercase tracking-[0.2em] text-sm">
            Xem trang
          </a>
        )}
      </div>
    </form>
  );
}
