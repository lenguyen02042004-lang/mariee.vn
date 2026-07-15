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
import { FormSection, SelectOrOther, FieldLabel } from "@/components/FormSection";
import { VN_BANKS } from "@/lib/form-presets";
import { WizardHeader, WizardFooter, useLocalDraft } from "@/components/FormWizard";
import { GiftBoxes } from "@/components/GiftBox";

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

export function CoupleForm({ initial, gallery = [], mode = "admin", wizard = false }: { initial: any; gallery?: any[]; mode?: Mode; wizard?: boolean }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<any>({
    is_published: true,
    ...initial,
    schedule: Array.isArray(initial?.schedule) ? initial.schedule : [],
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const stepTitles = [
    "Thông tin cơ bản",
    "Ảnh chính",
    "Thiệp hai bên",
    ...(form.id ? ["Thư viện ảnh"] : []),
    "Tiệc hai bên",
    "Mừng cưới",
    "Chương trình",
  ];
  const stepMap = {
    basic: 0,
    hero: 1,
    invite: 2,
    gallery: form.id ? 3 : -1,
    party: form.id ? 4 : 3,
    gift: form.id ? 5 : 4,
    schedule: form.id ? 6 : 5,
  };
  const show = (n: number) => !wizard || step === n;
  const draftKey = wizard ? `mariee:draft:couple:${mode}:${form.id ?? initial?.slug ?? "new"}` : "noop";
  const draft = useLocalDraft<any>({
    key: draftKey, value: form, enabled: wizard,
    onRestore: (v) => setForm(v),
  });

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
    mutationFn: (overrides?: Partial<any>) => {
      const payload = { ...form, ...(overrides ?? {}) };
      if (mode === "owner") {
        // owner update doesn't touch slug/owner_id
        delete payload.slug; delete payload.owner_id;
      }
      return upsert({ data: payload } as any);
    },
    onSuccess: (r: any, vars: any) => {
      if (vars && typeof vars.is_published === "boolean") {
        setForm((f: any) => ({ ...f, is_published: vars.is_published }));
        toast.success(vars.is_published ? "Đã lưu và công khai" : "Đã lưu và chuyển về bản nháp");
      } else {
        toast.success("Đã lưu");
      }
      qc.invalidateQueries({ queryKey: ["a-couples"] });
      qc.invalidateQueries({ queryKey: ["my-couples"] });
      qc.invalidateQueries({ queryKey: ["my-couple", form.id] });
      if (wizard) draft.clear();
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
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(undefined); }} className="space-y-10">
      {wizard && draft.RestoreBanner}
      {wizard && <WizardHeader titles={stepTitles} step={step} setStep={setStep} />}
      <FormSection
        hidden={!show(stepMap.basic)}
        title="Thông tin cơ bản"
        description="Đây là phần khách nhìn đầu tiên — tên, ngày cưới, và câu trích dẫn thường xuất hiện trên thiệp chia sẻ."
        helper={
          <>
            <p><strong>Tên</strong>: viết hoa chữ cái đầu, không viết tắt. Khách hay tìm theo họ tên đầy đủ.</p>
            {mode === "admin" && <p><strong>Slug</strong>: chỉ chữ thường + gạch ngang. VD <code className="text-primary">linh-minh-2026</code>.</p>}
            <p><strong>Ngày cưới</strong>: chọn đúng để bộ đếm ngược hoạt động và Google hiển thị schema.</p>
            <p><strong>Câu trích dẫn</strong>: 1 câu ngắn (≤ 80 ký tự), tránh dùng dấu ngoặc kép.</p>
            <p><strong>Câu chuyện</strong>: 200–600 từ, viết ở ngôi "chúng mình" để gần gũi.</p>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {visibleFields.map(f => (
            <label key={f.k} className={`text-sm ${f.full ? "sm:col-span-2" : ""}`}>
              <FieldLabel required={["bride_name", "groom_name", "slug"].includes(f.k)}>{f.label}</FieldLabel>
              {f.k === "story" || f.k === "quote" ? (
                <textarea rows={f.k === "story" ? 6 : 2} value={form[f.k] ?? ""} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
              ) : (
                <input type={f.type ?? "text"} placeholder={f.ph}
                  required={["bride_name", "groom_name", "slug"].includes(f.k)}
                  value={form[f.k] ?? ""} onChange={e => {
                    const v = f.k === "slug" ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") : e.target.value;
                    setForm({ ...form, [f.k]: v });
                  }}
                  className="mt-1 w-full px-3 py-2 rounded border border-input bg-background" />
              )}
            </label>
          ))}
          <div className="text-sm sm:col-span-2 flex items-center gap-2 text-muted-foreground">
            <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded ${form.is_published ? "bg-primary text-primary-foreground" : "bg-amber-200 text-amber-900"}`}>
              {form.is_published ? "Đang công khai" : "Bản nháp"}
            </span>
            <span>Dùng nút bên dưới để vừa lưu vừa đổi trạng thái — tránh mất dữ liệu đang nhập.</span>
          </div>
          {mode === "admin" && (
            <label className="text-sm sm:col-span-2">
              <FieldLabel>Chủ trang (UUID người dùng — dán để cặp đôi tự sửa)</FieldLabel>
              <input value={form.owner_id ?? ""} onChange={e => setForm({ ...form, owner_id: e.target.value || null })} placeholder="UUID người dùng" className="mt-1 w-full px-3 py-2 rounded border border-input bg-background font-mono text-xs" />
            </label>
          )}
        </div>
      </FormSection>

      <FormSection
        hidden={!show(stepMap.hero)}
        title="Hình ảnh chính"
        description={`Mỗi ảnh tối đa ${MAX_MB}MB, định dạng JPG/PNG/WEBP.`}
        helper={
          <>
            <p><strong>Ảnh bìa</strong> hiển thị khi chia sẻ Facebook/Zalo (1200×630px là tỉ lệ tốt nhất).</p>
            <p><strong>Hero 1–3</strong>: ngang 1920×1080, ảnh đẹp nhất nên đặt vào Hero 1 vì xuất hiện trước.</p>
            <p>Tránh ảnh chụp bằng filter quá đậm — sẽ lệch tone so với template.</p>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
      </FormSection>

      <FormSection
        hidden={!show(stepMap.invite)}
        title="Thiệp cưới hai bên gia đình"
        description="Ảnh thiệp (JPG/PNG, tối đa 15MB) để hai bên gia đình có thể xem &amp; tải về."
        helper={
          <>
            <p>Khuyến nghị tỉ lệ <strong>3:4</strong> hoặc <strong>4:5</strong> để khớp khung hiển thị.</p>
            <p>Nếu chỉ có một thiệp chung, để cùng ảnh cho cả hai ô.</p>
          </>
        }
      >
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
      </FormSection>

      {form.id && show(stepMap.gallery) && (
        <FormSection
          title={`Thư viện ảnh cưới (${gallery.length}/${MAX_GALLERY})`}
          description={`Tối đa ${MAX_GALLERY} ảnh, mỗi ảnh ≤ ${MAX_MB}MB.`}
          helper={
            <>
              <p>Đa dạng góc chụp: chân dung, toàn cảnh, chi tiết hoa cưới, khoảnh khắc bất ngờ.</p>
              <p>Xen kẽ ảnh ngang & dọc cho layout đẹp.</p>
              <p>Hover ảnh để xoá. Có thể tải lại nếu nhầm.</p>
            </>
          }
        >
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
        </FormSection>
      )}

      <FormSection
        hidden={!show(stepMap.party)}
        title="Tiệc cưới hai bên"
        description="Điền riêng tiệc nhà cô dâu và nhà chú rể. Có thể để trống nếu không tổ chức riêng."
        helper={
          <>
            <p>Ghi giờ kèm thứ/ngày cho rõ. VD: <em>11:00 Thứ Bảy 12/10/2026</em>.</p>
            <p>Địa chỉ đầy đủ tới tên đường — Google Maps sẽ tự liên kết.</p>
          </>
        }
      >
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
      </FormSection>

      <FormSection
        hidden={!show(stepMap.gift)}
        title="Thông tin mừng cưới"
        description="Khách có thể chuyển khoản mừng trực tiếp qua QR ngân hàng được tạo tự động từ thông tin này."
        helper={
          <>
            <p><strong>Chủ tài khoản</strong>: ghi <em>không dấu, viết hoa</em> đúng như trên thẻ ngân hàng — nếu sai khách sẽ chuyển nhầm.</p>
            <p><strong>Ngân hàng</strong>: chọn từ danh sách để hệ thống nhận diện và tạo QR.</p>
            <p><strong>Số tài khoản</strong>: chỉ chữ số, không dấu cách.</p>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2 bg-secondary/40 p-4 rounded">
            <p className="font-script text-2xl text-primary">Cô dâu</p>
            <input value={form.gift_bride_holder ?? ""} onChange={e => setForm({ ...form, gift_bride_holder: e.target.value })} placeholder="Chủ tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <SelectOrOther value={form.gift_bride_bank ?? ""} onChange={v => setForm({ ...form, gift_bride_bank: v })} options={VN_BANKS} placeholder="— Chọn ngân hàng —" inputPlaceholder="Tên ngân hàng khác" />
            <input value={form.gift_bride_account ?? ""} onChange={e => setForm({ ...form, gift_bride_account: e.target.value.replace(/\D/g, "") })} placeholder="Số tài khoản" inputMode="numeric" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <div className="pt-2">
              <ImagePicker
                label="Ảnh QR chuyển khoản (tuỳ chọn)"
                value={form.gift_bride_qr_url ?? ""}
                onChange={(url) => setForm({ ...form, gift_bride_qr_url: url })}
                folder="gift-qr"
                maxMB={5}
                aspect="aspect-square"
              />
            </div>
          </div>
          <div className="space-y-2 bg-secondary/40 p-4 rounded">
            <p className="font-script text-2xl text-primary">Chú rể</p>
            <input value={form.gift_groom_holder ?? ""} onChange={e => setForm({ ...form, gift_groom_holder: e.target.value })} placeholder="Chủ tài khoản" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <SelectOrOther value={form.gift_groom_bank ?? ""} onChange={v => setForm({ ...form, gift_groom_bank: v })} options={VN_BANKS} placeholder="— Chọn ngân hàng —" inputPlaceholder="Tên ngân hàng khác" />
            <input value={form.gift_groom_account ?? ""} onChange={e => setForm({ ...form, gift_groom_account: e.target.value.replace(/\D/g, "") })} placeholder="Số tài khoản" inputMode="numeric" className="w-full px-3 py-2 rounded border border-input bg-background text-sm" />
            <div className="pt-2">
              <ImagePicker
                label="Ảnh QR chuyển khoản (tuỳ chọn)"
                value={form.gift_groom_qr_url ?? ""}
                onChange={(url) => setForm({ ...form, gift_groom_qr_url: url })}
                folder="gift-qr"
                maxMB={5}
                aspect="aspect-square"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        hidden={!show(stepMap.schedule)}
        title="Chương trình lễ cưới"
        description="Thêm bao nhiêu mục tuỳ ý (tối đa 40). Sắp theo thứ tự thời gian."
        helper={
          <>
            <p><strong>Giờ</strong>: định dạng <code>HH:MM</code> (VD <code>17:30</code>).</p>
            <p><strong>Tiêu đề</strong>: ngắn gọn — VD "Đón khách", "Lễ rước dâu", "Cắt bánh".</p>
            <p><strong>Mô tả</strong>: tuỳ chọn, dùng cho ghi chú đặc biệt (dress code, vị trí…).</p>
          </>
        }
      >
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
      </FormSection>

      {wizard ? (
        <WizardFooter
          step={step} setStep={setStep} total={stepTitles.length}
          onSubmit={() => save.mutate(undefined)}
          submitLabel={form.is_published ? "Lưu thay đổi" : "Lưu & xuất bản"}
          isSubmitting={save.isPending}
          onSaveDraft={draft.saveNow}
          onPreview={form.slug ? () => window.open(`/couples/${form.slug}`, "_blank") : undefined}
          previewLabel="Xem trang công khai"
          stepPreview={renderCouplePreview(step, stepMap, form, gallery)}
          stepPreviewTitle={`Xem thử — ${stepTitles[step]}`}
          extra={form.id ? (
            form.is_published ? (
              <button type="button" disabled={save.isPending} onClick={() => save.mutate({ is_published: false })}
                className="px-3 py-2 rounded border border-input bg-background hover:bg-secondary text-xs uppercase tracking-wider disabled:opacity-50">
                Chuyển về nháp
              </button>
            ) : (
              <button type="button" disabled={save.isPending} onClick={() => save.mutate({ is_published: true })}
                className="px-3 py-2 rounded bg-primary/90 text-primary-foreground text-xs uppercase tracking-wider disabled:opacity-50">
                Xuất bản ngay
              </button>
            )
          ) : undefined}
        />
      ) : (
      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-6 px-6 border-t border-border/40 flex flex-wrap gap-3">
        <button type="submit" disabled={save.isPending} className="px-6 py-3 bg-primary text-primary-foreground rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">
          {save.isPending ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
        {form.id && !form.is_published && (
          <button type="button" disabled={save.isPending} onClick={() => save.mutate({ is_published: true })}
            className="px-6 py-3 bg-primary/90 text-primary-foreground rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">
            Lưu &amp; xuất bản
          </button>
        )}
        {form.id && form.is_published && (
          <button type="button" disabled={save.isPending} onClick={() => save.mutate({ is_published: false })}
            className="px-6 py-3 border border-input bg-background hover:bg-secondary rounded uppercase tracking-[0.2em] text-sm disabled:opacity-50">
            Lưu &amp; chuyển về nháp
          </button>
        )}
        {form.slug && (
          <a href={`/couples/${form.slug}`} target="_blank" rel="noopener" className="px-6 py-3 border border-input rounded uppercase tracking-[0.2em] text-sm">
            Xem trang
          </a>
        )}
      </div>
      )}
    </form>
  );
}
