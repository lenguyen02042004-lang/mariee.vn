-- Tighten couple_gallery RLS and add helpful indexes

-- Drop permissive gallery policy and replace with publish-aware policy
DROP POLICY IF EXISTS "gallery_public_read" ON public.couple_gallery;
CREATE POLICY "gallery_public_read" ON public.couple_gallery FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_gallery.couple_id AND c.is_published = true
    )
    OR public.has_role(auth.uid(),'admin')
  );

-- Add indexes for common filters to improve admin/public query performance
CREATE INDEX IF NOT EXISTS idx_couples_is_published ON public.couples (is_published);
CREATE INDEX IF NOT EXISTS idx_vendors_is_approved ON public.vendors (is_approved);
CREATE INDEX IF NOT EXISTS idx_vendors_is_featured ON public.vendors (is_featured);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON public.vendors (city);
CREATE INDEX IF NOT EXISTS idx_rsvp_couple_id ON public.rsvp (couple_id);

-- Notes:
-- 1) This migration narrows public access to couple gallery items so that unpublished couples' images are not readable by anonymous users.
-- 2) If you plan to provide couple-level access (couple owners reading their RSVPs/gallery), consider adding an `owner_id` on `public.couples` and a corresponding RLS policy that checks ownership (not added here to avoid schema drift).
