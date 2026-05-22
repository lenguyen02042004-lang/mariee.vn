
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories readable by all" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "admin manage categories" ON public.blog_categories FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Convert blog_posts.category from enum to text to allow free categories
ALTER TABLE public.blog_posts ALTER COLUMN category TYPE text USING category::text;

-- Seed with existing labels
INSERT INTO public.blog_categories (slug, name, sort_order) VALUES
  ('news','Tin tức',1),
  ('tips','Mẹo cưới',2),
  ('real_stories','Câu chuyện thật',3),
  ('trends','Xu hướng',4),
  ('venues','Địa điểm',5),
  ('other','Khác',99)
ON CONFLICT (slug) DO NOTHING;
