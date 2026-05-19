
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
