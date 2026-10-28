import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createCoupleGoogleSheet } from "./google-sheets.server";
import { sendTelegramMessage } from "./telegram-bot.server";

function cleanSlug(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadBase64ToStorage(base64Data: string, filenamePrefix: string): Promise<string | null> {
  try {
    const match = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) return null;

    const mimeType = match[1];
    const base64Content = match[2];
    const buffer = Buffer.from(base64Content, "base64");
    const ext = mimeType.split("/")[1] || "jpg";
    const filePath = `intake/${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from("wedding-media")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("[intake] upload error:", error);
      return null;
    }

    const { data } = supabaseAdmin.storage.from("wedding-media").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("[intake] uploadBase64 exception:", err);
    return null;
  }
}

export const submitCoupleIntake = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        bride_name: z.string().trim().min(1, "Vui lòng nhập tên cô dâu"),
        groom_name: z.string().trim().min(1, "Vui lòng nhập tên chú rể"),
        contact_phone: z.string().trim().min(8, "Vui lòng nhập số điện thoại hoặc Zalo liên hệ"),
        wedding_date: z.string().optional().or(z.literal("")),
        venue_name: z.string().optional().or(z.literal("")),
        venue_address: z.string().optional().or(z.literal("")),
        album_url: z.string().optional().or(z.literal("")),
        invitation_image_base64: z.string().optional().or(z.literal("")),
        hero_image_base64: z.string().optional().or(z.literal("")),
        gift_bank: z.string().optional().or(z.literal("")),
        gift_account: z.string().optional().or(z.literal("")),
        gift_holder: z.string().optional().or(z.literal("")),
        notes: z.string().optional().or(z.literal("")),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const groomSlug = cleanSlug(data.groom_name) || "chu-re";
    const brideSlug = cleanSlug(data.bride_name) || "co-dau";
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${groomSlug}-${brideSlug}-${randomSuffix}`;
    const coupleName = `${data.bride_name} & ${data.groom_name}`;

    // 1. Upload ảnh nếu có
    let invitationUrl: string | null = null;
    let heroUrl: string | null = null;

    if (data.invitation_image_base64 && data.invitation_image_base64.startsWith("data:image")) {
      invitationUrl = await uploadBase64ToStorage(data.invitation_image_base64, `${slug}-invitation`);
    }

    if (data.hero_image_base64 && data.hero_image_base64.startsWith("data:image")) {
      heroUrl = await uploadBase64ToStorage(data.hero_image_base64, `${slug}-hero`);
    }

    // 2. Tự động tạo Google Sheet riêng trong Google Drive của Admin
    let sheetUrl = "";
    try {
      sheetUrl = (await createCoupleGoogleSheet(coupleName, slug)) || "";
    } catch (err: any) {
      console.warn("[intake] create sheet warning:", err.message);
    }

    // 3. Chuẩn bị dữ liệu lưu vào database Supabase (is_published = false để admin duyệt)
    const storyText = [
      data.album_url ? `📸 Link Album cưới: ${data.album_url}` : "",
      data.notes ? `📝 Ghi chú từ dâu rể: ${data.notes}` : "",
      data.contact_phone ? `📞 SĐT / Zalo dâu rể: ${data.contact_phone}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const defaultHero = heroUrl || "/assets/hero-luxury-couple.jpg";

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("couples")
      .insert({
        slug,
        bride_name: data.bride_name,
        groom_name: data.groom_name,
        wedding_date: data.wedding_date || "2026-11-28",
        venue_name: data.venue_name || "Trung tâm Hội nghị Tiệc cưới",
        venue_address: data.venue_address || "Địa chỉ chi tiết đang cập nhật",
        ceremony_time: "17:30",
        reception_time: "18:30",
        hero_image_1: defaultHero,
        cover_image: defaultHero,
        invitation_bride_url: invitationUrl || null,
        gift_groom_bank: data.gift_bank || null,
        gift_groom_account: data.gift_account || null,
        gift_groom_holder: data.gift_holder || null,
        story: storyText,
        quote: "Hạnh phúc lớn nhất là cùng nhau già đi theo năm tháng.",
        is_published: false,
      })
      .select()
      .single();

    if (insErr) {
      console.error("[intake] insert couple error:", insErr);
      throw new Error(`Lỗi tạo trang: ${insErr.message}`);
    }

    // 4. Gửi thông báo tức thời tới Telegram của Admin
    const telegramMessage = [
      `🎉 <b>CÓ DÂU RỂ VỪA GỬI THÔNG TIN THIẾT KẾ THIỆP!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `💍 <b>${coupleName}</b>`,
      `📱 <b>SĐT / Zalo:</b> <code>${data.contact_phone}</code>`,
      data.wedding_date ? `📅 <b>Ngày cưới:</b> ${data.wedding_date}` : `📅 <b>Ngày cưới:</b> <i>(Xem trên ảnh thiệp)</i>`,
      data.venue_name ? `🏛️ <b>Địa điểm:</b> ${data.venue_name}` : "",
      data.venue_address ? `📍 <b>Địa chỉ:</b> ${data.venue_address}` : "",
      ``,
      invitationUrl ? `🖼️ <b>Ảnh thiệp cưới:</b> <a href="${invitationUrl}">Bấm xem ảnh thiệp</a>` : `🖼️ <b>Ảnh thiệp cưới:</b> <i>Chưa tải</i>`,
      data.album_url ? `📸 <b>Link Album ảnh:</b> <a href="${data.album_url}">${data.album_url}</a>` : `📸 <b>Link Album ảnh:</b> <i>Chưa gửi</i>`,
      heroUrl ? `✨ <b>Ảnh bìa chọn sẵn:</b> <a href="${heroUrl}">Bấm xem ảnh</a>` : "",
      data.notes ? `📝 <b>Ghi chú:</b> <i>"${data.notes}"</i>` : "",
      data.gift_account ? `💳 <b>STK:</b> ${data.gift_account} (${data.gift_bank || ""} - ${data.gift_holder || ""})` : "",
      ``,
      sheetUrl ? `📊 <b>Google Sheet đã tạo:</b>\n<code>${sheetUrl}</code>` : `📊 <b>Google Sheet:</b> <i>Đang khởi tạo</i>`,
      `🔗 <b>Link xem thử bản nháp:</b>\n<code>https://mariee.vn/couples/${slug}</code>`,
      ``,
      `👉 <b>Khi kiểm tra ưng ý, bạn chỉ cần nhắn bot:</b>`,
      `<code>duyệt thiệp ${slug}</code>`,
    ]
      .filter(Boolean)
      .join("\n");

    await sendTelegramMessage(telegramMessage);

    return {
      ok: true,
      slug,
      couple_name: coupleName,
      sheet_url: sheetUrl,
      preview_url: `/couples/${slug}`,
    };
  });
