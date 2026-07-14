import type { ReactNode } from "react";

/**
 * Two-column form section: fields on the left, sticky helper panel on the right.
 * Used by VendorForm & CoupleForm to guide users with examples and tips.
 */
export function FormSection({
  title,
  description,
  helper,
  children,
  hidden,
}: {
  title: string;
  description?: string;
  helper: ReactNode;
  children: ReactNode;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <section className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-10 pb-8 border-b border-border/40 last:border-0">
      <div>
        <h3 className="font-display text-xl mb-1">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mb-4">{description}</p>}
        <div className="space-y-4">{children}</div>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 text-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Gợi ý</p>
          <div className="text-muted-foreground leading-relaxed text-[13px] space-y-2">
            {helper}
          </div>
        </div>
      </aside>
    </section>
  );
}

/** Select with "Khác" option that falls back to a free-text input. */
export function SelectOrOther({
  value, onChange, options, placeholder = "— Chọn —", otherLabel = "Khác (tự nhập)", inputPlaceholder, className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  otherLabel?: string;
  inputPlaceholder?: string;
  className?: string;
}) {
  const isOther = !!value && !options.includes(value);
  return (
    <div className={`space-y-2 ${className}`}>
      <select
        value={isOther ? "__other" : (value || "")}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__other") onChange(" "); // sentinel to switch UI to text input
          else if (v === "") onChange("");
          else onChange(v);
        }}
        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value="__other">{otherLabel}</option>
      </select>
      {isOther && (
        <input
          autoFocus
          value={value.trim()}
          onChange={(e) => onChange(e.target.value)}
          placeholder={inputPlaceholder ?? "Tự nhập…"}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
        />
      )}
    </div>
  );
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
      {children}{required && <span className="text-destructive ml-1">*</span>}
    </span>
  );
}