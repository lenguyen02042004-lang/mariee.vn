import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fireEmail, getAdminEmails } from "@/lib/email/send.server";

export const vendorListMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: vendor } = await supabase.from("vendors").select("id, name, plan_id, plan_expires_at").eq("owner_id", userId).maybeSingle();
    if (!vendor) return { vendor: null, payments: [], subscription: null };
    // Use admin client with explicit safe-column allowlist so internal admin
    // fields (admin_note, reviewed_by, reviewed_at) are never returned to vendor owners.
    const { data: payments } = await supabaseAdmin
      .from("vendor_payments" as any)
      .select("id, vendor_id, plan_id, amount_vnd, status, transfer_code, proof_image_url, created_at, vendor_plans(name, price_vnd, billing_months)")
      .eq("vendor_id", (vendor as any).id)
      .order("created_at", { ascending: false });
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
    // Notify admins (fire-and-forget)
    (async () => {
      const { data: v } = await supabaseAdmin
        .from("vendors")
        .select("name")
        .eq("id", (vendor as any).id)
        .maybeSingle();
      const { data: p } = await supabaseAdmin
        .from("vendor_plans" as any)
        .select("name")
        .eq("id", data.plan_id)
        .maybeSingle();
      const emails = await getAdminEmails();
      for (const email of emails) {
        fireEmail({
          templateName: "admin-new-payment",
          recipientEmail: email,
          templateData: {
            vendorName: (v as any)?.name ?? "Vendor",
            planName: (p as any)?.name ?? "Gói",
            amountVnd: (plan as any).price_vnd,
            transferCode: data.transfer_code || undefined,
          },
        });
      }
    })().catch(() => {});
    return { ok: true };
  });