
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-media', 'wedding-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "wedding_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-media');

CREATE POLICY "wedding_media_auth_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-media'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "wedding_media_auth_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'wedding-media'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "wedding_media_auth_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'wedding-media'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);
