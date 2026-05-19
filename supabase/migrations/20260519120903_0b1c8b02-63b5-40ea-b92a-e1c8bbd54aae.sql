
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
