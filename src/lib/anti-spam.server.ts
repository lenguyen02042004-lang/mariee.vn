import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function getClientIp(): string {
  try {
    const h = getRequest().headers;
    const cf = h.get("cf-connecting-ip") || "";
    const xff = h.get("x-forwarded-for") || "";
    const real = h.get("x-real-ip") || "";
    const ip = (cf || xff.split(",")[0] || real || "").trim();
    return ip || "unknown";
  } catch {
    return "unknown";
  }
}

export function verifyHoneypot(input: { _hp?: string; _ts?: number } | undefined) {
  if (!input) return;
  if (input._hp && input._hp.trim().length > 0) {
    throw new Error("Yêu cầu không hợp lệ.");
  }
  if (typeof input._ts === "number" && input._ts > 0) {
    const elapsed = Date.now() - input._ts;
    if (elapsed < 1500) {
      throw new Error("Vui lòng thử lại sau giây lát.");
    }
  }
}

export async function enforceRateLimit(opts: {
  bucket: string;
  key: string;
  limit: number;
  windowSeconds: number;
}) {
  const { data, error } = await supabaseAdmin.rpc("rate_limit_check", {
    _bucket: opts.bucket,
    _key: opts.key,
    _limit: opts.limit,
    _window_seconds: opts.windowSeconds,
  });
  if (error) {
    // fail-open on infra error, but log
    console.warn("[rate_limit_check]", error.message);
    return;
  }
  if (data === false) {
    throw new Error("Bạn gửi quá nhanh, vui lòng thử lại sau ít phút.");
  }
}

export async function guardPublicSubmit(opts: {
  bucket: string;
  scopeKey: string;
  honeypot?: { _hp?: string; _ts?: number };
  limit?: number;
  windowSeconds?: number;
}) {
  verifyHoneypot(opts.honeypot);
  const ip = getClientIp();
  await enforceRateLimit({
    bucket: opts.bucket,
    key: `${ip}:${opts.scopeKey}`,
    limit: opts.limit ?? 5,
    windowSeconds: opts.windowSeconds ?? 60,
  });
}