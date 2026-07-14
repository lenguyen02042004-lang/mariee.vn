import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

/**
 * Step-by-step wizard shell used by CoupleForm & VendorForm.
 * - Header hiển thị các bước, click để nhảy nhanh.
 * - Footer chứa nút Quay lại / Tiếp theo / Xem thử / Lưu.
 * - Tự động lưu nháp vào localStorage theo `draftKey`.
 */
export function WizardHeader({
  titles, step, setStep,
}: { titles: string[]; step: number; setStep: (n: number) => void }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Bước {step + 1} / {titles.length}
        </p>
        <p className="text-xs text-muted-foreground">
          Nháp được lưu tự động trên trình duyệt này
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
          style={{ width: `${((step + 1) / titles.length) * 100}%` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {titles.map((t, i) => {
          const done = i < step, current = i === step;
          return (
            <button
              key={i} type="button" onClick={() => setStep(i)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                current
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : done
                    ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                    : "bg-background text-muted-foreground border-input hover:border-primary/40"
              }`}
            >
              <span className="font-medium mr-1.5">{i + 1}.</span>{t}
              {done && <span className="ml-1.5">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WizardFooter({
  step, setStep, total,
  onSubmit, submitLabel = "Lưu thay đổi", isSubmitting,
  onPreview, previewLabel = "Xem thử",
  onSaveDraft, extra,
}: {
  step: number;
  setStep: (n: number) => void;
  total: number;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  onPreview?: () => void;
  previewLabel?: string;
  onSaveDraft?: () => void;
  extra?: ReactNode;
}) {
  const isLast = step >= total - 1;
  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-6 px-6 border-t border-border/40 flex flex-wrap gap-2 items-center">
      <button
        type="button" disabled={step === 0}
        onClick={() => setStep(Math.max(0, step - 1))}
        className="px-4 py-2.5 rounded-md border border-input bg-background hover:bg-secondary text-sm disabled:opacity-40"
      >← Quay lại</button>
      {!isLast ? (
        <button
          type="button"
          onClick={() => setStep(Math.min(total - 1, step + 1))}
          className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm uppercase tracking-[0.16em] hover:opacity-90"
        >Tiếp theo →</button>
      ) : (
        onSubmit && (
          <button
            type="button" disabled={isSubmitting}
            onClick={onSubmit}
            className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm uppercase tracking-[0.16em] hover:opacity-90 disabled:opacity-50"
          >{isSubmitting ? "Đang lưu…" : submitLabel}</button>
        )
      )}
      <span className="flex-1" />
      {onSaveDraft && (
        <button
          type="button" onClick={onSaveDraft}
          className="px-3 py-2 rounded-md text-sm text-primary hover:bg-primary/10"
        >💾 Lưu nháp</button>
      )}
      {onPreview && (
        <button
          type="button" onClick={onPreview}
          className="px-4 py-2.5 rounded-md border border-input bg-background hover:bg-secondary text-sm"
        >👁 {previewLabel}</button>
      )}
      {extra}
    </div>
  );
}

/**
 * Auto-lưu snapshot vào localStorage. Trả về banner "khôi phục nháp" nếu có
 * bản nháp khác initial khi mount.
 */
export function useLocalDraft<T extends object>({
  key, value, onRestore, enabled = true,
}: { key: string; value: T; onRestore: (draft: T) => void; enabled?: boolean }) {
  const [banner, setBanner] = useState<null | { draft: T; at: string }>(null);
  const checked = useRef(false);

  useEffect(() => {
    if (!enabled || checked.current) return;
    checked.current = true;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.value) {
        setBanner({ draft: parsed.value as T, at: parsed.savedAt as string });
      }
    } catch { /* ignore */ }
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ value, savedAt: new Date().toISOString() }));
      } catch { /* quota */ }
    }, 600);
    return () => clearTimeout(id);
  }, [enabled, key, value]);

  const clear = () => { try { localStorage.removeItem(key); } catch { /* ignore */ } };
  const saveNow = () => {
    try {
      localStorage.setItem(key, JSON.stringify({ value, savedAt: new Date().toISOString() }));
      toast.success("Đã lưu nháp lên trình duyệt");
    } catch { toast.error("Không thể lưu nháp (bộ nhớ đầy)"); }
  };

  const RestoreBanner = banner ? (
    <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 p-3 flex flex-wrap items-center gap-3 text-sm">
      <span>📝 Có bản nháp chưa hoàn tất từ {new Date(banner.at).toLocaleString("vi-VN")}.</span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={() => { onRestore(banner.draft); setBanner(null); toast.success("Đã khôi phục bản nháp"); }}
        className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs hover:opacity-90"
      >Khôi phục</button>
      <button
        type="button"
        onClick={() => { clear(); setBanner(null); }}
        className="px-3 py-1.5 rounded border border-input bg-background text-xs hover:bg-secondary"
      >Bỏ qua</button>
    </div>
  ) : null;

  return { RestoreBanner, clear, saveNow };
}
