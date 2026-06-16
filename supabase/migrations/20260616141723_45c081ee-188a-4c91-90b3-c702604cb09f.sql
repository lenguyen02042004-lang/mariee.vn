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