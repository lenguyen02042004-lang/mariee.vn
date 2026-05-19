
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
