import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

let env = {};
if (fs.existsSync('.env')) {
  try {
    env = Object.fromEntries(
      fs.readFileSync('.env', 'utf-8')
        .split('\n')
        .filter(l => l.includes('=') && !l.startsWith('#'))
        .map(l => {
          const idx = l.indexOf('=');
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
        })
    );
  } catch {}
}

const token = process.env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_CHAT_ID || env.TELEGRAM_CHAT_ID;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!token || !adminChatId || !supabaseUrl || !supabaseKey) {
  console.error("Missing required environment variables for Telegram listener.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🚀 Mariee Telegram Bot Listener is active...");
console.log(`Listening for commands from adminChatId: ${adminChatId}`);

async function sendTelegram(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    console.error("Error sending to telegram:", err);
  }
}

function extractSlug(text) {
  // 1. URL pattern: /couples/<slug>
  const urlRegex = /(?:https?:\/\/[^\s]+)?\/couples\/([a-zA-Z0-9-_]+)/i;
  const match = text.match(urlRegex);
  if (match) {
    return { slug: match[1], cleanText: text.replace(match[0], "").trim() };
  }

  // 2. Pattern: thiệp <slug> hoặc trang <slug> hoặc cặp đôi <slug> hoặc slug: <slug>
  const phraseRegex = /(?:thiệp|thiep|trang|cặp đôi|cap doi|slug:?)\s+([a-zA-Z0-9-_]+)/i;
  const match2 = text.match(phraseRegex);
  if (match2) {
    return { slug: match2[1], cleanText: text.replace(match2[0], "").trim() };
  }

  // 3. Fallback: Nếu câu chứa lệnh + slug (ví dụ: "duyệt demo", "ẩn demo", "xem demo", "bàn giao demo", "tạo sheet demo")
  const singleSlugRegex = /(?:duyệt|duyet|công bố|cong bo|xuất bản|xuat ban|lên sóng|len song|ẩn|an|tạm ẩn|tam an|nháp|nhap|khách|khach|rsvp|xem|info|bàn giao|ban giao|tin nhắn|tin nhan|gửi khách|gui khach|tạo sheet|tao sheet|sinh sheet|cấp sheet|cap sheet|link sheet|sheet)\s+([a-zA-Z0-9-_]+)/i;
  const match3 = text.match(singleSlugRegex);
  if (match3) {
    return { slug: match3[1], cleanText: text.replace(match3[1], "").trim() };
  }

  return { slug: null, cleanText: text };
}

async function handleCommand(text) {
  const trimmed = text.trim();

  // 1. HELP (Tiếng Việt tự nhiên 100%)
  if (trimmed === "/start" || trimmed === "/help" || /(hướng dẫn|huong dan|lệnh|lenh|trợ giúp|tro giup|help)/i.test(trimmed)) {
    return [
      `👋 <b>TRỢ LÝ QUẢN TRỊ MARIÉE.VN</b>`,
      `Chào bạn, bạn có thể ra lệnh hoàn toàn bằng tiếng Việt tự nhiên:`,
      ``,
      `🚀 <b>1. DUYỆT & CÔNG BỐ THIỆP (LÊN SÓNG):</b>`,
      `• <code>duyệt thiệp demo</code>`,
      `• <code>công bố thiệp demo</code>`,
      `• <code>cho thiệp demo lên sóng</code>`,
      `• <i>(Hoặc dán link: <code>duyệt https://mariee.vn/couples/demo</code>)</i>`,
      ``,
      `🔒 <b>2. TẠM ẨN THIỆP (VỀ BẢN NHÁP):</b>`,
      `• <code>ẩn thiệp demo</code>`,
      `• <code>tạm ẩn thiệp demo</code>`,
      `• <code>chuyển demo về nháp</code>`,
      ``,
      `✏️ <b>3. SỬA THÔNG TIN BẤT KỲ:</b>`,
      `• <code>thiệp demo đổi giờ tiệc 19h30</code>`,
      `• <code>thiệp demo đổi ngày 25/12/2026</code>`,
      `• <code>thiệp demo sảnh GEM Center, Grand Ballroom</code>`,
      `• <code>thiệp demo địa chỉ 08 Nguyễn Bỉnh Khiêm, Q1</code>`,
      `• <code>thiệp demo stk chú rể 19036888666 Techcombank Hoàng Nam</code>`,
      `• <code>thiệp demo stk cô dâu 1019888999 Vietcombank Thảo My</code>`,
      `• <code>thiệp demo nhà gái 08:30 tại 128 Nam Kỳ Khởi Nghĩa</code>`,
      `• <code>thiệp demo nhà trai 10:30 tại 45 Lê Duẩn</code>`,
      ``,
      `📊 <b>4. XEM DANH SÁCH KHÁCH ĐÃ BÁO ĐI:</b>`,
      `• <code>xem khách thiệp demo</code>`,
      `• <code>danh sách thiệp demo</code>`,
      ``,
      `ℹ️ <b>5. XEM CHI TIẾT THIỆP CƯỚI:</b>`,
      `• <code>xem thiệp demo</code>`,
      ``,
      `✨ <b>6. TẠO THIỆP MỚI TỰ ĐỘNG:</b>`,
      `• <code>Tạo: Chú rể Tuấn Kiệt & Cô dâu Mai Anh, ngày 20/12/2026, sảnh White Palace</code>`,
      ``,
      `💡 <b>7. TRAO ĐỔI Ý TƯỞNG THIẾT KẾ & CODE:</b>`,
      `• <i>Nhắn bất kỳ yêu cầu nào (ví dụ: "Cần thêm đồng hồ đếm ngược ngày cưới"), bot sẽ tự lưu vào nhật ký phát triển dự án!</i>`,
    ].join("\n");
  }

  // 2. CREATE NEW
  if (trimmed.toLowerCase().startsWith("tạo:") || trimmed.toLowerCase().startsWith("tao:")) {
    const raw = trimmed.slice(4).trim();
    const nameMatch = raw.match(/(?:chú rể|rể)?\s*([^&,]+?)\s*&\s*(?:cô dâu|dâu)?\s*([^,]+)/i);
    const groomName = nameMatch ? nameMatch[1].trim() : "Chú rể";
    const brideName = nameMatch ? nameMatch[2].trim() : "Cô dâu";

    const clean = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const slug = `${clean(groomName)}-${clean(brideName)}-${Date.now().toString().slice(-4)}`;

    const dateMatch = raw.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}-\d{2}-\d{2})/);
    let weddingDate = "2026-11-28";
    if (dateMatch) {
      const p = dateMatch[1];
      if (p.includes("/")) {
        const [d, m, y] = p.split("/");
        weddingDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      } else {
        weddingDate = p;
      }
    }

    const venueMatch = raw.match(/(?:sảnh|tại|ở)\s*([^,]+)/i);
    const venueName = venueMatch ? venueMatch[1].trim() : "Trung tâm Hội nghị Tiệc cưới";

    const { error: insErr } = await supabase.from("couples").insert({
      slug,
      bride_name: brideName,
      groom_name: groomName,
      wedding_date: weddingDate,
      venue_name: venueName,
      venue_address: "Địa chỉ tiệc cưới đang cập nhật",
      ceremony_time: "17:30",
      reception_time: "18:30",
      is_published: false,
      story: `Hành trình yêu thương ngọt ngào của ${brideName} & ${groomName}.\n\nCùng nhau vượt qua bao thăng trầm, hôm nay chúng mình hân hoan bước vào lễ đường để bắt đầu một chương mới viên mãn.`,
      quote: "Hạnh phúc nhất là khi tìm được một người cùng ta già đi theo năm tháng.",
      hero_image_1: "/assets/hero-luxury-couple.jpg",
      cover_image: "/assets/hero-luxury-couple.jpg",
    });

    if (insErr) return `❌ Lỗi tạo trang: ${insErr.message}`;

    // Tự động tạo Google Sheet riêng cho cặp đôi mới
    let createdSheetUrl = "";
    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const gRes = await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_sheet",
            couple_name: `${groomName} & ${brideName}`,
            slug,
            folder_id: process.env.GOOGLE_DRIVE_FOLDER_ID || undefined,
          }),
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === "ok" && gData.sheet_url) {
            createdSheetUrl = gData.sheet_url;
            const mapFile = "src/data/couple_sheets.json";
            let map = {};
            try { map = JSON.parse(fs.readFileSync(mapFile, "utf-8")); } catch {}
            map[slug] = createdSheetUrl;
            fs.writeFileSync(mapFile, JSON.stringify(map, null, 2), "utf-8");
          }
        }
      } catch (err) {
        console.warn("Auto create sheet error:", err.message);
      }
    }

    return [
      `🎉 <b>ĐÃ TẠO THIỆP CƯỚI & TỰ ĐỘNG TẠO GOOGLE SHEET!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `💍 <b>${brideName} & ${groomName}</b>`,
      `🔗 <b>Link thiệp:</b> <code>https://mariee.vn/couples/${slug}</code>`,
      createdSheetUrl ? `📊 <b>Google Sheet:</b> <code>${createdSheetUrl}</code>` : `📊 <b>Google Sheet:</b> <i>Dùng sheet mặc định</i>`,
      `📅 <b>Ngày cưới:</b> ${weddingDate}`,
      `🏛️ <b>Địa điểm:</b> ${venueName}`,
      `🔒 <b>Trạng thái:</b> Bản nháp (Đã liên kết tự động)`,
      ``,
      `👉 <b>Để duyệt lên sóng, bạn nhắn:</b> <code>duyệt thiệp ${slug}</code>`,
      `👉 <b>Để lấy tin nhắn gửi dâu rể:</b> <code>bàn giao thiệp ${slug}</code>`,
    ].join("\n");
  }

  // 3. EXTRACT SLUG
  const { slug, cleanText } = extractSlug(trimmed);
  if (!slug) {
    // Nếu là tin nhắn trao đổi công việc, thiết kế hoặc ghi chú code:
    const worklogFile = "DEV_WORKLOG.md";
    const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const logEntry = `\n### [${timestamp}] Yêu cầu từ Telegram:\n- ${trimmed}\n`;
    fs.appendFileSync(worklogFile, logEntry, "utf-8");

    return [
      `📝 <b>ĐÃ GHI NHẬN YÊU CẦU CÔNG VIỆC!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `💬 <b>Nội dung:</b> <i>"${trimmed}"</i>`,
      `⏰ <b>Thời gian:</b> ${timestamp}`,
      `💾 <i>Đã lưu vào nhật ký phát triển dự án (DEV_WORKLOG.md).</i>`,
      ``,
      `✨ Khi bạn mở máy tính làm việc, trợ lý Antigravity sẽ đọc yêu cầu này và triển khai code ngay cho bạn!`,
      `<i>(Nếu muốn sửa thiệp cưới cụ thể, bạn nhớ dán link trang ví dụ: <code>thiệp demo đổi giờ tiệc 19:30</code>)</i>`,
    ].join("\n");
  }

  const { data: couple, error: cErr } = await supabase.from("couples").select("*").eq("slug", slug).maybeSingle();
  if (cErr || !couple) {
    return `❌ Không tìm thấy cặp đôi với slug <b>${slug}</b> trong hệ thống.`;
  }

  const coupleName = `${couple.bride_name} & ${couple.groom_name}`;
  const lowerCmd = cleanText.toLowerCase().trim();

  // 4. DUYỆT & CÔNG BỐ (LÊN SÓNG)
  const isPublish = /(duyệt|duyet|công bố|cong bo|xuất bản|xuat ban|lên sóng|len song|mở trang|mo trang|publish|cho chạy)/i.test(lowerCmd);
  if (isPublish) {
    await supabase.from("couples").update({ is_published: true }).eq("id", couple.id);
    return `🎉 <b>ĐÃ DUYỆT & CÔNG BỐ THIỆP CƯỚI!</b>\n💍 <b>${coupleName}</b>\n🌐 Link chính thức: <code>https://mariee.vn/couples/${slug}</code>`;
  }

  // 5. ẨN & VỀ NHÁP
  const isDraft = /(ẩn|an|tạm ẩn|tam an|nháp|nhap|về nháp|ve nhap|khóa|khoa|tạm dừng|tam dung|đóng|dong|draft)/i.test(lowerCmd);
  if (isDraft) {
    await supabase.from("couples").update({ is_published: false }).eq("id", couple.id);
    return `🔒 <b>ĐÃ TẠM ẨN THIỆP CƯỚI VỀ BẢN NHÁP</b>\n💍 <b>${coupleName}</b> (/couples/${slug})\nKhách ngoài không xem được link này nữa.`;
  }

  // 6. XEM KHÁCH / RSVP
  const isRsvp = /(rsvp|khách|khach|danh sách|danh sach|ai đi|ai di|ai tham dự|ai tham du|bao nhiêu người)/i.test(lowerCmd);
  if (isRsvp) {
    const { data: rsvps } = await supabase.from("rsvp").select("*").eq("couple_id", couple.id).order("created_at", { ascending: false });
    const total = rsvps?.length || 0;
    const attending = (rsvps || []).filter(r => r.attending).reduce((s, r) => s + (r.num_guests || 1), 0);
    const snippet = (rsvps || []).slice(0, 10).map((r, i) => {
      const icon = r.attending ? "✅" : "❌";
      const side = r.side === "bride" ? "Gái" : r.side === "groom" ? "Trai" : "Chung";
      return `${i + 1}. ${icon} <b>${r.guest_name}</b> (${r.num_guests} khách, ${side}) ${r.guest_phone ? `- ${r.guest_phone}` : ""}`;
    }).join("\n");

    return [
      `📊 <b>DANH SÁCH KHÁCH THAM DỰ: ${coupleName}</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👥 <b>Tổng phản hồi:</b> ${total} lượt`,
      `🎉 <b>Khách chắc chắn tham dự:</b> ${attending} người`,
      ``,
      `📋 <b>Khách mới nhất:</b>`,
      snippet || "<i>Chưa có khách mời phản hồi.</i>",
    ].join("\n");
  }

  // Đọc link sheet riêng của cặp đôi nếu có
  let coupleSheetUrl = "";
  try {
    const map = JSON.parse(fs.readFileSync("src/data/couple_sheets.json", "utf-8"));
    coupleSheetUrl = map[slug] || "";
  } catch {}

  // Gán link Google Sheet riêng cho cặp đôi
  const sheetMatch = cleanText.match(/(?:link sheet|sheet|bảng tính|google sheet)\s*(?:thành|là|:)?\s*(https?:\/\/[^\s]+)/i);
  if (sheetMatch) {
    const sheetUrl = sheetMatch[1].trim();
    const mapFile = "src/data/couple_sheets.json";
    let map = {};
    try { map = JSON.parse(fs.readFileSync(mapFile, "utf-8")); } catch {}
    map[slug] = sheetUrl;
    fs.writeFileSync(mapFile, JSON.stringify(map, null, 2), "utf-8");
    return [
      `✅ <b>ĐÃ LƯU LINK GOOGLE SHEET CHO CẶP ĐÔI!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `💍 <b>${coupleName}</b> (/couples/${slug})`,
      `📊 <b>Google Sheet:</b> <code>${sheetUrl}</code>`,
      ``,
      `💌 <b>TIN NHẮN MẪU BÀN GIAO GỬI DÂU RỂ (CHẠM ĐỂ COPY):</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `Chào ${couple.groom_name} & ${couple.bride_name},`,
      `Mariée xin gửi hai bạn link thiệp cưới online và bảng theo dõi khách mời riêng của hai bạn:`,
      ``,
      `💍 <b>Thiệp cưới online:</b>`,
      `https://mariee.vn/couples/${slug}`,
      ``,
      `📊 <b>Bảng theo dõi khách mời (Google Sheets):</b>`,
      `${sheetUrl}`,
      ``,
      `<i>(Mỗi khi khách gửi xác nhận tham dự, thông tin sẽ tự động nhảy vào link Google Sheet trên theo thời gian thực để hai bạn tiện theo dõi xếp bàn tiệc nhé!)</i>`,
    ].join("\n");
  }

  // 6.5 TỰ ĐỘNG TẠO GOOGLE SHEET CHO CẶP ĐÔI
  const isCreateSheetCmd = /(tạo sheet|tao sheet|sinh sheet|cấp sheet|cap sheet)/i.test(lowerCmd);
  if (isCreateSheetCmd) {
    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const gRes = await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_sheet",
            couple_name: coupleName,
            slug,
            folder_id: process.env.GOOGLE_DRIVE_FOLDER_ID || undefined,
          }),
        });
        const gData = await gRes.json();
        if (gData.status === "ok" && gData.sheet_url) {
          coupleSheetUrl = gData.sheet_url;
          const mapFile = "src/data/couple_sheets.json";
          let map = {};
          try { map = JSON.parse(fs.readFileSync(mapFile, "utf-8")); } catch {}
          map[slug] = coupleSheetUrl;
          fs.writeFileSync(mapFile, JSON.stringify(map, null, 2), "utf-8");

          return [
            `🎉 <b>ĐÃ TỰ ĐỘNG TẠO GOOGLE SHEET RIÊNG CHO CẶP ĐÔI!</b>`,
            `━━━━━━━━━━━━━━━━━━`,
            `💍 <b>${coupleName}</b> (/couples/${slug})`,
            `📊 <b>Google Sheet:</b> <code>${coupleSheetUrl}</code>`,
            `🔓 <b>Quyền xem:</b> Tự động bật quyền xem công khai (Không bị hạn chế)`,
            ``,
            `💌 <b>TIN NHẮN MẪU BÀN GIAO GỬI DÂU RỂ (CHẠM ĐỂ COPY):</b>`,
            `━━━━━━━━━━━━━━━━━━`,
            `Chào ${couple.groom_name} & ${couple.bride_name},`,
            `Mariée xin gửi hai bạn link thiệp cưới online và bảng theo dõi khách mời riêng của hai bạn:`,
            ``,
            `💍 <b>Thiệp cưới online:</b>`,
            `https://mariee.vn/couples/${slug}`,
            ``,
            `📊 <b>Bảng theo dõi khách mời (Google Sheets):</b>`,
            `${coupleSheetUrl}`,
            ``,
            `<i>(Mỗi khi khách gửi xác nhận tham dự, thông tin sẽ tự động nhảy vào link Google Sheet trên theo thời gian thực để hai bạn tiện theo dõi xếp bàn tiệc nhé!)</i>`,
          ].join("\n");
        }
      } catch (err) {
        return `❌ Lỗi tự động tạo Sheet: ${err.message}`;
      }
    }
  }

  // 7. XEM CHI TIẾT & TIN NHẮN MẪU BÀN GIAO CHO DÂU RỂ
  const isInfo = /(info|chi tiết|chi tiet|thông tin|thong tin|xem|kiểm tra|kiem tra|tin nhắn|tin nhan|gửi khách|gui khach|bàn giao|ban giao)/i.test(lowerCmd) && lowerCmd.length < 35;
  if (isInfo) {
    // Nếu chưa có sheet riêng, tự động gọi Apps Script sinh luôn trong 1 giây!
    if (!coupleSheetUrl && process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const gRes = await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_sheet",
            couple_name: coupleName,
            slug,
            folder_id: process.env.GOOGLE_DRIVE_FOLDER_ID || undefined,
          }),
        });
        const gData = await gRes.json();
        if (gData.status === "ok" && gData.sheet_url) {
          coupleSheetUrl = gData.sheet_url;
          const mapFile = "src/data/couple_sheets.json";
          let map = {};
          try { map = JSON.parse(fs.readFileSync(mapFile, "utf-8")); } catch {}
          map[slug] = coupleSheetUrl;
          fs.writeFileSync(mapFile, JSON.stringify(map, null, 2), "utf-8");
        }
      } catch {}
    }

    return [
      `ℹ️ <b>CHI TIẾT THIỆP CƯỚI: ${coupleName}</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `• <b>Link thiệp:</b> <code>https://mariee.vn/couples/${slug}</code>`,
      `• <b>Trạng thái:</b> ${couple.is_published ? "🟢 Đang công khai (Lên sóng)" : "🟡 Bản nháp (Đang ẩn)"}`,
      `• <b>Ngày cưới:</b> ${couple.wedding_date || "Chưa đặt"}`,
      `• <b>Giờ tiệc:</b> ${couple.reception_time || "—"} tại ${couple.venue_name || "—"}`,
      `• <b>Địa chỉ:</b> ${couple.venue_address || "—"}`,
      coupleSheetUrl ? `• <b>Google Sheet:</b> <code>${coupleSheetUrl}</code>` : `• <b>Google Sheet:</b> <i>Dùng sheet mặc định</i>`,
      ``,
      `💌 <b>TIN NHẮN MẪU GỬI DÂU RỂ (CHẠM ĐỂ COPY):</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `Chào ${couple.groom_name} & ${couple.bride_name},`,
      `Mariée xin gửi hai bạn link thiệp cưới online và bảng theo dõi khách mời riêng của hai bạn:`,
      ``,
      `💍 <b>Thiệp cưới online:</b>`,
      `https://mariee.vn/couples/${slug}`,
      ``,
      coupleSheetUrl
        ? `📊 <b>Bảng theo dõi khách mời (Google Sheets):</b>\n${coupleSheetUrl}\n\n<i>(Mỗi khi khách gửi xác nhận tham dự, thông tin sẽ tự động nhảy vào link Google Sheet trên theo thời gian thực để hai bạn tiện theo dõi xếp bàn tiệc nhé!)</i>`
        : ``,
    ].join("\n");
  }

  // 8. FIELD UPDATES
  const updates = {};
  const changed = [];

  const recMatch = cleanText.match(/(?:giờ tiệc|tiệc|tiệc cưới|reception)\s*(?:thành|là|:)?\s*(\d{1,2}[:h]\d{2}|\d{1,2}\s*h)/i);
  if (recMatch) {
    updates.reception_time = recMatch[1].replace("h", ":");
    changed.push(`• Giờ tiệc: <b>${updates.reception_time}</b>`);
  }

  const cerMatch = cleanText.match(/(?:giờ lễ|lễ cưới|hôn lễ|ceremony)\s*(?:thành|là|:)?\s*(\d{1,2}[:h]\d{2}|\d{1,2}\s*h)/i);
  if (cerMatch) {
    updates.ceremony_time = cerMatch[1].replace("h", ":");
    changed.push(`• Giờ lễ: <b>${updates.ceremony_time}</b>`);
  }

  const dateMatch = cleanText.match(/(?:ngày cưới|ngày)\s*(?:thành|là|:)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}-\d{2}-\d{2})/i);
  if (dateMatch) {
    const raw = dateMatch[1];
    let iso = raw;
    if (raw.includes("/")) {
      const [d, m, y] = raw.split("/");
      iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    updates.wedding_date = iso;
    changed.push(`• Ngày cưới: <b>${raw}</b>`);
  }

  const venueMatch = cleanText.match(/(?:sảnh|nhà hàng|trung tâm tiệc|venue)\s*(?:thành|là|:)?\s*([^,\n]+)/i);
  if (venueMatch) {
    updates.venue_name = venueMatch[1].trim();
    changed.push(`• Sảnh/Địa điểm: <b>${updates.venue_name}</b>`);
  }

  const addrMatch = cleanText.match(/(?:địa chỉ|ở|tại)\s*(?:thành|là|:)?\s*([^,\n]+(?:quận|huyện|tp|tỉnh|đường|phường|số)[^,\n]*)/i);
  if (addrMatch) {
    updates.venue_address = addrMatch[1].trim();
    changed.push(`• Địa chỉ: <b>${updates.venue_address}</b>`);
  }

  const stkGroomMatch = cleanText.match(/(?:stk chú rể|stk rể|tài khoản chú rể|tk rể)\s*(?:thành|là|:)?\s*(\d+)(?:\s+([a-zA-Z\s]+))?/i);
  if (stkGroomMatch) {
    updates.gift_groom_account = stkGroomMatch[1].trim();
    if (stkGroomMatch[2]) updates.gift_groom_bank = stkGroomMatch[2].trim();
    changed.push(`• STK Chú rể: <b>${updates.gift_groom_account}</b> ${updates.gift_groom_bank ? `(${updates.gift_groom_bank})` : ""}`);
  }

  const stkBrideMatch = cleanText.match(/(?:stk cô dâu|stk dâu|tài khoản cô dâu|tk dâu)\s*(?:thành|là|:)?\s*(\d+)(?:\s+([a-zA-Z\s]+))?/i);
  if (stkBrideMatch) {
    updates.gift_bride_account = stkBrideMatch[1].trim();
    if (stkBrideMatch[2]) updates.gift_bride_bank = stkBrideMatch[2].trim();
    changed.push(`• STK Cô dâu: <b>${updates.gift_bride_account}</b> ${updates.gift_bride_bank ? `(${updates.gift_bride_bank})` : ""}`);
  }

  const bridePartyMatch = cleanText.match(/(?:nhà gái|vu quy)\s*(?:thành|là|:)?\s*([^,\n]+)/i);
  if (bridePartyMatch) {
    updates.bride_party_address = bridePartyMatch[1].trim();
    changed.push(`• Nhà gái: <b>${updates.bride_party_address}</b>`);
  }

  const groomPartyMatch = cleanText.match(/(?:nhà trai|tân hôn)\s*(?:thành|là|:)?\s*([^,\n]+)/i);
  if (groomPartyMatch) {
    updates.groom_party_address = groomPartyMatch[1].trim();
    changed.push(`• Nhà trai: <b>${updates.groom_party_address}</b>`);
  }

  if (Object.keys(updates).length === 0) {
    return [
      `🤔 <b>Chưa nhận diện được nội dung bạn muốn sửa!</b>`,
      `Cặp đôi: <b>${coupleName}</b> (/couples/${slug})`,
      ``,
      `<i>Ví dụ cú pháp hợp lệ:</i>`,
      `• <code>/couples/${slug} giờ tiệc 19:00</code>`,
      `• <code>/couples/${slug} sảnh GEM Center</code>`,
      `• <code>/couples/${slug} ngày 28/11/2026</code>`,
      `• <code>/couples/${slug} stk chú rể 19036888666 Techcombank</code>`,
      `• <code>publish /couples/${slug}</code>`,
    ].join("\n");
  }

  const { error: updErr } = await supabase.from("couples").update(updates).eq("id", couple.id);
  if (updErr) return `❌ Lỗi cập nhật: ${updErr.message}`;

  return [
    `✅ <b>ĐÃ CẬP NHẬT THÀNH CÔNG!</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `💍 <b>${coupleName}</b> (/couples/${slug})`,
    ...changed,
    ``,
    `🌐 <b>Xem ngay:</b> <code>https://mariee.vn/couples/${slug}</code>`,
  ].join("\n");
}

let offset = 0;

async function pollUpdates() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`);
    const data = await res.json();
    if (!data.ok || !data.result) return;

    for (const update of data.result) {
      offset = update.update_id + 1;
      const msg = update.message;
      if (!msg) continue;

      const chatId = String(msg.chat.id);
      // Chỉ nhận lệnh từ Admin đã cấu hình trong .env để bảo mật tuyệt đối!
      if (chatId !== String(adminChatId)) {
        await sendTelegram(chatId, "⛔ Bạn không có quyền quản trị hệ thống Mariee.vn.");
        continue;
      }

      const text = msg.text || msg.caption || "";
      if (!text) continue;

      console.log(`[Telegram Cmd from Admin]: "${text}"`);
      const reply = await handleCommand(text);
      await sendTelegram(chatId, reply);
    }
  } catch (err) {
    console.error("Polling error:", err.message);
  }
}

async function loop() {
  while (true) {
    await pollUpdates();
  }
}

loop();
