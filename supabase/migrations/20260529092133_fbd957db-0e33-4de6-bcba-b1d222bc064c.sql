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