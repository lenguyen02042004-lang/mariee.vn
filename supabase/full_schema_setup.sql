
-- Roles enum & table
CREATE TYPE public.app_role AS ENUM ('admin','vendor','user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Couples (landing page per couple)
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date DATE,
  venue_name TEXT,
  venue_address TEXT,
  story TEXT,
  quote TEXT,
  youtube_url TEXT,
  hero_image_1 TEXT,
  hero_image_2 TEXT,
  hero_image_3 TEXT,
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couples_public_read" ON public.couples FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "couples_admin_all" ON public.couples FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Couple gallery
CREATE TABLE public.couple_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.couple_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_public_read" ON public.couple_gallery FOR SELECT USING (true);
CREATE POLICY "gallery_admin_all" ON public.couple_gallery FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- RSVP
CREATE TABLE public.rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  attending BOOLEAN NOT NULL DEFAULT true,
  num_guests INT NOT NULL DEFAULT 1,
  message TEXT,
  side TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rsvp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvp_anyone_insert" ON public.rsvp FOR INSERT WITH CHECK (true);
CREATE POLICY "rsvp_admin_read" ON public.rsvp FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "rsvp_admin_manage" ON public.rsvp FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Vendors
CREATE TYPE public.vendor_category AS ENUM ('venue','photography','videography','wedding_planner','makeup','attire','flowers','catering','music','decor','invitation','other');

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category vendor_category NOT NULL DEFAULT 'other',
  tagline TEXT,
  description TEXT,
  cover_image TEXT,
  logo_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  price_range TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_public_read" ON public.vendors FOR SELECT USING (is_approved = true OR auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "vendors_owner_update" ON public.vendors FOR UPDATE USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "vendors_owner_insert" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "vendors_admin_delete" ON public.vendors FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER couples_updated BEFORE UPDATE ON public.couples FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER vendors_updated BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_updated_at() 
RETURNS TRIGGER LANGUAGE PLPGSQL 
SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
-- Revoke public execute on definer functions (they're used by RLS internally)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "rsvp_anyone_insert" ON public.rsvp;
CREATE POLICY "rsvp_anyone_insert" ON public.rsvp FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_id AND c.is_published = true));

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS published_content jsonb,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- ============ PLANS ============
CREATE TABLE public.vendor_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price_vnd integer NOT NULL DEFAULT 0,
  billing_months integer NOT NULL DEFAULT 1,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendor_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.vendor_plans FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "plans_admin_all" ON public.vendor_plans FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.vendor_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SUBSCRIPTIONS ============
CREATE TABLE public.vendor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.vendor_plans(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subs_vendor ON public.vendor_subscriptions(vendor_id);
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_owner_read" ON public.vendor_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "subs_admin_all" ON public.vendor_subscriptions FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.vendor_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAYMENTS ============
CREATE TABLE public.vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.vendor_plans(id),
  amount_vnd integer NOT NULL,
  transfer_code text,
  proof_image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_vendor ON public.vendor_payments(vendor_id);
CREATE INDEX idx_payments_status ON public.vendor_payments(status);
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_owner_read" ON public.vendor_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "pay_owner_insert" ON public.vendor_payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
);
CREATE POLICY "pay_admin_all" ON public.vendor_payments FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.vendor_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAYMENT SETTINGS ============
CREATE TABLE public.payment_settings (
  id integer PRIMARY KEY DEFAULT 1,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  qr_image_url text,
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "psettings_public_read" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "psettings_admin_all" ON public.payment_settings FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_psettings_updated BEFORE UPDATE ON public.payment_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.payment_settings (id, instructions) VALUES (1, 'Vui lòng chuyển khoản đúng nội dung và tải lên ảnh bill để admin duyệt nhanh.') ON CONFLICT DO NOTHING;

-- ============ VENDORS columns ============
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.vendor_plans(id),
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- ============ SEED PLANS ============
INSERT INTO public.vendor_plans (name, slug, description, price_vnd, billing_months, features, sort_order) VALUES
('Cơ Bản','basic','Dành cho vendor mới bắt đầu', 0, 1, '["Hồ sơ cơ bản","3 ảnh thư viện","Hiển thị danh sách"]'::jsonb, 1),
('Chuyên Nghiệp','pro','Phù hợp vendor đang phát triển', 299000, 1, '["20 ảnh thư viện","Video YouTube","Liên hệ trực tiếp","Ưu tiên hiển thị"]'::jsonb, 2),
('Cao Cấp','premium','Toàn quyền tùy biến + nổi bật', 599000, 1, '["Không giới hạn ảnh","Featured badge","Phân tích chi tiết","Hỗ trợ ưu tiên 24/7"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;

-- Add couple fields
ALTER TABLE public.couples
  ADD COLUMN IF NOT EXISTS ceremony_time text,
  ADD COLUMN IF NOT EXISTS reception_time text,
  ADD COLUMN IF NOT EXISTS gift_bride_bank text,
  ADD COLUMN IF NOT EXISTS gift_bride_account text,
  ADD COLUMN IF NOT EXISTS gift_bride_holder text,
  ADD COLUMN IF NOT EXISTS gift_groom_bank text,
  ADD COLUMN IF NOT EXISTS gift_groom_account text,
  ADD COLUMN IF NOT EXISTS gift_groom_holder text,
  ADD COLUMN IF NOT EXISTS schedule jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Couple wishes wall
CREATE TABLE IF NOT EXISTS public.couple_wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL,
  guest_name text NOT NULL,
  message text NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.couple_wishes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wishes_public_read ON public.couple_wishes;
CREATE POLICY wishes_public_read ON public.couple_wishes FOR SELECT USING (is_approved = true OR has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS wishes_public_insert ON public.couple_wishes;
CREATE POLICY wishes_public_insert ON public.couple_wishes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM couples c WHERE c.id = couple_id AND c.is_published = true)
);
DROP POLICY IF EXISTS wishes_admin_all ON public.couple_wishes;
CREATE POLICY wishes_admin_all ON public.couple_wishes FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_wishes_couple ON public.couple_wishes(couple_id, created_at DESC);

-- Vendor leads (contact form)
CREATE TABLE IF NOT EXISTS public.vendor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  guest_name text NOT NULL,
  guest_phone text,
  guest_email text,
  event_date date,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendor_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leads_public_insert ON public.vendor_leads;
CREATE POLICY leads_public_insert ON public.vendor_leads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.is_approved = true)
);
DROP POLICY IF EXISTS leads_owner_read ON public.vendor_leads;
CREATE POLICY leads_owner_read ON public.vendor_leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR has_role(auth.uid(),'admin')
);
DROP POLICY IF EXISTS leads_owner_update ON public.vendor_leads;
CREATE POLICY leads_owner_update ON public.vendor_leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR has_role(auth.uid(),'admin')
);
DROP POLICY IF EXISTS leads_admin_delete ON public.vendor_leads;
CREATE POLICY leads_admin_delete ON public.vendor_leads FOR DELETE USING (has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_leads_vendor ON public.vendor_leads(vendor_id, created_at DESC);

-- Vendor products/services
CREATE TABLE IF NOT EXISTS public.vendor_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price_text text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS products_public_read ON public.vendor_products;
CREATE POLICY products_public_read ON public.vendor_products FOR SELECT USING (
  is_active = true OR EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR has_role(auth.uid(),'admin')
);
DROP POLICY IF EXISTS products_owner_all ON public.vendor_products;
CREATE POLICY products_owner_all ON public.vendor_products FOR ALL USING (
  EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR has_role(auth.uid(),'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR has_role(auth.uid(),'admin')
);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.vendor_products(vendor_id, sort_order);

-- Vendor testimonials
CREATE TABLE IF NOT EXISTS public.vendor_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  author_name text NOT NULL,
  message text NOT NULL,
  rating int,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendor_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS testi_public_read ON public.vendor_testimonials;
CREATE POLICY testi_public_read ON public.vendor_testimonials FOR SELECT USING (is_approved = true OR has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS testi_owner_all ON public.vendor_testimonials;
CREATE POLICY testi_owner_all ON public.vendor_testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR has_role(auth.uid(),'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM vendors v WHERE v.id = vendor_id AND v.owner_id = auth.uid())
  OR has_role(auth.uid(),'admin')
);
CREATE INDEX IF NOT EXISTS idx_testi_vendor ON public.vendor_testimonials(vendor_id);
UPDATE payment_settings SET bank_name='Vietcombank', bank_account_name='CONG TY MARIEE WEDDING', bank_account_number='0123456789', instructions='Nội dung CK: <slug-vendor> <gói>. Sau khi chuyển, tải ảnh bill lên để admin duyệt nhanh trong 24h.' WHERE id=1;

UPDATE couples SET 
  ceremony_time='10:00 — Sáng Chủ nhật',
  reception_time='18:00 — Tối Chủ nhật',
  venue_name='Trung tâm tiệc cưới White Palace',
  venue_address='194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
  story=E'Chúng mình quen nhau từ những ngày tháng đại học, cùng nhau đi qua bao mùa Sài Gòn nắng mưa. Sau 7 năm yêu thương, chúng mình quyết định viết tiếp câu chuyện cuộc đời cùng nhau — và muốn bạn có mặt trong khoảnh khắc đặc biệt ấy.',
  quote='Forever begins today.',
  hero_image_1='hero-wedding-1.jpg',
  hero_image_2='hero-wedding-2.jpg',
  hero_image_3='hero-wedding-3.jpg',
  cover_image='hero-wedding-1.jpg',
  youtube_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
  gift_bride_bank='Vietcombank', gift_bride_holder='NGUYEN MINH ANH', gift_bride_account='0011002233445',
  gift_groom_bank='Techcombank', gift_groom_holder='TRAN QUOC BAO', gift_groom_account='1903 8888 7777',
  schedule='[
    {"time":"08:30","title":"Đón khách","description":"Welcome champagne tại tiền sảnh"},
    {"time":"10:00","title":"Lễ thành hôn","description":"Nghi lễ trao nhẫn và lời thề"},
    {"time":"11:30","title":"Tiệc trà & chụp ảnh","description":"Lưu giữ khoảnh khắc cùng cô dâu chú rể"},
    {"time":"18:00","title":"Tiệc tối","description":"Dạ tiệc 7 món, live band & vũ hội"}
  ]'::jsonb
WHERE slug='minh-anh-quoc-bao';

UPDATE couples SET
  ceremony_time='09:30',
  reception_time='18:30',
  venue_name='Riverside Palace',
  venue_address='360D Bến Vân Đồn, Quận 4, TP.HCM',
  story='Một cuộc gặp gỡ tình cờ tại Đà Lạt mùa hoa anh đào, một lời hứa được giữ trọn vẹn. Hôm nay chúng mình chính thức về chung một nhà.',
  quote='Two hearts, one journey.',
  hero_image_1='hero-wedding-2.jpg', hero_image_2='hero-wedding-3.jpg', hero_image_3='hero-wedding-1.jpg',
  cover_image='hero-wedding-2.jpg',
  gift_bride_bank='ACB', gift_bride_holder='LE THUY LINH', gift_bride_account='2222 3333 4444',
  gift_groom_bank='BIDV', gift_groom_holder='PHAM HOANG NAM', gift_groom_account='5555 6666 7777',
  schedule='[
    {"time":"09:00","title":"Đón khách","description":""},
    {"time":"09:30","title":"Lễ thành hôn","description":""},
    {"time":"18:30","title":"Tiệc tối","description":"Dress code: Pastel"}
  ]'::jsonb
WHERE slug='thuy-linh-hoang-nam';

UPDATE vendors SET 
  description='White Palace là chuỗi trung tâm tiệc cưới sang trọng hàng đầu với sảnh tiệc rộng 1.000 chỗ ngồi, sân khấu Led panorama và đội ngũ phục vụ chuyên nghiệp 5 sao. Hơn 5.000 cặp đôi đã chọn White Palace cho ngày trọng đại.',
  gallery='["gallery-1.jpg","gallery-2.jpg","gallery-3.jpg","gallery-4.jpg","gallery-5.jpg"]'::jsonb,
  youtube_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
  phone='1900 6789', email='booking@whitepalace.vn', address='194 Hoàng Văn Thụ', city='TP.HCM', website='https://whitepalace.vn',
  price_range='Từ 8.000.000đ / bàn'
WHERE slug='white-palace-venue';

UPDATE vendors SET 
  description='Lumière Photography — studio chụp ảnh cưới với phong cách điện ảnh, ánh sáng tự nhiên. Đội ngũ photographer được đào tạo tại Pháp, làm việc khắp Việt Nam và châu Á.',
  gallery='["gallery-2.jpg","gallery-3.jpg","gallery-4.jpg","gallery-5.jpg"]'::jsonb,
  youtube_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
  phone='0908 123 456', email='hello@lumiere.vn', city='TP.HCM',
  price_range='Từ 15.000.000đ / album'
WHERE slug='lumiere-photography';

UPDATE vendors SET 
  description='Mia Beauty Studio chuyên trang điểm cô dâu phong cách Hàn — Nhật — Tây Âu. Sử dụng mỹ phẩm cao cấp, đảm bảo lớp trang điểm bền màu suốt cả ngày dài.',
  gallery='["gallery-3.jpg","gallery-1.jpg","gallery-5.jpg"]'::jsonb,
  phone='0909 888 777', email='mia@beauty.vn', city='Hà Nội',
  price_range='Từ 3.000.000đ'
WHERE slug='mia-beauty';

UPDATE vendors SET 
  description='Rosé Flowers — concept hoa cưới sang trọng, thiết kế theo từng câu chuyện riêng của cô dâu. Nguyên liệu nhập khẩu Hà Lan và Đà Lạt.',
  gallery='["gallery-4.jpg","gallery-2.jpg","gallery-5.jpg"]'::jsonb,
  phone='0938 111 222', email='hello@rose.vn', city='Đà Nẵng',
  price_range='Từ 5.000.000đ'
WHERE slug='rosé-flowers';

ALTER TABLE public.couples
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS invitation_bride_url text,
  ADD COLUMN IF NOT EXISTS invitation_groom_url text,
  ADD COLUMN IF NOT EXISTS bride_party_time text,
  ADD COLUMN IF NOT EXISTS bride_party_venue text,
  ADD COLUMN IF NOT EXISTS bride_party_address text,
  ADD COLUMN IF NOT EXISTS groom_party_time text,
  ADD COLUMN IF NOT EXISTS groom_party_venue text,
  ADD COLUMN IF NOT EXISTS groom_party_address text;

CREATE INDEX IF NOT EXISTS couples_owner_id_idx ON public.couples(owner_id);

-- Allow owner to update own couple
DROP POLICY IF EXISTS couples_owner_update ON public.couples;
CREATE POLICY couples_owner_update ON public.couples
  FOR UPDATE TO public
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS couples_owner_read ON public.couples;
CREATE POLICY couples_owner_read ON public.couples
  FOR SELECT TO public
  USING (auth.uid() = owner_id);

-- Gallery: owner manages
DROP POLICY IF EXISTS gallery_owner_all ON public.couple_gallery;
CREATE POLICY gallery_owner_all ON public.couple_gallery
  FOR ALL TO public
  USING (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_gallery.couple_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_gallery.couple_id AND c.owner_id = auth.uid()));
UPDATE vendors SET slug='rose-flowers' WHERE slug='rosé-flowers';

CREATE TYPE public.blog_category AS ENUM ('news','tips','real_stories','trends','venues','other');

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  category public.blog_category NOT NULL DEFAULT 'other',
  author_name TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_published_idx ON public.blog_posts (is_published, published_at DESC);
CREATE INDEX blog_posts_category_idx ON public.blog_posts (category, published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_public_read ON public.blog_posts
  FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY blog_admin_all ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text,
  logo_url text,
  favicon_url text,
  primary_color text,
  accent_color text,
  contact_email text,
  contact_phone text,
  footer_text text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_all" ON public.site_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_settings (id, site_name) VALUES (1, 'Mariée Wedding')
  ON CONFLICT (id) DO NOTHING;

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
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_slides jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hero_youtube_url text;

-- 1. Prevent vendor owners from tampering with guest-submitted lead fields
CREATE OR REPLACE FUNCTION public.vendor_leads_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.guest_name    IS DISTINCT FROM OLD.guest_name
   OR NEW.guest_email  IS DISTINCT FROM OLD.guest_email
   OR NEW.guest_phone  IS DISTINCT FROM OLD.guest_phone
   OR NEW.event_date   IS DISTINCT FROM OLD.event_date
   OR NEW.message      IS DISTINCT FROM OLD.message
   OR NEW.vendor_id    IS DISTINCT FROM OLD.vendor_id
   OR NEW.created_at   IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Only the lead status can be modified';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendor_leads_guard_update ON public.vendor_leads;
CREATE TRIGGER vendor_leads_guard_update
BEFORE UPDATE ON public.vendor_leads
FOR EACH ROW EXECUTE FUNCTION public.vendor_leads_guard_update();

-- 2. Remove broad SELECT on storage.objects for wedding-media bucket
-- Files remain accessible via public URLs because the bucket itself is public.
DROP POLICY IF EXISTS wedding_media_public_read ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.vendor_leads_guard_update() FROM PUBLIC, anon, authenticated;

-- 1. Scope couple_gallery public read to published couples only
DROP POLICY IF EXISTS gallery_public_read ON public.couple_gallery;
CREATE POLICY gallery_public_read ON public.couple_gallery
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.couples c
    WHERE c.id = couple_gallery.couple_id AND c.is_published = true
  ));

-- 2. Restrict payment_settings read to authenticated users
DROP POLICY IF EXISTS psettings_public_read ON public.payment_settings;
CREATE POLICY psettings_authenticated_read ON public.payment_settings
  FOR SELECT
  TO authenticated
  USING (true);
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'couple';

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
-- 1. Add audience column to vendor_plans (keep table name; treat as membership_plans)
ALTER TABLE public.vendor_plans
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'vendor';

ALTER TABLE public.vendor_plans
  DROP CONSTRAINT IF EXISTS vendor_plans_audience_check;
ALTER TABLE public.vendor_plans
  ADD CONSTRAINT vendor_plans_audience_check CHECK (audience IN ('vendor','couple'));

CREATE INDEX IF NOT EXISTS vendor_plans_audience_idx ON public.vendor_plans(audience, sort_order);

-- 2. Allow couple owner to update is_approved on couple_wishes for their couples
DROP POLICY IF EXISTS wishes_owner_update ON public.couple_wishes;
CREATE POLICY wishes_owner_update ON public.couple_wishes
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_wishes.couple_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_wishes.couple_id AND c.owner_id = auth.uid()));

DROP POLICY IF EXISTS wishes_owner_read ON public.couple_wishes;
CREATE POLICY wishes_owner_read ON public.couple_wishes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_wishes.couple_id AND c.owner_id = auth.uid()));

DROP POLICY IF EXISTS wishes_owner_delete ON public.couple_wishes;
CREATE POLICY wishes_owner_delete ON public.couple_wishes
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.couples c WHERE c.id = couple_wishes.couple_id AND c.owner_id = auth.uid()));
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
-- Replace handle_new_user: remove auto-admin escalation, honor signup_role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta_role text;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  meta_role := NEW.raw_user_meta_data->>'signup_role';
  IF meta_role IN ('couple','vendor','user','admin') THEN
    -- never allow self-assigning admin via metadata
    IF meta_role = 'admin' THEN meta_role := 'user'; END IF;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, meta_role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- 1) Couple owners can read their own RSVPs
CREATE POLICY "rsvp_couple_owner_read" ON public.rsvp
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.couples c
    WHERE c.id = rsvp.couple_id AND c.owner_id = auth.uid()
  ));

-- 2) Prevent vendor owners from self-approving / self-featuring / changing plan
CREATE OR REPLACE FUNCTION public.vendors_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.is_approved     IS DISTINCT FROM OLD.is_approved
   OR NEW.is_featured    IS DISTINCT FROM OLD.is_featured
   OR NEW.plan_id        IS DISTINCT FROM OLD.plan_id
   OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at
   OR NEW.owner_id       IS DISTINCT FROM OLD.owner_id
  THEN
    RAISE EXCEPTION 'Only admins can modify approval, featured, plan or owner fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendors_guard_update_trg ON public.vendors;
CREATE TRIGGER vendors_guard_update_trg
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.vendors_guard_update();
REVOKE EXECUTE ON FUNCTION public.vendors_guard_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.vendor_leads_guard_update() FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limits_bucket_key_time_idx
  ON public.rate_limits (bucket, key, created_at DESC);

GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_admin_read"
  ON public.rate_limits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.rate_limit_check(
  _bucket text,
  _key text,
  _limit int,
  _window_seconds int
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  DELETE FROM public.rate_limits
    WHERE created_at < now() - make_interval(secs => _window_seconds * 4);

  SELECT count(*) INTO _count
    FROM public.rate_limits
    WHERE bucket = _bucket
      AND key = _key
      AND created_at > now() - make_interval(secs => _window_seconds);

  IF _count >= _limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits (bucket, key) VALUES (_bucket, _key);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_check(text, text, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, text, int, int) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rate_limit_check(text, text, int, int) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, text, int, int) TO service_role;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS is_hidden_by_owner boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS vendors_public_read ON public.vendors;

CREATE POLICY vendors_public_read ON public.vendors
  FOR SELECT
  USING (
    (is_approved = true AND is_hidden_by_owner = false)
    OR (auth.uid() = owner_id)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );
-- Explicitly revoke write privileges from public roles; only service_role (used by the SECURITY DEFINER rate_limit_check RPC) may write.
REVOKE INSERT, UPDATE, DELETE ON public.rate_limits FROM anon, authenticated;

-- Add explicit deny policies so RLS posture is unambiguous to scanners and future maintainers.
DROP POLICY IF EXISTS "rate_limits_no_insert" ON public.rate_limits;
CREATE POLICY "rate_limits_no_insert" ON public.rate_limits
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "rate_limits_no_update" ON public.rate_limits;
CREATE POLICY "rate_limits_no_update" ON public.rate_limits
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "rate_limits_no_delete" ON public.rate_limits;
CREATE POLICY "rate_limits_no_delete" ON public.rate_limits
  FOR DELETE TO anon, authenticated USING (false);
-- rate_limit_check is only invoked server-side via the service role; signed-in/anon users must not be able to call it directly.
REVOKE EXECUTE ON FUNCTION public.rate_limit_check(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, text, integer, integer) TO service_role;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS ga4_id text,
  ADD COLUMN IF NOT EXISTS meta_pixel_id text;

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  message text NOT NULL,
  stack text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, DELETE ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "error_logs_admin_read" ON public.error_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "error_logs_admin_delete" ON public.error_logs
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS error_logs_created_idx ON public.error_logs (created_at DESC);
ALTER TABLE public.couples
  ADD COLUMN IF NOT EXISTS gift_bride_qr_url text,
  ADD COLUMN IF NOT EXISTS gift_groom_qr_url text;
-- 1) Lock down site_settings: drop public read (app uses service_role via server fn)
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;

CREATE POLICY site_settings_admin_read ON public.site_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE SELECT ON public.site_settings FROM anon;

-- 2) Make error_logs INSERT denial explicit for non-service roles
CREATE POLICY error_logs_no_insert ON public.error_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

REVOKE INSERT, UPDATE ON public.error_logs FROM anon, authenticated;
-- Restrict payment_settings reads to admins; the app reads it server-side via supabaseAdmin (service role) which bypasses RLS.
DROP POLICY IF EXISTS psettings_authenticated_read ON public.payment_settings;

-- Harden vendor_payments owner insert: enforce status='pending' and that referenced plan is active.
DROP POLICY IF EXISTS pay_owner_insert ON public.vendor_payments;
CREATE POLICY pay_owner_insert ON public.vendor_payments
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_payments.vendor_id AND v.owner_id = auth.uid())
    AND status = 'pending'
    AND EXISTS (SELECT 1 FROM public.vendor_plans p WHERE p.id = vendor_payments.plan_id AND p.is_active = true)
  );
DROP POLICY IF EXISTS pay_owner_read ON public.vendor_payments;
-- Remove broad anon SELECT policies on couples and vendors.
-- All public reads now go through server functions using the service role
-- (supabaseAdmin), which can apply column- and row-level filtering and
-- prevents anonymous enumeration of bank account numbers, vendor contact
-- info, and other sensitive fields via the Data API.
DROP POLICY IF EXISTS couples_public_read ON public.couples;
DROP POLICY IF EXISTS vendors_public_read ON public.vendors;

-- Re-create owner/admin SELECT policies if missing so authenticated owners
-- and admins can still read their rows directly (owners already have
-- couples_owner_read; vendors needs an explicit owner/admin SELECT now that
-- the public policy is gone).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='vendors'
      AND policyname='vendors_owner_admin_read'
  ) THEN
    CREATE POLICY vendors_owner_admin_read ON public.vendors
      FOR SELECT TO authenticated
      USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Tighten couple_wishes public read to only published couples
DROP POLICY IF EXISTS wishes_public_read ON public.couple_wishes;
CREATE POLICY wishes_public_read ON public.couple_wishes
FOR SELECT TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    is_approved = true
    AND EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_wishes.couple_id AND c.is_published = true
    )
  )
);

-- Allow vendor owners to read their own payments via Data API
CREATE POLICY pay_owner_read ON public.vendor_payments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = vendor_payments.vendor_id AND v.owner_id = auth.uid()
  )
);

-- Public read of non-sensitive site_settings (branding + public tracking IDs)
CREATE POLICY site_settings_public_read ON public.site_settings
FOR SELECT TO anon, authenticated
USING (true);

GRANT SELECT ON public.site_settings TO anon;

-- couple_gallery: remove anon/public SELECT; data is served only through server functions
DROP POLICY IF EXISTS gallery_public_read ON public.couple_gallery;

-- vendor_products: tighten public read to approved + visible vendors
DROP POLICY IF EXISTS products_public_read ON public.vendor_products;
CREATE POLICY products_public_read ON public.vendor_products
  FOR SELECT
  USING (
    (
      is_active = true
      AND EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id = vendor_products.vendor_id
          AND v.is_approved = true
          AND v.is_hidden_by_owner = false
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = vendor_products.vendor_id
        AND v.owner_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- payment_settings: explicit restrictive policy ensuring only admins can SELECT,
-- even if a future permissive policy is added accidentally.
DROP POLICY IF EXISTS psettings_deny_non_admin_read ON public.payment_settings;
CREATE POLICY psettings_deny_non_admin_read ON public.payment_settings
  AS RESTRICTIVE
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TABLE public.couple_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Khác',
  is_completed boolean NOT NULL DEFAULT false,
  is_custom boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  notes text,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_checklist TO authenticated;
GRANT ALL ON public.couple_checklist TO service_role;

ALTER TABLE public.couple_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_owner_select" ON public.couple_checklist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "checklist_owner_insert" ON public.couple_checklist
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "checklist_owner_update" ON public.couple_checklist
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "checklist_owner_delete" ON public.couple_checklist
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX couple_checklist_user_idx ON public.couple_checklist(user_id, sort_order);

CREATE TRIGGER couple_checklist_set_updated_at
  BEFORE UPDATE ON public.couple_checklist
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
REVOKE SELECT ON public.site_settings FROM anon;

-- Tighten RLS role scoping from public to authenticated where appropriate

-- couples
ALTER POLICY couples_admin_all ON public.couples TO authenticated;
ALTER POLICY couples_owner_read ON public.couples TO authenticated;
ALTER POLICY couples_owner_update ON public.couples TO authenticated;

-- rsvp (keep rsvp_anyone_insert open to public for guest submissions)
ALTER POLICY rsvp_admin_manage ON public.rsvp TO authenticated;
ALTER POLICY rsvp_admin_read ON public.rsvp TO authenticated;

-- vendors (keep vendors_admin_delete restricted to authenticated)
ALTER POLICY vendors_admin_delete ON public.vendors TO authenticated;
ALTER POLICY vendors_owner_insert ON public.vendors TO authenticated;
ALTER POLICY vendors_owner_update ON public.vendors TO authenticated;
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::public.app_role));
REVOKE SELECT ON public.profiles FROM anon;
