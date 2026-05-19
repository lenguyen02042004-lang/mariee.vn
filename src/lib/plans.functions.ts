import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("vendor_plans" as any)
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as any[];
});

export const getPaymentSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin.from("payment_settings" as any).select("*").eq("id", 1).maybeSingle();
  return data as any;
});