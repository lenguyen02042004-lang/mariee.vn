import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const isAdmin = (data ?? []).some((r: any) => r.role === "admin");
  if (!isAdmin) throw new Error("Forbidden: cần quyền quản trị");
}

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    return { userId, roles: (data ?? []).map((r: any) => r.role) as string[] };
  });

export const adminListCouples = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("couples").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const coupleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/i),
  bride_name: z.string().trim().min(1).max(120),
  groom_name: z.string().trim().min(1).max(120),
  wedding_date: z.string().optional().or(z.literal("")),
  venue_name: z.string().max(200).optional().or(z.literal("")),
  venue_address: z.string().max(400).optional().or(z.literal("")),
  story: z.string().max(4000).optional().or(z.literal("")),
  quote: z.string().max(400).optional().or(z.literal("")),
  youtube_url: z.string().max(400).optional().or(z.literal("")),
  cover_image: z.string().max(800).optional().or(z.literal("")),
  hero_image_1: z.string().max(800).optional().or(z.literal("")),
  hero_image_2: z.string().max(800).optional().or(z.literal("")),
  hero_image_3: z.string().max(800).optional().or(z.literal("")),
  is_published: z.boolean().default(true),
});

export const adminUpsertCouple = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => coupleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { ...data };
    if (!payload.wedding_date) payload.wedding_date = null;
    for (const k of ["venue_name","venue_address","story","quote","youtube_url","cover_image","hero_image_1","hero_image_2","hero_image_3"]) {
      if (payload[k] === "") payload[k] = null;
    }
    if (payload.id) {
      const { error } = await context.supabase.from("couples").update(payload).eq("id", payload.id);
      if (error) throw new Error(error.message);
      return { id: payload.id };
    }
    const { data: row, error } = await context.supabase.from("couples").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const adminDeleteCouple = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    await context.supabase.from("couple_gallery").delete().eq("couple_id", data.id);
    await context.supabase.from("rsvp").delete().eq("couple_id", data.id);
    const { error } = await context.supabase.from("couples").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetCouple = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: couple } = await context.supabase.from("couples").select("*").eq("id", data.id).maybeSingle();
    const { data: gallery } = await context.supabase.from("couple_gallery").select("*").eq("couple_id", data.id).order("sort_order");
    return { couple, gallery: gallery ?? [] };
  });

const vendorSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/i),
  name: z.string().trim().min(1).max(160),
  category: z.enum([
    "venue",
    "photography",
    "videography",
    "wedding_planner",
    "makeup",
    "attire",
    "flowers",
    "catering",
    "music",
    "decor",
    "invitation",
    "other",
  ]),
  tagline: z.string().max(240).optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
  cover_image: z.string().max(800).optional().or(z.literal("")),
  logo_url: z.string().max(800).optional().or(z.literal("")),
  gallery: z.array(z.string().max(800)).max(30).optional(),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().max(160).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  website: z.string().max(400).optional().or(z.literal("")),
  price_range: z.string().max(80).optional().or(z.literal("")),
  youtube_url: z.string().max(400).optional().or(z.literal("")),
  is_approved: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

export const adminGetVendor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: vendor, error } = await context.supabase.from("vendors").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!vendor) return null;
    return vendor;
  });

export const adminUpsertVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => vendorSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { ...data };
    for (const k of ["tagline","description","cover_image","logo_url","phone","email","address","city","website","price_range","youtube_url"]) {
      if (payload[k] === "") payload[k] = null;
    }
    if (payload.gallery) payload.gallery = payload.gallery ?? [];
    if (payload.id) {
      const { error } = await context.supabase.from("vendors").update(payload).eq("id", payload.id);
      if (error) throw new Error(error.message);
      const { data: updated, error: fetchErr } = await context.supabase.from("vendors").select("*").eq("id", payload.id).maybeSingle();
      if (fetchErr) throw new Error(fetchErr.message);
      return updated;
    }
    const { data: row, error } = await context.supabase.from("vendors").insert(payload).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminAddGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    couple_id: z.string().uuid(),
    image_url: z.string().min(1).max(800),
    caption: z.string().max(300).optional().or(z.literal("")),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("couple_gallery").insert({
      couple_id: data.couple_id, image_url: data.image_url, caption: data.caption || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("couple_gallery").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListVendors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ page: z.number().int().min(1).optional(), pageSize: z.number().int().min(1).max(100).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data: rows, error } = await context.supabase.from("vendors").select("*").order("created_at", { ascending: false }).range(from, to);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSetVendorApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(), is_approved: z.boolean(), is_featured: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const patch: any = { is_approved: data.is_approved };
    if (typeof data.is_featured === "boolean") patch.is_featured = data.is_featured;
    const { error } = await context.supabase.from("vendors").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("vendors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListRsvp = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("rsvp").select("*, couples(slug, bride_name, groom_name)").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminDeleteRsvp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("rsvp").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });