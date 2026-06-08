ALTER TABLE public.couples
  ADD COLUMN IF NOT EXISTS gift_bride_qr_url text,
  ADD COLUMN IF NOT EXISTS gift_groom_qr_url text;