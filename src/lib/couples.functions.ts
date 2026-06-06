import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { fireEmail, getUserEmailById } from "@/lib/email/send.server";
import { guardPublicSubmit } from "@/lib/anti-spam.server";

async function notifyCoupleOwner(coupleId: string, template: string, data: Record<string, any>) {
  const { data: couple } = await supabaseAdmin
    .from("couples")
    .select("owner_id, bride_name, groom_name")
    .eq("id", coupleId)
    .maybeSingle();
  if (!couple?.owner_id) return;
  const email = await getUserEmailById(couple.owner_id);
  if (!email) return;
  fireEmail({
    templateName: template,
    recipientEmail: email,
    templateData: {
      coupleName: `${couple.bride_name} & ${couple.groom_name}`,
      ...data,
    },
  });
}

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
    _hp: z.string().max(200).optional(),
    _ts: z.number().int().nonnegative().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    await guardPublicSubmit({
      bucket: "rsvp",
      scopeKey: data.couple_id,
      honeypot: { _hp: data._hp, _ts: data._ts },
      limit: 5,
      windowSeconds: 60,
    });
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
    notifyCoupleOwner(data.couple_id, "couple-new-rsvp", {
      guestName: data.guest_name,
      attending: data.attending,
      numGuests: data.num_guests,
      side: data.side,
      message: data.message || undefined,
    }).catch(() => {});
    return { ok: true };
  });

export const submitWish = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    couple_id: z.string().uuid(),
    guest_name: z.string().trim().min(1).max(120),
    message: z.string().trim().min(1).max(500),
    _hp: z.string().max(200).optional(),
    _ts: z.number().int().nonnegative().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    await guardPublicSubmit({
      bucket: "wish",
      scopeKey: data.couple_id,
      honeypot: { _hp: data._hp, _ts: data._ts },
      limit: 5,
      windowSeconds: 60,
    });
    const { error } = await supabaseAdmin.from("couple_wishes").insert({
      couple_id: data.couple_id, guest_name: data.guest_name, message: data.message,
    });
    if (error) throw new Error(error.message);
    notifyCoupleOwner(data.couple_id, "couple-new-wish", {
      guestName: data.guest_name,
      message: data.message,
    }).catch(() => {});
    return { ok: true };
  });
