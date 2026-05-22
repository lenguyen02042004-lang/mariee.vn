import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (!(data ?? []).some((r: any) => r.role === "admin")) throw new Error("Forbidden");
}

export const adminListPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("vendor_plans" as any).select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as any[];
  });

const planSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional().or(z.literal("")),
  price_vnd: z.number().int().min(0).max(100_000_000),
  billing_months: z.number().int().min(1).max(36),
  features: z.array(z.string().max(200)).max(20),
  sort_order: z.number().int().min(0).max(999),
  is_active: z.boolean(),
});

export const adminUpsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => planSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { ...data, description: data.description || null };
    if (payload.id) {
      const { error } = await context.supabase.from("vendor_plans" as any).update(payload).eq("id", payload.id);
      if (error) throw new Error(error.message);
      return { id: payload.id };
    }
    const { data: row, error } = await context.supabase.from("vendor_plans" as any).insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as any).id };
  });

export const adminDeletePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("vendor_plans" as any).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("vendor_payments" as any)
      .select("*, vendors(name, slug), vendor_plans(name, billing_months)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as any[];
  });

export const adminReviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    action: z.enum(["approve", "reject"]),
    note: z.string().max(500).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: pay, error: e0 } = await context.supabase
      .from("vendor_payments" as any)
      .select("*, vendor_plans(billing_months)")
      .eq("id", data.id).single();
    if (e0 || !pay) throw new Error(e0?.message ?? "Not found");
    const status = data.action === "approve" ? "approved" : "rejected";
    const { error } = await context.supabase.from("vendor_payments" as any).update({
      status, admin_note: data.note ?? null, reviewed_by: context.userId, reviewed_at: new Date().toISOString(),
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.action === "approve") {
      const months = (pay as any).vendor_plans?.billing_months ?? 1;
      const expiresAt = new Date(Date.now() + months * 30 * 24 * 3600 * 1000).toISOString();
      await context.supabase.from("vendor_subscriptions" as any).insert({
        vendor_id: (pay as any).vendor_id, plan_id: (pay as any).plan_id,
        status: "active", started_at: new Date().toISOString(), expires_at: expiresAt,
      });
      await context.supabase.from("vendors").update({
        plan_id: (pay as any).plan_id, plan_expires_at: expiresAt,
      } as any).eq("id", (pay as any).vendor_id);
    }
    return { ok: true };
  });

const settingsSchema = z.object({
  bank_name: z.string().max(120).nullish().or(z.literal("")),
  bank_account_name: z.string().max(120).nullish().or(z.literal("")),
  bank_account_number: z.string().max(60).nullish().or(z.literal("")),
  qr_image_url: z.string().max(800).nullish().or(z.literal("")),
  instructions: z.string().max(1000).nullish().or(z.literal("")),
});

export const adminUpdatePaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => settingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = {};
    for (const [k, v] of Object.entries(data)) payload[k] = v || null;
    const { error } = await context.supabase.from("payment_settings" as any).update(payload).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const siteSchema = z.object({
  site_name: z.string().max(120).nullish().or(z.literal("")),
  logo_url: z.string().max(800).nullish().or(z.literal("")),
  favicon_url: z.string().max(800).nullish().or(z.literal("")),
  primary_color: z.string().max(40).nullish().or(z.literal("")),
  accent_color: z.string().max(40).nullish().or(z.literal("")),
  contact_email: z.string().max(160).nullish().or(z.literal("")),
  contact_phone: z.string().max(60).nullish().or(z.literal("")),
  footer_text: z.string().max(500).nullish().or(z.literal("")),
});

export const adminUpdateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => siteSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { updated_at: new Date().toISOString() };
    for (const [k, v] of Object.entries(data)) payload[k] = v || null;
    const { error } = await context.supabase.from("site_settings" as any).upsert({ id: 1, ...payload });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    const { data: profiles } = await context.supabase.from("profiles").select("*");
    const byUser: Record<string, string[]> = {};
    for (const r of roles ?? []) {
      (byUser[(r as any).user_id] ??= []).push((r as any).role);
    }
    return (profiles ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] }));
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    user_id: z.string().uuid(),
    role: z.enum(["admin", "vendor", "user"]),
    grant: z.boolean(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.grant) {
      const { error } = await context.supabase.from("user_roles").upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" } as any);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });