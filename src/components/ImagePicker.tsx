import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadImage, validateImage, DEFAULT_MAX_MB } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  maxMB?: number;
  aspect?: string;        // tailwind aspect-* class
  buttonLabel?: string;
};

export function ImagePicker({
  value, onChange, label, folder = "uploads",
  maxMB = DEFAULT_MAX_MB, aspect = "aspect-[4/3]", buttonLabel,
}: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  async function handle(file: File) {
    setErr(null);
    if (!user) { const m = "Vui lòng đăng nhập trước khi tải ảnh"; setErr(m); toast.error(m); return; }
    const v = validateImage(file, { maxMB });
    if (v) { setErr(v); toast.error(v); return; }
    // instant local preview before upload completes
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setBusy(true);
    try {
      const url = await uploadImage(file, user.id, folder);
      onChange(url);
      toast.success("Đã tải ảnh lên");
    } catch (e: any) {
      const m = e?.message || "Tải ảnh thất bại, vui lòng thử lại";
      setErr(m);
      toast.error(m);
    } finally {
      setBusy(false);
      // delay revoke until image swap finishes
      setTimeout(() => { URL.revokeObjectURL(preview); setLocalPreview(null); }, 1500);
    }
  }

  const shown = value || localPreview;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <label
        htmlFor={inputId}
        className={`${aspect} group relative rounded-md border border-dashed border-border bg-secondary/40 overflow-hidden flex items-center justify-center transition-all duration-200 hover:border-primary hover:bg-secondary/70 hover:shadow-sm ${busy ? "" : "cursor-pointer"}`}
      >
        {shown
          ? <img src={shown} alt="" className="w-full h-full object-cover" />
          : <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Bấm để tải ảnh lên</span>}
        {shown && !busy && (
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
            <span className="text-xs font-medium text-background opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded bg-foreground/70">Bấm để đổi ảnh</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs font-medium text-foreground">Đang tải lên…</span>
          </div>
        )}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${busy ? "opacity-50 pointer-events-none" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {buttonLabel ?? (value ? "Đổi ảnh" : "Tải ảnh lên")}
        </label>
        {value && !busy && (
          <button type="button" onClick={() => { onChange(""); setErr(null); }} className="cursor-pointer px-3 py-1.5 text-xs rounded-md border border-input bg-background transition-all duration-200 hover:bg-destructive/10 hover:border-destructive hover:text-destructive">
            Xoá
          </button>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); if (inputRef.current) inputRef.current.value = ""; }}
          className="hidden"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">JPG · PNG · WebP — tối đa {maxMB}MB</p>
      {err && <p className="text-xs text-destructive">⚠ {err}</p>}
    </div>
  );
}

type MultiProps = {
  onUpload: (file: File) => Promise<void> | void;
  disabled?: boolean;
  maxMB?: number;
  buttonLabel?: string;
  helper?: string;
};

export function ImageUploadButton({ onUpload, disabled, maxMB = DEFAULT_MAX_MB, buttonLabel = "Tải ảnh lên", helper }: MultiProps) {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  async function handle(file: File) {
    setErr(null);
    const v = validateImage(file, { maxMB });
    if (v) { setErr(v); toast.error(v); return; }
    setBusy(true);
    try { await onUpload(file); }
    catch (e: any) { const m = e?.message || "Tải ảnh thất bại"; setErr(m); toast.error(m); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${(disabled || busy) ? "opacity-50 pointer-events-none" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {busy ? "Đang tải…" : buttonLabel}
        </label>
        {helper && <span className="text-[11px] text-muted-foreground">{helper}</span>}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || busy}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); if (inputRef.current) inputRef.current.value = ""; }}
          className="hidden"
        />
      </div>
      {err && <p className="text-xs text-destructive">⚠ {err}</p>}
    </div>
  );
}