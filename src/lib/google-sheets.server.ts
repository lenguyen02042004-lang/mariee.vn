import fs from "fs";
import path from "path";

export interface RsvpSheetPayload {
  couple_id: string;
  slug: string;
  couple_name: string;
  spreadsheet_url?: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  attending: string;
  num_guests: number;
  side: string;
  message: string;
  created_at: string;
}

const MAPPING_FILE = path.resolve(process.cwd(), "src/data/couple_sheets.json");

export function getCoupleSheetUrl(slug: string): string | null {
  try {
    if (fs.existsSync(MAPPING_FILE)) {
      const map = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8"));
      return map[slug] || null;
    }
  } catch {}
  return null;
}

export function saveCoupleSheetUrl(slug: string, sheetUrl: string) {
  try {
    let map: Record<string, string> = {};
    if (fs.existsSync(MAPPING_FILE)) {
      map = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf-8"));
    }
    map[slug] = sheetUrl;
    const dir = path.dirname(MAPPING_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(map, null, 2), "utf-8");
  } catch (err) {
    console.error("[google-sheets] saveCoupleSheetUrl error:", err);
  }
}

/**
 * Tự động tạo 1 file Google Sheet mới cho cặp đôi thông qua Apps Script
 */
export async function createCoupleGoogleSheet(coupleName: string, slug: string): Promise<string | null> {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return null;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_sheet",
        couple_name: coupleName,
        slug: slug,
        folder_id: process.env.GOOGLE_DRIVE_FOLDER_ID || undefined,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.status === "ok" && json.sheet_url) {
        saveCoupleSheetUrl(slug, json.sheet_url);
        return json.sheet_url;
      }
    }
  } catch (err: any) {
    console.error("[google-sheets] createCoupleGoogleSheet failed:", err.message);
  }
  return null;
}

/**
 * Đồng bộ dữ liệu RSVP sang Google Sheets thông qua Webhook URL
 * (Google Apps Script Web App)
 */
export async function syncRsvpToGoogleSheet(payload: RsvpSheetPayload, customWebhookUrl?: string | null) {
  const webhookUrl = customWebhookUrl || process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    // Chưa cấu hình Webhook URL, bỏ qua mà không làm crash hệ thống
    return { ok: false, reason: "no_webhook_url" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("[google-sheets] webhook response not ok:", res.status);
      return { ok: false, status: res.status };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[google-sheets] sync failed:", err.message);
    return { ok: false, error: err.message };
  }
}
