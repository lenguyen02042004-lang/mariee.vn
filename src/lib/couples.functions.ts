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

const FALLBACK_DEMO_COUPLE = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "demo",
  bride_name: "Thảo My",
  groom_name: "Hoàng Nam",
  wedding_date: "2026-11-28",
  venue_name: "GEM Center — Grand Ballroom",
  venue_address: "08 Nguyễn Bỉnh Khiêm, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
  story: "Mười năm bên nhau, từ những chiều dạo bước dưới tán hoa giấy Sài Gòn cho đến ngày hẹn ước dưới vòm lễ đường lộng lẫy.\n\nChúng mình tin rằng tình yêu đích thực không phải là tìm kiếm một ai đó hoàn hảo, mà là cùng nhau vun đắp những khoảnh khắc đời thường thành điều kỳ diệu vĩnh cửu.\n\nHân hoan chào đón bạn đến chứng kiến và chia sẻ khoảnh khắc thiêng liêng nhất của cuộc đời chúng mình.",
  quote: "Hạnh phúc nhất trên đời là khi tìm được một người muốn cùng bạn già đi theo năm tháng.",
  youtube_url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  hero_image_1: "/assets/hero-luxury-couple.jpg",
  hero_image_2: "/assets/hero-wedding-1.jpg",
  hero_image_3: "/assets/hero-wedding-2.jpg",
  cover_image: "/assets/hero-luxury-couple.jpg",
  invitation_bride_url: "/assets/invitation-bride-luxury.jpg",
  invitation_groom_url: "/assets/invitation-groom-luxury.jpg",
  is_published: true,
  ceremony_time: "17:30",
  reception_time: "18:30",
  gift_bride_bank: "Vietcombank — CN Bến Thành",
  gift_bride_account: "1019888999",
  gift_bride_holder: "LÊ THẢO MY",
  gift_groom_bank: "Techcombank — Hội Sở",
  gift_groom_account: "19036888666",
  gift_groom_holder: "NGUYỄN HOÀNG NAM",
  bride_party_time: "08:30 — 28/11/2026",
  bride_party_venue: "Tư gia Nhà Gái",
  bride_party_address: "128 Nam Kỳ Khởi Nghĩa, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  groom_party_time: "10:30 — 28/11/2026",
  groom_party_venue: "Tư gia Nhà Trai",
  groom_party_address: "45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  theme_style: "champagne",
  initials: "TM · HN",
  schedule: [
    { time: "17:30", title: "Đón tiếp quý khách", description: "Tiệc trà nhẹ ngắm hoàng hôn & chụp ảnh lưu niệm cùng Cô Dâu - Chú Rể" },
    { time: "18:30", title: "Cử hành Lễ Thành Hôn", description: "Nghi thức trao nhẫn thiêng liêng và thề nguyện trọn đời" },
    { time: "19:00", title: "Khai tiệc chiêu đãi", description: "Thưởng thức thực đơn ẩm thực Haute Cuisine hảo hạng" },
    { time: "20:30", title: "First Dance & After Party", description: "Âm nhạc giao hưởng sống, khiêu vũ và những khoảnh khắc bùng nổ tình thân" }
  ],
  dress_code: [
    { name: "Champagne", color: "#ead9c2" },
    { name: "Dusty Rose", color: "#d6a3a7" },
    { name: "Warm Ivory", color: "#f3e7d9" },
    { name: "Burgundy", color: "#762d3c" }
  ],
};

const FALLBACK_DEMO_GALLERY = [
  { id: "g1", image_url: "/assets/gallery-1.jpg", caption: "Khoảnh khắc ngọt ngào bên biển hoàng hôn", sort_order: 1 },
  { id: "g2", image_url: "/assets/gallery-2.jpg", caption: "Nụ cười rạng rỡ của ngày chung đôi", sort_order: 2 },
  { id: "g3", image_url: "/assets/gallery-3.jpg", caption: "Ánh mắt người trao em trọn bình yên", sort_order: 3 },
  { id: "g4", image_url: "/assets/gallery-4.jpg", caption: "Dưới ánh hoàng hôn lãng mạn", sort_order: 4 },
  { id: "g5", image_url: "/assets/gallery-5.jpg", caption: "Lời thề ước trăm năm", sort_order: 5 },
  { id: "g6", image_url: "/assets/gallery-6.jpg", caption: "Hạnh phúc vĩnh cửu", sort_order: 6 },
];

const FALLBACK_DEMO_WISHES = [
  { id: "w1", guest_name: "Phương Thảo & Minh Đức", message: "Chúc hai bạn một đời an yên, cùng nhau vượt qua mọi sóng gió và mãi giữ nụ cười rạng rỡ như ngày hôm nay!", created_at: "2026-10-27T08:00:00Z" },
  { id: "w2", guest_name: "Gia đình Bác Hải", message: "Chúc hai cháu trăm năm hạnh phúc, gia đình êm ấm thuận hòa, sớm đón quý tử!", created_at: "2026-10-27T09:00:00Z" },
  { id: "w3", guest_name: "Hội Bạn Thân Đại Học", message: "Cuối cùng ngày này cũng tới! Chúc cô dâu chú rể trăm năm hòa hợp, mãi ngọt ngào như thuở ban đầu!", created_at: "2026-10-27T10:00:00Z" },
];

export const getCoupleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { data: couple, error } = await supabaseAdmin
        .from("couples").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
      if (!error && couple) {
        const [{ data: gallery }, { data: wishes }] = await Promise.all([
          supabaseAdmin.from("couple_gallery").select("*").eq("couple_id", couple.id).order("sort_order"),
          supabaseAdmin.from("couple_wishes").select("id,guest_name,message,created_at")
            .eq("couple_id", couple.id).eq("is_approved", true)
            .order("created_at", { ascending: false }).limit(50),
        ]);
        return { couple, gallery: gallery ?? [], wishes: wishes ?? [] };
      }
    } catch (err) {
      console.warn("Supabase getCoupleBySlug error:", err);
    }

    if (data.slug === "demo" || data.slug === "hoang-nam-thao-my") {
      return {
        couple: {
          ...FALLBACK_DEMO_COUPLE,
          slug: data.slug,
        },
        gallery: FALLBACK_DEMO_GALLERY,
        wishes: FALLBACK_DEMO_WISHES,
      };
    }

    return null;
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
