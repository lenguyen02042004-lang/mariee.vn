import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = "https://mariee.vn";
        const staticUrls = ["/", "/vendors", "/blog", "/about", "/for-couples", "/for-vendors"];
        const [{ data: couples }, { data: vendors }, { data: posts }] = await Promise.all([
          supabaseAdmin.from("couples").select("slug, updated_at").eq("is_published", true),
          supabaseAdmin.from("vendors").select("slug, updated_at").eq("is_approved", true).eq("is_hidden_by_owner", false),
          supabaseAdmin.from("blog_posts").select("slug, updated_at").eq("is_published", true),
        ]);
        const urls = [
          ...staticUrls.map(u => `<url><loc>${origin}${u}</loc></url>`),
          ...(couples ?? []).map((c: any) => `<url><loc>${origin}/couples/${c.slug}</loc><lastmod>${c.updated_at}</lastmod></url>`),
          ...(vendors ?? []).map((v: any) => `<url><loc>${origin}/vendors/${v.slug}</loc><lastmod>${v.updated_at}</lastmod></url>`),
          ...(posts ?? []).map((p: any) => `<url><loc>${origin}/blog/${p.slug}</loc><lastmod>${p.updated_at}</lastmod></url>`),
        ].join("");
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});