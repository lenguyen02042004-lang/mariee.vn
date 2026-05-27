import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["couple", "vendor"]),
  display_name: z.string().trim().min(1).max(120).optional(),
});

function slugifyBase(name: string) {
  const base = (name || "user").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "user";
  return base;
}

async function uniqueSlug(table: "couples" | "vendors", base: string) {
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const { data } = await supabaseAdmin.from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Idempotent: gán role cho user nếu chưa có và tạo bản nháp couple/vendor nếu chưa tồn tại.
 * Gọi sau khi đăng ký (email/password hoặc Google OAuth lần đầu).
 */
export const assignSignupRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const display = data.display_name?.trim() || "Người dùng";

    // 1. Đảm bảo role tồn tại
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles").select("id").eq("user_id", userId).eq("role", data.role).maybeSingle();
    if (!existingRole) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role });
    }

    // 2. Tạo bản nháp nếu chưa có
    if (data.role === "couple") {
      const { data: existing } = await supabaseAdmin
        .from("couples").select("id, slug").eq("owner_id", userId).maybeSingle();
      if (existing) return { ok: true, slug: existing.slug, role: data.role };
      const slug = await uniqueSlug("couples", slugifyBase(display));
      const { error } = await supabaseAdmin.from("couples").insert({
        owner_id: userId,
        slug,
        bride_name: display,
        groom_name: "Tên chú rể",
        is_published: false,
      });
      if (error) throw new Error(error.message);
      return { ok: true, slug, role: data.role };
    } else {
      const { data: existing } = await supabaseAdmin
        .from("vendors").select("id, slug").eq("owner_id", userId).maybeSingle();
      if (existing) return { ok: true, slug: existing.slug, role: data.role };
      const slug = await uniqueSlug("vendors", slugifyBase(display));
      const { error } = await supabaseAdmin.from("vendors").insert({
        owner_id: userId,
        slug,
        name: display,
        category: "other",
        is_approved: false,
      });
      if (error) throw new Error(error.message);
      return { ok: true, slug, role: data.role };
    }
  });