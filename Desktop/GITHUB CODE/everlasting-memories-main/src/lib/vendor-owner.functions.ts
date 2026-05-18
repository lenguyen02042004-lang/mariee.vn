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
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().max(160).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  website: z.string().max(400).optional().or(z.literal("")),
  price_range: z.string().max(80).optional().or(z.literal("")),
  youtube_url: z.string().max(400).optional().or(z.literal(""))
    .refine((value) => !value || /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]+$/.test(value), {
      message: "Link YouTube phải ở dạng https://www.youtube.com/embed/VIDEO_ID",
    }),
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
        const { data: row, error: fetchErr } = await context.supabase.from("vendors").select("*").eq("id", existing.id).maybeSingle();
        if (fetchErr) throw new Error(fetchErr.message);
        return row;
    }
      const { data: row, error } = await context.supabase.from("vendors").insert(payload).select("*").single();
      if (error) throw new Error(error.message);
      return row;
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
    const { data: updated, error: upErr } = await context.supabase
      .from("vendors")
      .update({ published_content: snapshot, published_at: new Date().toISOString() })
      .eq("id", vendor.id)
      .select("*")
      .maybeSingle();
    if (upErr) throw new Error(upErr.message);
    return updated;
  });