
CREATE TABLE IF NOT EXISTS public.vendor_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vendor_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vendor_categories TO authenticated;
GRANT ALL ON public.vendor_categories TO service_role;

ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON public.vendor_categories
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "categories_admin_all" ON public.vendor_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_vendor_categories_updated
  BEFORE UPDATE ON public.vendor_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.vendor_categories (slug, label, sort_order) VALUES
  ('venue', 'Trung tâm tiệc cưới', 10),
  ('photography', 'Chụp ảnh cưới', 20),
  ('videography', 'Quay phim cưới', 30),
  ('wedding_planner', 'Wedding planner', 40),
  ('makeup', 'Trang điểm', 50),
  ('attire', 'Trang phục', 60),
  ('flowers', 'Hoa cưới', 70),
  ('catering', 'Ẩm thực', 80),
  ('music', 'Âm nhạc', 90),
  ('decor', 'Trang trí', 100),
  ('invitation', 'Thiệp cưới', 110),
  ('other', 'Khác', 999)
ON CONFLICT (slug) DO NOTHING;

-- Convert vendors.category from enum to text so admin có thể tạo danh mục mới
ALTER TABLE public.vendors
  ALTER COLUMN category DROP DEFAULT,
  ALTER COLUMN category TYPE text USING category::text,
  ALTER COLUMN category SET DEFAULT 'other';

CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
