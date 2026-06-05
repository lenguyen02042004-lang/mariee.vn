import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
  validateSearch: z.object({ token: z.string().optional() }).parse,
  head: () => ({ meta: [{ title: "Huỷ nhận email — Mariée" }] }),
});

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) return setState({ kind: "invalid" });
        if (j.valid === false && j.reason === "already_unsubscribed")
          return setState({ kind: "already" });
        if (j.valid) return setState({ kind: "valid" });
        setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "invalid" }));
  }, [token]);

  async function confirm() {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await r.json();
      if (j.success) setState({ kind: "done" });
      else if (j.reason === "already_unsubscribed") setState({ kind: "already" });
      else setState({ kind: "error", message: j.error || "Có lỗi xảy ra" });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
    }
  }

  return (
    <div>
      <PageHero
        title="Huỷ nhận email"
        subtitle="Bạn có thể quay lại bất cứ lúc nào."
        size="small"
      />
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        {state.kind === "loading" && <p className="text-muted-foreground">Đang xác minh…</p>}
        {state.kind === "invalid" && (
          <p className="text-muted-foreground">
            Liên kết không hợp lệ hoặc đã hết hạn.
          </p>
        )}
        {state.kind === "already" && (
          <p className="text-muted-foreground">
            Email của bạn đã được gỡ khỏi danh sách nhận thư trước đó.
          </p>
        )}
        {state.kind === "valid" && (
          <>
            <p className="text-foreground/80 mb-6">
              Xác nhận rằng bạn không muốn nhận email từ Mariée nữa?
            </p>
            <button
              onClick={confirm}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md uppercase tracking-[0.2em] text-xs hover:bg-primary/90"
            >
              Xác nhận huỷ nhận email
            </button>
          </>
        )}
        {state.kind === "submitting" && (
          <p className="text-muted-foreground">Đang xử lý…</p>
        )}
        {state.kind === "done" && (
          <p className="font-script text-3xl text-primary">
            Đã huỷ nhận email thành công.
          </p>
        )}
        {state.kind === "error" && (
          <p className="text-destructive">{state.message}</p>
        )}
      </div>
    </div>
  );
}