import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const listCouples = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("couples").select("*").eq("is_published", true)
    .order("wedding_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCoupleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: couple, error } = await supabaseAdmin
      .from("couples").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
    if (error) throw new Error(error.message);
    if (!couple) return null;
    const [{ data: gallery }, { data: wishes }] = await Promise.all([
      supabaseAdmin.from("couple_gallery").select("*").eq("couple_id", couple.id).order("sort_order"),
      supabaseAdmin.from("couple_wishes").select("id,guest_name,message,created_at")
        .eq("couple_id", couple.id).eq("is_approved", true)
        .order("created_at", { ascending: false }).limit(50),
    ]);
    return { couple, gallery: gallery ?? [], wishes: wishes ?? [] };
  });

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    couple_id: z.string().uuid(),
    guest_name: z.string().trim().min(1).max(120),
    guest_phone: z.string().trim().max(30).optional().or(z.literal("")),
    guest_email: z.string().trim().email().max(160).optional().or(z.literal("")),
    attending: z.boolean(),
    num_guests: z.number().int().min(1).max(20),
    message: z.string().trim().max(500).optional().or(z.literal("")),
    side: z.enum(["bride","groom","both"]).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("rsvp").insert({
      couple_id: data.couple_id,
      guest_name: data.guest_name,
      guest_phone: data.guest_phone || null,
      guest_email: data.guest_email || null,
      attending: data.attending,
      num_guests: data.num_guests,
      message: data.message || null,
      side: data.side ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitWish = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    couple_id: z.string().uuid(),
    guest_name: z.string().trim().min(1).max(120),
    message: z.string().trim().min(1).max(500),
  }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("couple_wishes").insert({
      couple_id: data.couple_id, guest_name: data.guest_name, message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
