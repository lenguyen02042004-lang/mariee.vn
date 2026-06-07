import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    // Persist server errors to error_logs so admins can review them in /admin/logs.
    try {
      const msg = error instanceof Error ? error.message : String(error);
      if (!/^(Unauthorized|Forbidden|Not found|Invalid input|Zod)/i.test(msg)) {
        const { logServerError } = await import("@/lib/error-log.server");
        logServerError("request", error, {});
      }
    } catch { /* never block error rendering */ }
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
