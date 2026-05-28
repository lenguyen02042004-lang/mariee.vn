import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMyVendor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("vendors").select("*").eq("owner_id", context.userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const vendorSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(1).max(60).regex(/^[a-z0-9_-]+$/),
  tagline: z.string().max(240).optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
  cover_image: z.string().max(800).optional().or(z.literal("")),
  logo_url: z.string().max(800).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().max(160).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  website: z.string().max(400).optional().or(z.literal("")),
  price_range: z.string().max(80).optional().or(z.literal("")),
  youtube_url: z.string().max(400).optional().or(z.literal("")),
  gallery: z.array(z.string().max(800)).max(30).optional(),
});

export const upsertMyVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => vendorSchema.parse(d))
  .handler(async ({ data, context }) => {
    const payload: any = { ...data, owner_id: context.userId };
    for (const k of Object.keys(payload)) if (payload[k] === "") payload[k] = null;
    const { data: existing } = await context.supabase
      .from("vendors").select("id").eq("owner_id", context.userId).maybeSingle();
    if (existing?.id) {
      const { error } = await context.supabase.from("vendors").update(payload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { id: existing.id };
    }
    const { data: row, error } = await context.supabase.from("vendors").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

const PUBLISHABLE_FIELDS = [
  "name","slug","category","tagline","description","cover_image","logo_url",
  "phone","email","address","city","website","price_range","youtube_url","gallery",
] as const;

export const publishMyVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: vendor, error } = await context.supabase
      .from("vendors").select("*").eq("owner_id", context.userId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!vendor) throw new Error("Chưa có hồ sơ để xuất bản");
    const snapshot: Record<string, any> = {};
    for (const k of PUBLISHABLE_FIELDS) snapshot[k] = (vendor as any)[k] ?? null;
    const { error: upErr } = await context.supabase
      .from("vendors")
      .update({ published_content: snapshot, published_at: new Date().toISOString() })
      .eq("id", vendor.id);
    if (upErr) throw new Error(upErr.message);
    return { ok: true, published_at: new Date().toISOString() };
  });

async function getMyVendorId(supabase: any, userId: string) {
  const { data, error } = await supabase.from("vendors").select("id").eq("owner_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Chưa có hồ sơ vendor");
  return data.id as string;
}

export const listMyProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("vendor_products").select("*").eq("vendor_id", vid).order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  price_text: z.string().max(80).optional().or(z.literal("")),
  image_url: z.string().max(800).optional().or(z.literal("")),
  sort_order: z.number().int().min(0).max(9999).optional(),
  is_active: z.boolean().optional(),
});

export const upsertMyProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productSchema.parse(d))
  .handler(async ({ data, context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const payload: any = { ...data, vendor_id: vid };
    for (const k of Object.keys(payload)) if (payload[k] === "") payload[k] = null;
    if (data.id) {
      const { error } = await context.supabase.from("vendor_products").update(payload).eq("id", data.id).eq("vendor_id", vid);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    delete payload.id;
    const { data: row, error } = await context.supabase.from("vendor_products").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteMyProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const { error } = await context.supabase.from("vendor_products").delete().eq("id", data.id).eq("vendor_id", vid);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("vendor_testimonials").select("*").eq("vendor_id", vid).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const testiSchema = z.object({
  id: z.string().uuid().optional(),
  author_name: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(1000),
  rating: z.number().int().min(1).max(5).optional(),
  is_approved: z.boolean().optional(),
});

export const upsertMyTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => testiSchema.parse(d))
  .handler(async ({ data, context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const payload: any = { ...data, vendor_id: vid };
    if (data.id) {
      const { error } = await context.supabase.from("vendor_testimonials").update(payload).eq("id", data.id).eq("vendor_id", vid);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    delete payload.id;
    const { data: row, error } = await context.supabase.from("vendor_testimonials").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const deleteMyTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const { error } = await context.supabase.from("vendor_testimonials").delete().eq("id", data.id).eq("vendor_id", vid);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("vendor_leads").select("*").eq("vendor_id", vid).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    status: z.enum(["new","contacted","won","lost"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const vid = await getMyVendorId(context.supabase, context.userId);
    const { error } = await context.supabase.from("vendor_leads").update({ status: data.status }).eq("id", data.id).eq("vendor_id", vid);
    if (error) throw new Error(error.message);
    return { ok: true };
  });