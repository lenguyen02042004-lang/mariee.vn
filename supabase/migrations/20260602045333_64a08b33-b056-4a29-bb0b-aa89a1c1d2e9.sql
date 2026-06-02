CREATE POLICY "Users can list own wedding-media files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'wedding-media'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);