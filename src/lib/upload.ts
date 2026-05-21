import { supabase } from "@/integrations/supabase/client";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
export const DEFAULT_MAX_MB = 10;

export function validateImage(file: File, opts: { maxMB?: number; types?: readonly string[] } = {}): string | null {
  const maxMB = opts.maxMB ?? DEFAULT_MAX_MB;
  const types = opts.types ?? ALLOWED_IMAGE_TYPES;
  if (!types.includes(file.type as any)) return `Chỉ chấp nhận ${types.map(t=>t.replace("image/","").toUpperCase()).join(", ")}`;
  if (file.size > maxMB * 1024 * 1024) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `Ảnh ${mb}MB vượt quá giới hạn ${maxMB}MB`;
  }
  return null;
}

export async function uploadImage(file: File, userId: string, folder = "misc"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("wedding-media").upload(path, file, {
    cacheControl: "3600", upsert: false, contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("wedding-media").getPublicUrl(path);
  return data.publicUrl;
}