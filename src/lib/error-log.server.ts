import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Fire-and-forget log writer used inside server functions.
export function logServerError(source: string, error: unknown, context: Record<string, unknown> = {}, userId?: string) {
  const err = error instanceof Error ? error : new Error(String(error));
  const payload = {
    source: source.slice(0, 120),
    message: (err.message ?? "Unknown error").slice(0, 2000),
    stack: (err.stack ?? "").slice(0, 8000) || null,
    context: context ?? {},
    user_id: userId ?? null,
  };
  void supabaseAdmin.from("error_logs" as any).insert(payload).then(({ error: e }) => {
    if (e) console.warn("[error-log] insert failed:", e.message);
  });
}

export async function withErrorLog<T>(source: string, ctx: Record<string, unknown>, userId: string | undefined, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    logServerError(source, e, ctx, userId);
    throw e;
  }
}