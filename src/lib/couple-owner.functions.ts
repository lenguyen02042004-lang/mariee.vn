import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().uuid(),
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
  bride_party_time: z.string().max(120).optional().or(z.literal("")),
  bride_party_venue: z.string().max(200).optional().or(z.literal("")),
  bride_party_address: z.string().max(400).optional().or(z.literal("")),
  groom_party_time: z.string().max(120).optional().or(z.literal("")),
  groom_party_venue: z.string().max(200).optional().or(z.literal("")),
  groom_party_address: z.string().max(400).optional().or(z.literal("")),
  invitation_bride_url: z.string().max(800).optional().or(z.literal("")),
  invitation_groom_url: z.string().max(800).optional().or(z.literal("")),
  gift_bride_bank: z.string().max(120).optional().or(z.literal("")),
  gift_bride_account: z.string().max(60).optional().or(z.literal("")),
  gift_bride_holder: z.string().max(120).optional().or(z.literal("")),
  gift_groom_bank: z.string().max(120).optional().or(z.literal("")),
  gift_groom_account: z.string().max(60).optional().or(z.literal("")),
  gift_groom_holder: z.string().max(120).optional().or(z.literal("")),
  schedule: z.array(z.object({
    time: z.string().max(40).optional().or(z.literal("")),
    title: z.string().max(200),
    description: z.string().max(500).optional().or(z.literal("")),
  })).max(40).optional(),
});

async function assertOwner(supabase: any, coupleId: string, userId: string) {
  const { data } = await supabase.from("couples").select("owner_id").eq("id", coupleId).maybeSingle();
  if (!data || data.owner_id !== userId) throw new Error("Bạn không có quyền sửa trang này");
}

export const myCouples = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("couples").select("*").eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyCouple = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, data.id, context.userId);
    const { data: couple } = await context.supabase.from("couples").select("*").eq("id", data.id).maybeSingle();
    const { data: gallery } = await context.supabase.from("couple_gallery").select("*").eq("couple_id", data.id).order("sort_order");
    return { couple, gallery: gallery ?? [] };
  });

export const updateMyCouple = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, data.id, context.userId);
    const payload: any = { ...data };
    if (!payload.wedding_date) payload.wedding_date = null;
    for (const k of Object.keys(payload)) if (payload[k] === "") payload[k] = null;
    if (!payload.schedule) payload.schedule = [];
    const { error } = await context.supabase.from("couples").update(payload).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addMyGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    couple_id: z.string().uuid(),
    image_url: z.string().min(1).max(800),
    caption: z.string().max(300).optional().or(z.literal("")),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, data.couple_id, context.userId);
    const { count } = await context.supabase
      .from("couple_gallery").select("*", { count: "exact", head: true }).eq("couple_id", data.couple_id);
    if ((count ?? 0) >= 30) throw new Error("Tối đa 30 ảnh thư viện");
    const { error } = await context.supabase.from("couple_gallery").insert({
      couple_id: data.couple_id, image_url: data.image_url, caption: data.caption || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMyGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("couple_gallery").select("couple_id").eq("id", data.id).maybeSingle();
    if (row) await assertOwner(context.supabase, row.couple_id, context.userId);
    const { error } = await context.supabase.from("couple_gallery").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyRsvp = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { couple_id: string }) => z.object({ couple_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, data.couple_id, context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("rsvp").select("*").eq("couple_id", data.couple_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const deleteMyRsvp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await supabaseAdmin.from("rsvp").select("couple_id").eq("id", data.id).maybeSingle();
    if (!row) throw new Error("Không tìm thấy");
    await assertOwner(context.supabase, row.couple_id, context.userId);
    const { error } = await supabaseAdmin.from("rsvp").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const createSchema = z.object({
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số, dấu '-'"),
  bride_name: z.string().trim().min(1).max(120),
  groom_name: z.string().trim().min(1).max(120),
  wedding_date: z.string().optional().or(z.literal("")),
});

export const createMyCouple = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    // Kiểm tra slug đã tồn tại chưa (bypass RLS để biết chắc)
    const { data: existing } = await supabaseAdmin
      .from("couples").select("id").eq("slug", data.slug).maybeSingle();
    if (existing) throw new Error("Slug đã được sử dụng, vui lòng chọn slug khác");
    // Dùng admin client vì chưa có RLS insert cho owner
    const { data: row, error } = await supabaseAdmin.from("couples").insert({
      slug: data.slug,
      bride_name: data.bride_name,
      groom_name: data.groom_name,
      wedding_date: data.wedding_date || null,
      owner_id: context.userId,
      is_published: false,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });
