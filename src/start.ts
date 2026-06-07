import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { logServerError } from "@/lib/error-log.server";

// Skip noisy expected errors (validation, auth gating).
const SKIP_RE = /^(Unauthorized|Forbidden|Not found|Invalid input|Zod)/i;

const errorLogMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!SKIP_RE.test(msg)) {
      try { logServerError("server-fn", error, {}); } catch { /* never block */ }
    }
    throw error;
  }
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth, errorLogMiddleware],
}));
