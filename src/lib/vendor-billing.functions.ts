import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const vendorListMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: vendor } = await supabase.from("vendors").select("id, name, plan_id, plan_expires_at").eq("owner_id", userId).maybeSingle();
    if (!vendor) return { vendor: null, payments: [], subscription: null };
    const { data: payments } = await supabase.from("vendor_payments" as any).select("*, vendor_plans(name, price_vnd, billing_months)").eq("vendor_id", (vendor as any).id).order("created_at", { ascending: false });
    const { data: subs } = await supabase.from("vendor_subscriptions" as any).select("*, vendor_plans(name, billing_months)").eq("vendor_id", (vendor as any).id).eq("status", "active").order("expires_at", { ascending: false }).limit(1).maybeSingle();
    return { vendor, payments: payments ?? [], subscription: subs ?? null };
  });

export const vendorSubmitPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    plan_id: z.string().uuid(),
    transfer_code: z.string().max(100).optional().or(z.literal("")),
    proof_image_url: z.string().max(800).optional().or(z.literal("")),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: vendor } = await supabase.from("vendors").select("id").eq("owner_id", userId).maybeSingle();
    if (!vendor) throw new Error("Bạn cần có hồ sơ vendor trước khi đăng ký gói.");
    const { data: plan } = await supabase.from("vendor_plans" as any).select("price_vnd").eq("id", data.plan_id).maybeSingle();
    if (!plan) throw new Error("Gói không hợp lệ");
    const { error } = await supabase.from("vendor_payments" as any).insert({
      vendor_id: (vendor as any).id,
      plan_id: data.plan_id,
      amount_vnd: (plan as any).price_vnd,
      transfer_code: data.transfer_code || null,
      proof_image_url: data.proof_image_url || null,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });