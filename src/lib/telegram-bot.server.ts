import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getTelegramCredentials } from "./telegram-config.server";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name?: string; username?: string };
    chat: { id: number };
    text?: string;
    caption?: string;
    photo?: Array<{ file_id: string; file_size?: number; width: number; height: number }>;
    date: number;
  };
}

/**
 * Gửi tin nhắn Telegram phản hồi tới Admin
 */
export async function sendTelegramMessage(text: string, parseMode: "HTML" | "Markdown" = "HTML") {
  const { token, chatId } = await getTelegramCredentials();
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
  } catch (err) {
    console.error("[telegram] send message failed:", err);
  }
}

/**
 * Gửi thông báo tức thời khi có khách gửi RSVP
 */
export async function notifyTelegramNewRsvp(opts: {
  coupleId: string;
  guestName: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  attending: boolean;
  numGuests: number;
  side?: string | null;
  message?: string | null;
}) {
  const { data: couple } = await supabaseAdmin
    .from("couples")
    .select("slug, bride_name, groom_name")
    .eq("id", opts.coupleId)
    .maybeSingle();

  const coupleName = couple ? `${couple.bride_name} & ${couple.groom_name}` : "Cặp đôi";
  const slug = couple?.slug || "demo";
  const sideText = opts.side === "bride" ? "Nhà cô dâu" : opts.side === "groom" ? "Nhà chú rể" : "Khách chung";
  const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const text = [
    `🔔 <b>XÁC NHẬN THAM DỰ (RSVP) MỚI!</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `💍 <b>Cặp đôi:</b> ${coupleName}`,
    `🔗 <b>Trang:</b> /couples/${slug}`,
    `👤 <b>Khách:</b> <b>${opts.guestName}</b>`,
    opts.guestPhone ? `📞 <b>SĐT:</b> ${opts.guestPhone}` : null,
    opts.guestEmail ? `✉️ <b>Email:</b> ${opts.guestEmail}` : null,
    `👥 <b>Tham dự:</b> ${opts.attending ? `✅ CÓ (${opts.numGuests} người)` : "❌ Không thể tham dự"}`,
    `🏛️ <b>Phía:</b> ${sideText}`,
    opts.message ? `💬 <b>Lời nhắn:</b> <i>"${opts.message}"</i>` : null,
    `⏰ <b>Thời gian:</b> ${time}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegramMessage(text);
}

/**
 * Phân tích và trích xuất slug cặp đôi từ tin nhắn
 * Hỗ trợ các định dạng:
 * - https://mariee.vn/couples/hoang-nam-thao-my
 * - http://localhost:3000/couples/demo
 * - /couples/demo
 * - slug: demo
 */
export function extractSlugFromText(text: string): { slug: string | null; cleanText: string } {
  // Regex tìm URL có /couples/<slug>
  const urlRegex = /(?:https?:\/\/[^\s]+)?\/couples\/([a-zA-Z0-9-_]+)/i;
  const match = text.match(urlRegex);
  if (match) {
    const slug = match[1];
    const cleanText = text.replace(match[0], "").trim();
    return { slug, cleanText };
  }

  // Hoặc dạng slug: <slug>
  const slugPrefixRegex = /^slug:\s*([a-zA-Z0-9-_]+)\s*/i;
  const match2 = text.match(slugPrefixRegex);
  if (match2) {
    const slug = match2[1];
    const cleanText = text.replace(match2[0], "").trim();
    return { slug, cleanText };
  }

  return { slug: null, cleanText: text };
}

/**
 * Xử lý lệnh Telegram từ Admin để tạo/chỉnh sửa trang từ xa
 */
export async function processTelegramCommand(text: string, photoFileId?: string): Promise<string> {
  const trimmed = text.trim();

  // 1. Lệnh Help / Hướng dẫn
  if (trimmed === "/start" || trimmed === "/help" || trimmed.toLowerCase() === "help" || trimmed.toLowerCase() === "huong dan") {
    return [
      `👋 <b>TRỢ LÝ QUẢN TRỊ THIỆP CƯỚI MARIÉE</b>`,
      `Bạn có thể điều khiển và chỉnh sửa mọi trang thiệp cưới trực tiếp từ Telegram:`,
      ``,
      `📌 <b>1. Chỉnh sửa theo Link trang:</b>`,
      `<i>Dán link trang kèm nội dung cần đổi:</i>`,
      `• <code>/couples/demo đổi ngày cưới thành 2026-12-25</code>`,
      `• <code>/couples/demo giờ tiệc 19:00</code>`,
      `• <code>/couples/demo giờ lễ 17:30</code>`,
      `• <code>/couples/demo sảnh GEM Center, Grand Ballroom</code>`,
      `• <code>/couples/demo địa chỉ 08 Nguyễn Bỉnh Khiêm, Q1</code>`,
      `• <code>/couples/demo stk chú rể 19036888666 Techcombank Hoàng Nam</code>`,
      `• <code>/couples/demo stk cô dâu 1019888999 Vietcombank Thảo My</code>`,
      `• <code>/couples/demo nhà gái 08:30 tại 128 Nam Kỳ Khởi Nghĩa</code>`,
      `• <code>/couples/demo nhà trai 10:30 tại 45 Lê Duẩn</code>`,
      ``,
      `🚀 <b>2. Duyệt & Công bố:</b>`,
      `• <code>publish /couples/demo</code> (Xuất bản)`,
      `• <code>draft /couples/demo</code> (Chuyển về nháp)`,
      ``,
      `📊 <b>3. Xem danh sách RSVP:</b>`,
      `• <code>rsvp /couples/demo</code>`,
      ``,
      `✨ <b>4. Tạo thiệp mới:</b>`,
      `• <code>Tạo: Chú rể Tuấn Kiệt & Cô dâu Mai Anh, ngày 20/12/2026, sảnh White Palace</code>`,
    ].join("\n");
  }

  // 2. Lệnh Tạo thiệp mới
  if (trimmed.toLowerCase().startsWith("tạo:") || trimmed.toLowerCase().startsWith("tao:")) {
    return await handleCreateCouple(trimmed.slice(4).trim());
  }

  // 3. Trích xuất Slug từ câu lệnh
  const { slug, cleanText } = extractSlugFromText(trimmed);

  if (!slug) {
    return [
      `⚠️ <b>Chưa nhận diện được link trang!</b>`,
      `Vui lòng dán kèm link trang hoặc slug của cặp đôi.`,
      `<i>Ví dụ:</i> <code>/couples/demo đổi giờ tiệc thành 19:00</code>`,
      `Gõ <b>/help</b> để xem toàn bộ danh sách lệnh.`,
    ].join("\n");
  }

  // Tìm cặp đôi trong database
  const { data: couple, error } = await supabaseAdmin
    .from("couples")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !couple) {
    return `❌ Không tìm thấy cặp đôi với slug <b>${slug}</b> trong hệ thống.`;
  }

  const coupleName = `${couple.bride_name} & ${couple.groom_name}`;
  const lowerCmd = cleanText.toLowerCase().trim();

  // 4. Lệnh Xuất bản (Publish)
  if (lowerCmd.includes("publish") || lowerCmd.includes("công bố") || lowerCmd.includes("xuat ban")) {
    await supabaseAdmin.from("couples").update({ is_published: true }).eq("id", couple.id);
    return `🎉 <b>ĐÃ CÔNG BỐ TRANG THIỆP CƯỚI THÀNH CÔNG!</b>\n💍 <b>${coupleName}</b>\n🌐 Link: <code>https://mariee.vn/couples/${slug}</code>`;
  }

  // 5. Lệnh Chuyển về Nháp (Draft)
  if (lowerCmd.includes("draft") || lowerCmd.includes("nháp") || lowerCmd.includes("tạm ẩn") || lowerCmd.includes("an")) {
    await supabaseAdmin.from("couples").update({ is_published: false }).eq("id", couple.id);
    return `🔒 <b>ĐÃ CHUYỂN VỀ BẢN NHÁP</b>\n💍 <b>${coupleName}</b> (/couples/${slug})\nChỉ admin mới xem được link nháp này.`;
  }

  // 6. Lệnh Xem RSVP
  if (lowerCmd.includes("rsvp") || lowerCmd.includes("khách") || lowerCmd.includes("danh sach")) {
    const { data: rsvps } = await supabaseAdmin
      .from("rsvp")
      .select("guest_name, guest_phone, attending, num_guests, side, message, created_at")
      .eq("couple_id", couple.id)
      .order("created_at", { ascending: false });

    const total = rsvps?.length || 0;
    const attendingCount = (rsvps || []).filter(r => r.attending).reduce((s, r) => s + (r.num_guests || 1), 0);

    const listSnippet = (rsvps || []).slice(0, 10).map((r, i) => {
      const icon = r.attending ? "✅" : "❌";
      const side = r.side === "bride" ? "Gái" : r.side === "groom" ? "Trai" : "Chung";
      return `${i + 1}. ${icon} <b>${r.guest_name}</b> (${r.num_guests} khách, ${side}) ${r.guest_phone ? `- ${r.guest_phone}` : ""}`;
    }).join("\n");

    return [
      `📊 <b>BÁO CÁO RSVP: ${coupleName}</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👥 <b>Tổng phản hồi:</b> ${total} lượt`,
      `🎉 <b>Số khách dự kiến:</b> ${attendingCount} người`,
      ``,
      `📋 <b>Khách gần đây nhất:</b>`,
      listSnippet || "<i>Chưa có khách mời gửi phản hồi.</i>",
    ].join("\n");
  }

  // 7. Lệnh Xem thông tin hiện tại
  if (lowerCmd === "info" || lowerCmd === "xem" || lowerCmd === "chi tiet") {
    return [
      `ℹ️ <b>THÔNG TIN THIỆP CƯỚI: ${coupleName}</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `• <b>Slug:</b> /couples/${slug}`,
      `• <b>Trạng thái:</b> ${couple.is_published ? "🟢 Đang công khai" : "🟡 Bản nháp"}`,
      `• <b>Ngày cưới:</b> ${couple.wedding_date || "Chưa đặt"}`,
      `• <b>Tiệc:</b> ${couple.reception_time || "—"} tại ${couple.venue_name || "—"}`,
      `• <b>Địa chỉ:</b> ${couple.venue_address || "—"}`,
      `• <b>Nhà gái:</b> ${couple.bride_party_time || "—"} | ${couple.bride_party_address || "—"}`,
      `• <b>Nhà trai:</b> ${couple.groom_party_time || "—"} | ${couple.groom_party_address || "—"}`,
      `• <b>STK Dâu:</b> ${couple.gift_bride_bank || "—"} ${couple.gift_bride_account || ""}`,
      `• <b>STK Rể:</b> ${couple.gift_groom_bank || "—"} ${couple.gift_groom_account || ""}`,
    ].join("\n");
  }

  // 8. Tự động nhận diện các trường cần cập nhật (Smart Field Extraction)
  const updates: Record<string, any> = {};
  const changedFields: string[] = [];

  // Giờ tiệc (reception_time)
  const recMatch = cleanText.match(/(?:giờ tiệc|tiệc|tiệc cưới|reception)\s*(?:thành|là|:)?\s*(\d{1,2}[:h]\d{2}|\d{1,2}\s*h)/i);
  if (recMatch) {
    updates.reception_time = recMatch[1].replace("h", ":");
    changedFields.push(`• Giờ tiệc: <b>${updates.reception_time}</b>`);
  }

  // Giờ lễ (ceremony_time)
  const cerMatch = cleanText.match(/(?:giờ lễ|lễ cưới|hôn lễ|ceremony)\s*(?:thành|là|:)?\s*(\d{1,2}[:h]\d{2}|\d{1,2}\s*h)/i);
  if (cerMatch) {
    updates.ceremony_time = cerMatch[1].replace("h", ":");
    changedFields.push(`• Giờ lễ: <b>${updates.ceremony_time}</b>`);
  }

  // Ngày cưới (wedding_date)
  const dateMatch = cleanText.match(/(?:ngày cưới|ngày)\s*(?:thành|là|:)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}-\d{2}-\d{2})/i);
  if (dateMatch) {
    const rawDate = dateMatch[1];
    let isoDate = rawDate;
    if (rawDate.includes("/")) {
      const [d, m, y] = rawDate.split("/");
      isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    updates.wedding_date = isoDate;
    changedFields.push(`• Ngày cưới: <b>${rawDate}</b>`);
  }

  // Tên sảnh / trung tâm tiệc (venue_name)
  const venueMatch = cleanText.match(/(?:sảnh|nhà hàng|trung tâm tiệc|venue)\s*(?:thành|là|:)?\s*([^,\n]+)/i);
  if (venueMatch) {
    updates.venue_name = venueMatch[1].trim();
    changedFields.push(`• Sảnh/Địa điểm: <b>${updates.venue_name}</b>`);
  }

  // Địa chỉ tiệc (venue_address)
  const addrMatch = cleanText.match(/(?:địa chỉ|ở|tại)\s*(?:thành|là|:)?\s*([^,\n]+(?:quận|huyện|tp|tỉnh|đường|phường|số)[^,\n]*)/i);
  if (addrMatch) {
    updates.venue_address = addrMatch[1].trim();
    changedFields.push(`• Địa chỉ: <b>${updates.venue_address}</b>`);
  }

  // STK Chú rể
  const stkGroomMatch = cleanText.match(/(?:stk chú rể|stk rể|tài khoản chú rể|tk rể)\s*(?:thành|là|:)?\s*(\d+)(?:\s+([a-zA-Z\s]+))?/i);
  if (stkGroomMatch) {
    updates.gift_groom_account = stkGroomMatch[1].trim();
    if (stkGroomMatch[2]) updates.gift_groom_bank = stkGroomMatch[2].trim();
    changedFields.push(`• STK Chú rể: <b>${updates.gift_groom_account}</b> ${updates.gift_groom_bank ? `(${updates.gift_groom_bank})` : ""}`);
  }

  // STK Cô dâu
  const stkBrideMatch = cleanText.match(/(?:stk cô dâu|stk dâu|tài khoản cô dâu|tk dâu)\s*(?:thành|là|:)?\s*(\d+)(?:\s+([a-zA-Z\s]+))?/i);
  if (stkBrideMatch) {
    updates.gift_bride_account = stkBrideMatch[1].trim();
    if (stkBrideMatch[2]) updates.gift_bride_bank = stkBrideMatch[2].trim();
    changedFields.push(`• STK Cô dâu: <b>${updates.gift_bride_account}</b> ${updates.gift_bride_bank ? `(${updates.gift_bride_bank})` : ""}`);
  }

  // Nhà gái (Lễ Vu Quy)
  const bridePartyMatch = cleanText.match(/(?:nhà gái|vu quy)\s*(?:thành|là|:)?\s*([^,\n]+)/i);
  if (bridePartyMatch) {
    updates.bride_party_address = bridePartyMatch[1].trim();
    changedFields.push(`• Nhà gái: <b>${updates.bride_party_address}</b>`);
  }

  // Nhà trai (Lễ Tân Hôn)
  const groomPartyMatch = cleanText.match(/(?:nhà trai|tân hôn)\s*(?:thành|là|:)?\s*([^,\n]+)/i);
  if (groomPartyMatch) {
    updates.groom_party_address = groomPartyMatch[1].trim();
    changedFields.push(`• Nhà trai: <b>${updates.groom_party_address}</b>`);
  }

  if (Object.keys(updates).length === 0) {
    return [
      `🤔 <b>Chưa nhận diện được nội dung thay đổi!</b>`,
      `Cặp đôi: <b>${coupleName}</b> (<code>/couples/${slug}</code>)`,
      ``,
      `<i>Bạn có thể nhắn mẫu như:</i>`,
      `• <code>/couples/${slug} giờ tiệc 18:30</code>`,
      `• <code>/couples/${slug} sảnh GEM Center</code>`,
      `• <code>/couples/${slug} ngày 28/11/2026</code>`,
      `• <code>/couples/${slug} stk chú rể 19036888666 Techcombank</code>`,
      `• <code>publish /couples/${slug}</code>`,
    ].join("\n");
  }

  // Thực thi cập nhật Supabase
  const { error: updateErr } = await supabaseAdmin
    .from("couples")
    .update(updates)
    .eq("id", couple.id);

  if (updateErr) {
    return `❌ Lỗi khi cập nhật cơ sở dữ liệu: ${updateErr.message}`;
  }

  return [
    `✅ <b>ĐÃ CẬP NHẬT THÀNH CÔNG!</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `💍 <b>${coupleName}</b> (<code>/couples/${slug}</code>)`,
    ...changedFields,
    ``,
    `🌐 <b>Xem ngay:</b> <code>https://mariee.vn/couples/${slug}</code>`,
  ].join("\n");
}

/**
 * Xử lý tạo cặp đôi mới từ tin nhắn thô
 */
async function handleCreateCouple(rawInfo: string): Promise<string> {
  // Trích xuất tên dâu rể
  const nameMatch = rawInfo.match(/(?:chú rể|rể)?\s*([^&,]+?)\s*&\s*(?:cô dâu|dâu)?\s*([^,]+)/i);
  const groomName = nameMatch ? nameMatch[1].trim() : "Chú rể";
  const brideName = nameMatch ? nameMatch[2].trim() : "Cô dâu";

  // Tạo slug ngẫu nhiên hoặc theo tên không dấu
  const cleanName = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

  const slug = `${cleanName(groomName)}-${cleanName(brideName)}-${Date.now().toString().slice(-4)}`;

  // Trích xuất ngày cưới nếu có
  const dateMatch = rawInfo.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}-\d{2}-\d{2})/);
  let weddingDate = "2026-11-28";
  if (dateMatch) {
    const raw = dateMatch[1];
    if (raw.includes("/")) {
      const [d, m, y] = raw.split("/");
      weddingDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    } else {
      weddingDate = raw;
    }
  }

  // Trích xuất địa điểm nếu có
  const venueMatch = rawInfo.match(/(?:sảnh|tại|ở)\s*([^,]+)/i);
  const venueName = venueMatch ? venueMatch[1].trim() : "Trung tâm Hội nghị Tiệc cưới";

  const newRecord = {
    slug,
    bride_name: brideName,
    groom_name: groomName,
    wedding_date: weddingDate,
    venue_name: venueName,
    venue_address: "Địa chỉ tiệc cưới đang được cập nhật",
    ceremony_time: "17:30",
    reception_time: "18:30",
    is_published: false, // Bản nháp chờ bạn duyệt
    story: `Hành trình yêu thương ngọt ngào của ${brideName} & ${groomName}.\n\nCùng nhau vượt qua bao thăng trầm, hôm nay chúng mình hân hoan bước vào lễ đường để bắt đầu một chương mới viên mãn.`,
    quote: "Hạnh phúc nhất là khi tìm được một người cùng ta già đi theo năm tháng.",
    hero_image_1: "/assets/hero-luxury-couple.jpg",
    cover_image: "/assets/hero-luxury-couple.jpg",
  };

  const { data, error } = await supabaseAdmin.from("couples").insert(newRecord).select().single();

  if (error) {
    return `❌ Lỗi tạo trang: ${error.message}`;
  }

  return [
    `🎉 <b>ĐÃ TẠO THIỆP CƯỚI MỚI THÀNH CÔNG (BẢN NHÁP)!</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `💍 <b>${brideName} & ${groomName}</b>`,
    `🔗 <b>Slug:</b> <code>/couples/${slug}</code>`,
    `📅 <b>Ngày cưới:</b> ${weddingDate}`,
    `🏛️ <b>Địa điểm:</b> ${venueName}`,
    `🔒 <b>Trạng thái:</b> Đang ở bản nháp (Draft - chỉ bạn xem được)`,
    ``,
    `👉 <b>Để công bố ra ngoài, bạn chỉ cần gõ:</b>`,
    `<code>publish /couples/${slug}</code>`,
  ].join("\n");
}
