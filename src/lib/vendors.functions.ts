import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { fireEmail } from "@/lib/email/send.server";
import { guardPublicSubmit } from "@/lib/anti-spam.server";

export const listVendors = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("vendors").select("*").eq("is_approved", true)
    .order("is_featured", { ascending: false }).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((v: any) => ({ ...v, ...(v.published_content ?? {}) }));
});

export const getVendorBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: vendor, error } = await supabaseAdmin
      .from("vendors").select("*").eq("slug", data.slug).eq("is_approved", true).maybeSingle();
    if (error) throw new Error(error.message);
    if (!vendor) return null;
    const merged = { ...vendor, ...((vendor as any).published_content ?? {}) };
    const [{ data: products }, { data: testimonials }] = await Promise.all([
      supabaseAdmin.from("vendor_products").select("*").eq("vendor_id", vendor.id).eq("is_active", true).order("sort_order"),
      supabaseAdmin.from("vendor_testimonials").select("id,author_name,message,rating,created_at").eq("vendor_id", vendor.id).eq("is_approved", true).order("created_at", { ascending: false }).limit(20),
    ]);
    return { ...merged, products: products ?? [], testimonials: testimonials ?? [] };
  });

export const submitVendorLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    vendor_id: z.string().uuid(),
    guest_name: z.string().trim().min(1).max(120),
    guest_phone: z.string().trim().max(30).optional().or(z.literal("")),
    guest_email: z.string().trim().email().max(160).optional().or(z.literal("")),
    event_date: z.string().optional().or(z.literal("")),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
    _hp: z.string().max(200).optional(),
    _ts: z.number().int().nonnegative().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    await guardPublicSubmit({
      bucket: "lead",
      scopeKey: data.vendor_id,
      honeypot: { _hp: data._hp, _ts: data._ts },
      limit: 5,
      windowSeconds: 60,
    });
    const { error } = await supabaseAdmin.from("vendor_leads").insert({
      vendor_id: data.vendor_id,
      guest_name: data.guest_name,
      guest_phone: data.guest_phone || null,
      guest_email: data.guest_email || null,
      event_date: data.event_date || null,
      message: data.message || null,
    });
    if (error) throw new Error(error.message);
    // Notify vendor (fire-and-forget)
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("name, email")
      .eq("id", data.vendor_id)
      .maybeSingle();
    if (vendor?.email) {
      fireEmail({
        templateName: "vendor-new-lead",
        recipientEmail: vendor.email,
        templateData: {
          vendorName: vendor.name,
          guestName: data.guest_name,
          guestPhone: data.guest_phone || undefined,
          guestEmail: data.guest_email || undefined,
          eventDate: data.event_date || undefined,
          message: data.message || undefined,
        },
      });
    }
    return { ok: true };
  });
