import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const listPlans = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ audience: z.enum(["vendor", "couple"]).optional() }).parse(d ?? {}))
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("vendor_plans" as any).select("*").eq("is_active", true).order("sort_order");
    if (data.audience) q = q.eq("audience", data.audience);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as any[];
  });

export const getPaymentSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin.from("payment_settings" as any).select("*").eq("id", 1).maybeSingle();
  return data as any;
});

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin.from("site_settings" as any).select("*").eq("id", 1).maybeSingle();
  return data as any;
});