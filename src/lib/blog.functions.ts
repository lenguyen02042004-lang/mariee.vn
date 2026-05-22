import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const CategorySlug = z.string().trim().min(1).max(60).regex(/^[a-z0-9-_]+$/);

export type BlogCategory = { id: string; slug: string; name: string; sort_order: number };

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (!(data ?? []).some((r: any) => r.role === "admin")) throw new Error("Forbidden: cần quyền quản trị");
}

export const listBlogCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("blog_categories" as any).select("*").order("sort_order").order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as BlogCategory[];
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: CategorySlug,
  name: z.string().trim().min(1).max(120),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const adminUpsertBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = { slug: data.slug, name: data.name, sort_order: data.sort_order };
    if (data.id) {
      const { error } = await context.supabase.from("blog_categories" as any).update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: ins, error } = await context.supabase.from("blog_categories" as any).insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (ins as any).id };
  });

export const adminDeleteBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blog_categories" as any).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listBlogPosts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({
      page: z.number().int().min(1).max(1000).default(1),
      pageSize: z.number().int().min(1).max(48).default(9),
      category: CategorySlug.optional().nullable(),
    }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_image,category,author_name,published_at,views", { count: "exact" })
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(from, to);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);
    return { items: rows ?? [], total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const getBlogPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(160) }).parse(d))
  .handler(async ({ data }) => {
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return null;
    // best-effort view counter
    supabaseAdmin.from("blog_posts").update({ views: (post.views ?? 0) + 1 }).eq("id", post.id).then(() => {});
    const { data: related } = await supabaseAdmin
      .from("blog_posts").select("id,slug,title,cover_image,published_at,category")
      .eq("is_published", true).eq("category", post.category).neq("id", post.id)
      .order("published_at", { ascending: false }).limit(3);
    return { post, related: related ?? [] };
  });

// ---------- Admin ----------
const postSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/, "Slug chỉ gồm a-z, 0-9, dấu gạch"),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().max(50000).optional().or(z.literal("")),
  cover_image: z.string().max(2000).optional().or(z.literal("")),
  category: CategorySlug,
  author_name: z.string().trim().max(120).optional().or(z.literal("")),
  is_published: z.boolean().default(true),
  published_at: z.string().optional().or(z.literal("")),
});

export const adminListBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("blog_posts").select("*").order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetBlogPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase.from("blog_posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpsertBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => postSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: any = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      content: data.content || null,
      cover_image: data.cover_image || null,
      category: data.category,
      author_name: data.author_name || null,
      is_published: data.is_published,
    };
    if (data.published_at) payload.published_at = data.published_at;
    if (data.id) {
      const { error } = await context.supabase.from("blog_posts").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: ins, error } = await context.supabase.from("blog_posts").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });