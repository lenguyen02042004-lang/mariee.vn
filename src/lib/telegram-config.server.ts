/**
 * Lấy cấu hình Telegram Bot Token & Admin Chat ID
 * Hỗ trợ:
 * 1. process.env (chuẩn Vercel / Node)
 * 2. VITE_ prefix (nếu người dùng đặt VITE_TELEGRAM_BOT_TOKEN)
 * 3. Đọc trực tiếp từ .env trên ổ đĩa khi chạy local dev mà Vite chưa kịp nạp lại biến
 */
export async function getTelegramCredentials(): Promise<{ token: string; chatId: string }> {
  let token =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.VITE_TELEGRAM_BOT_TOKEN ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.TELEGRAM_BOT_TOKEN) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN) ||
    "";

  let chatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.VITE_TELEGRAM_CHAT_ID ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.TELEGRAM_CHAT_ID) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID) ||
    "";

  if (!token || !chatId) {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const matchToken = trimmed.match(/^(?:VITE_)?TELEGRAM_BOT_TOKEN\s*=\s*["']?([^"'\r\n]+)["']?/);
          if (matchToken && !token) token = matchToken[1].trim();
          const matchChat = trimmed.match(/^(?:VITE_)?TELEGRAM_CHAT_ID\s*=\s*["']?([^"'\r\n]+)["']?/);
          if (matchChat && !chatId) chatId = matchChat[1].trim();
        }
        if (token) process.env.TELEGRAM_BOT_TOKEN = token;
        if (chatId) process.env.TELEGRAM_CHAT_ID = chatId;
      }
    } catch {
      // Bỏ qua lỗi đọc file nếu chạy trong môi trường edge/serverless không có fs
    }
  }

  return { token, chatId };
}
