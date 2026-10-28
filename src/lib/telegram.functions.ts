import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên").max(120),
  contact: z.string().trim().min(1, "Vui lòng nhập số điện thoại hoặc email").max(160),
  message: z.string().trim().min(1, "Vui lòng nhập nội dung liên hệ").max(1000),
  pageUrl: z.string().optional(),
});

export const sendTelegramContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in environment variables.");
      return {
        success: false,
        message: "Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong file .env.",
        missingConfig: true,
      };
    }

    const timeString = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    const text = [
      `💌 <b>LIÊN HỆ MỚI TỪ MARIEE.VN</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Họ tên:</b> ${data.name}`,
      `📞 <b>Liên hệ:</b> ${data.contact}`,
      data.pageUrl ? `🌐 <b>Trang:</b> ${data.pageUrl}` : null,
      `⏰ <b>Thời gian:</b> ${timeString}`,
      `━━━━━━━━━━━━━━━━━━`,
      `💬 <b>Nội dung:</b>`,
      `${data.message}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        console.error("Telegram API Error:", json);
        return {
          success: false,
          message: "Không thể gửi tin nhắn lúc này, vui lòng thử lại sau.",
        };
      }

      return { success: true, message: "Đã gửi lời nhắn thành công! Mariée sẽ liên hệ lại với bạn sớm nhất." };
    } catch (err: any) {
      console.error("Failed to send telegram message:", err);
      return {
        success: false,
        message: "Có lỗi kết nối, vui lòng thử lại sau.",
      };
    }
  });
