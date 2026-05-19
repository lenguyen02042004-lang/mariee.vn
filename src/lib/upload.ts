import { supabase } from "@/integrations/supabase/client";

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