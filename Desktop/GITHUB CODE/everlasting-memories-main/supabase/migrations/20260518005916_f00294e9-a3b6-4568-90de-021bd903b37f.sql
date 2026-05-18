ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS published_content jsonb,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;