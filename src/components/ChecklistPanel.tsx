import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  resetChecklist,
} from "@/lib/checklist.functions";
import { toast } from "sonner";

type Item = {
  id: string;
  title: string;
  category: string;
  is_completed: boolean;
  is_custom: boolean;
  sort_order: number;
};

export function ChecklistPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listChecklist);
  const addFn = useServerFn(addChecklistItem);
  const toggleFn = useServerFn(toggleChecklistItem);
  const delFn = useServerFn(deleteChecklistItem);
  const resetFn = useServerFn(resetChecklist);

  const { data = [], isLoading } = useQuery<Item[]>({
    queryKey: ["my-checklist"],
    queryFn: () => listFn() as Promise<Item[]>,
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["my-checklist"] });

  const mAdd = useMutation({
    mutationFn: () => addFn({ data: { title: title.trim(), category: category.trim() || undefined } }),
    onSuccess: () => { setTitle(""); setCategory(""); invalidate(); toast.success("Đã thêm mục"); },
    onError: (e: any) => toast.error(e.message),
  });
  const mToggle = useMutation({
    mutationFn: (v: { id: string; is_completed: boolean }) => toggleFn({ data: v }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["my-checklist"] });
      const prev = qc.getQueryData<Item[]>(["my-checklist"]);
      qc.setQueryData<Item[]>(["my-checklist"], (old) =>
        (old ?? []).map((i) => (i.id === v.id ? { ...i, is_completed: v.is_completed } : i)),
      );
      return { prev };
    },
    onError: (e: any, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["my-checklist"], ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => invalidate(),
  });
  const mDelete = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Đã xoá"); },
    onError: (e: any) => toast.error(e.message),
  });
  const mReset = useMutation({
    mutationFn: () => resetFn(),
    onSuccess: () => { invalidate(); toast.success("Đã khôi phục danh sách chuẩn"); },
    onError: (e: any) => toast.error(e.message),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const item of data) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return Array.from(map.entries());
  }, [data]);

  const total = data.length;
  const done = data.filter((i) => i.is_completed).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <section className="mb-10 border border-border/60 rounded-lg p-5 bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Danh mục chuẩn bị cưới</h2>
          <p className="text-sm text-muted-foreground">
            Bộ danh mục chuẩn theo từng giai đoạn — đánh dấu khi hoàn thành và bổ sung mục riêng của bạn.
          </p>
        </div>
        <button
          onClick={() => confirm("Khôi phục danh sách chuẩn? Tất cả mục hiện tại (kể cả tự thêm) sẽ bị xoá.") && mReset.mutate()}
          className="text-xs px-3 py-1.5 rounded border border-input hover:bg-secondary"
        >
          Khôi phục danh sách chuẩn
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Tiến độ</span>
          <span>{done}/{total} ({percent}%)</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; mAdd.mutate(); }}
        className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Thêm mục mới của bạn…"
          className="px-3 py-2 rounded border border-input bg-background text-sm"
          maxLength={200}
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Danh mục (tuỳ chọn)"
          className="px-3 py-2 rounded border border-input bg-background text-sm"
          maxLength={80}
        />
        <button
          type="submit"
          disabled={!title.trim() || mAdd.isPending}
          className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50"
        >
          Thêm
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground mt-6">Đang tải…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map(([cat, items]) => {
            const catDone = items.filter((i) => i.is_completed).length;
            return (
              <div key={cat}>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-display text-lg text-primary">{cat}</h3>
                  <span className="text-xs text-muted-foreground">{catDone}/{items.length}</span>
                </div>
                <ul className="divide-y divide-border/40 border border-border/40 rounded-md overflow-hidden">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 px-3 py-2.5 bg-background/40">
                      <input
                        type="checkbox"
                        checked={it.is_completed}
                        onChange={(e) => mToggle.mutate({ id: it.id, is_completed: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer shrink-0"
                      />
                      <span className={`flex-1 text-sm ${it.is_completed ? "line-through text-muted-foreground" : ""}`}>
                        {it.title}
                        {it.is_custom && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-foreground/70">
                            Tự thêm
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => confirm("Xoá mục này?") && mDelete.mutate(it.id)}
                        className="text-xs text-destructive hover:underline shrink-0"
                      >
                        Xoá
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}