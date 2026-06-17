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
  ceremony_time: z.string().max(120).optional().or(z.literal("")),
  reception_time: z.string().max(120).optional().or(z.literal("")),
  gift_bride_bank: z.string().max(120).optional().or(z.literal("")),
  gift_bride_account: z.string().max(60).optional().or(z.literal("")),
  gift_bride_holder: z.string().max(120).optional().or(z.literal("")),
  gift_groom_bank: z.string().max(120).optional().or(z.literal("")),
  gift_groom_account: z.string().max(60).optional().or(z.literal("")),
  gift_groom_holder: z.string().max(120).optional().or(z.literal("")),
  gift_bride_qr_url: z.string().max(800).nullable().optional().or(z.literal("")),
  gift_groom_qr_url: z.string().max(800).nullable().optional().or(z.literal("")),
  schedule: z.array(z.object({
    time: z.string().max(40).optional().or(z.literal("")),
    title: z.string().max(200),
    description: z.string().max(500).optional().or(z.literal("")),
  })).max(40).optional(),
  owner_id: z.string().uuid().nullable().optional(),
  invitation_bride_url: z.string().max(800).optional().or(z.literal("")),
  invitation_groom_url: z.string().max(800).optional().or(z.literal("")),
  bride_party_time: z.string().max(120).optional().or(z.literal("")),
  bride_party_venue: z.string().max(200).optional().or(z.literal("")),
  bride_party_address: z.string().max(400).optional().or(z.literal("")),
  groom_party_time: z.string().max(120).optional().or(z.literal("")),
  groom_party_venue: z.string().max(200).optional().or(z.literal("")),
  groom_party_address: z.string().max(400).optional().or(z.literal("")),
});

export const adminUpsertCouple = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => coupleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { ...data };
    if (!payload.wedding_date) payload.wedding_date = null;
    for (const k of ["venue_name","venue_address","story","quote","youtube_url","cover_image","hero_image_1","hero_image_2","hero_image_3","ceremony_time","reception_time","gift_bride_bank","gift_bride_account","gift_bride_holder","gift_groom_bank","gift_groom_account","gift_groom_holder","gift_bride_qr_url","gift_groom_qr_url","invitation_bride_url","invitation_groom_url","bride_party_time","bride_party_venue","bride_party_address","groom_party_time","groom_party_venue","groom_party_address"]) {
      if (payload[k] === "") payload[k] = null;
    }
    if (!payload.schedule) payload.schedule = [];
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
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("vendors").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetVendor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: vendor, error } = await context.supabase.from("vendors").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return { vendor };
  });

const adminVendorSchema = z.object({
  id: z.string().uuid().optional(),
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
  owner_id: z.string().uuid().nullable().optional(),
  is_approved: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

export const adminUpsertVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => adminVendorSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { ...data };
    for (const k of Object.keys(payload)) if (payload[k] === "") payload[k] = null;
    if (!payload.gallery) payload.gallery = [];
    if (payload.id) {
      const id = payload.id; delete payload.id;
      const { error } = await context.supabase.from("vendors").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    delete payload.id;
    const { data: row, error } = await context.supabase.from("vendors").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
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

// ===== Bulk import vendors =====
// Permissive: only `name` is required. Missing fields are kept null so the
// vendor/owner can fill them in later. Slug auto-generated when absent.
const VALID_VENDOR_CATEGORIES = [
  "venue","photography","videography","wedding_planner","makeup","attire",
  "flowers","catering","music","decor","invitation","other",
] as const;

function slugify(input: string): string {
  return input
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "vendor";
}

const bulkVendorItem = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  tagline: z.string().max(240).optional().or(z.literal("")),
  description: z.string().max(6000).optional().or(z.literal("")),
  cover_image: z.string().max(800).optional().or(z.literal("")),
  logo_url: z.string().max(800).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().max(160).optional().or(z.literal("")),
  address: z.string().max(400).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  website: z.string().max(400).optional().or(z.literal("")),
  price_range: z.string().max(80).optional().or(z.literal("")),
  youtube_url: z.string().max(400).optional().or(z.literal("")),
  gallery: z.array(z.string().max(800)).max(30).optional(),
  products: z.array(z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(2000).optional().or(z.literal("")),
    price_text: z.string().max(120).optional().or(z.literal("")),
    image_url: z.string().max(800).optional().or(z.literal("")),
    sort_order: z.number().int().min(0).max(9999).optional(),
    is_active: z.boolean().optional(),
  }).passthrough()).max(50).optional(),
}).passthrough();

export const adminBulkImportVendors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    items: z.array(bulkVendorItem).min(1).max(200),
    auto_approve: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const results: Array<{ row: number; name: string; slug: string; action: "inserted" | "updated" | "error"; error?: string; id?: string }> = [];
    for (let i = 0; i < data.items.length; i++) {
      const raw = data.items[i] as any;
      try {
        const name = String(raw.name).trim();
        let slug = (raw.slug || "").trim();
        if (!slug) slug = slugify(name);
        else slug = slugify(slug);
        const category = VALID_VENDOR_CATEGORIES.includes(raw.category) ? raw.category : "other";
        const payload: any = {
          name,
          slug,
          category,
          tagline: raw.tagline || null,
          description: raw.description || null,
          cover_image: raw.cover_image || null,
          logo_url: raw.logo_url || null,
          phone: raw.phone || null,
          email: raw.email || null,
          address: raw.address || null,
          city: raw.city || null,
          website: raw.website || null,
          price_range: raw.price_range || null,
          youtube_url: raw.youtube_url || null,
          gallery: Array.isArray(raw.gallery) ? raw.gallery.filter(Boolean) : [],
          is_approved: data.auto_approve === true,
        };
        // Upsert by slug
        const { data: existing } = await context.supabase
          .from("vendors").select("id").eq("slug", slug).maybeSingle();
        let vendorId: string;
        let action: "inserted" | "updated";
        if (existing?.id) {
          vendorId = existing.id;
          const { error: upErr } = await context.supabase
            .from("vendors").update(payload).eq("id", vendorId);
          if (upErr) throw new Error(upErr.message);
          action = "updated";
        } else {
          const { data: row, error: insErr } = await context.supabase
            .from("vendors").insert(payload).select("id").single();
          if (insErr) throw new Error(insErr.message);
          vendorId = row!.id;
          action = "inserted";
        }
        // Products (optional)
        if (Array.isArray(raw.products) && raw.products.length > 0) {
          const rows = raw.products
            .filter((p: any) => p && typeof p.title === "string" && p.title.trim())
            .map((p: any, idx: number) => ({
              vendor_id: vendorId,
              title: String(p.title).trim(),
              description: p.description || null,
              price_text: p.price_text || null,
              image_url: p.image_url || null,
              sort_order: typeof p.sort_order === "number" ? p.sort_order : idx,
              is_active: p.is_active === false ? false : true,
            }));
          if (rows.length > 0) {
            // Replace product set for predictability
            await context.supabase.from("vendor_products").delete().eq("vendor_id", vendorId);
            const { error: prodErr } = await context.supabase.from("vendor_products").insert(rows);
            if (prodErr) throw new Error(`Products: ${prodErr.message}`);
          }
        }
        results.push({ row: i + 1, name, slug, action, id: vendorId });
      } catch (e: any) {
        results.push({ row: i + 1, name: raw?.name || "", slug: raw?.slug || "", action: "error", error: String(e?.message || e) });
      }
    }
    const inserted = results.filter(r => r.action === "inserted").length;
    const updated = results.filter(r => r.action === "updated").length;
    const errors = results.filter(r => r.action === "error").length;
    return { results, summary: { total: results.length, inserted, updated, errors } };
  });

const VENDOR_PUBLISHABLE_FIELDS = [
  "name","slug","category","tagline","description","cover_image","logo_url",
  "phone","email","address","city","website","price_range","youtube_url","gallery",
] as const;

export const adminPublishVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: vendor, error } = await context.supabase
      .from("vendors").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!vendor) throw new Error("Không tìm thấy vendor");
    const snapshot: Record<string, any> = {};
    for (const k of VENDOR_PUBLISHABLE_FIELDS) snapshot[k] = (vendor as any)[k] ?? null;
    const { error: upErr } = await context.supabase
      .from("vendors")
      .update({ published_content: snapshot, published_at: new Date().toISOString(), is_approved: true })
      .eq("id", data.id);
    if (upErr) throw new Error(upErr.message);
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

export const adminListWishes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("couple_wishes")
      .select("*, couples(slug, bride_name, groom_name)")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSetWishApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_approved: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("couple_wishes").update({ is_approved: data.is_approved }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteWish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("couple_wishes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("vendor_leads")
      .select("*, vendors(slug, name)")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    status: z.enum(["new","contacted","won","lost"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("vendor_leads").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Vendor categories =====
const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(60).regex(/^[a-z0-9_-]+$/),
  label: z.string().trim().min(1).max(120),
  sort_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("vendor_categories").select("*").order("sort_order").order("label");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { ...data };
    if (payload.id) {
      const id = payload.id; delete payload.id;
      const { error } = await context.supabase.from("vendor_categories").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    delete payload.id;
    const { data: row, error } = await context.supabase.from("vendor_categories").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: cat } = await context.supabase.from("vendor_categories").select("slug").eq("id", data.id).maybeSingle();
    if (cat?.slug) {
      const { count } = await context.supabase.from("vendors").select("id", { count: "exact", head: true }).eq("category", cat.slug);
      if ((count ?? 0) > 0) throw new Error(`Không thể xoá: còn ${count} vendor đang dùng danh mục này`);
    }
    const { error } = await context.supabase.from("vendor_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public read of active categories (for vendor form / filters when shown to owners)
export const listActiveCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("vendor_categories").select("slug,label,sort_order").eq("is_active", true).order("sort_order").order("label");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ===== Couple publish toggle =====
export const adminSetCouplePublish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_published: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("couples").update({ is_published: data.is_published }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });