import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

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
    return { ...vendor, ...((vendor as any).published_content ?? {}) };
  });
