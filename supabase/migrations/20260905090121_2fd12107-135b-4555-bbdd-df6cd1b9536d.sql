ALTER TABLE public.cycles ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.lesson_materials ADD COLUMN IF NOT EXISTS archived_at timestamptz;

DROP POLICY IF EXISTS cycles_public_read ON public.cycles;
CREATE POLICY cycles_public_read ON public.cycles FOR SELECT TO anon, authenticated
  USING (is_published AND archived_at IS NULL);

DROP POLICY IF EXISTS courses_public_read ON public.courses;
CREATE POLICY courses_public_read ON public.courses FOR SELECT TO anon, authenticated
  USING (is_published AND archived_at IS NULL);

DROP POLICY IF EXISTS lessons_public_read ON public.lessons;
CREATE POLICY lessons_public_read ON public.lessons FOR SELECT TO anon, authenticated
  USING (is_published AND archived_at IS NULL);

DROP POLICY IF EXISTS materials_public_read ON public.lesson_materials;
CREATE POLICY materials_public_read ON public.lesson_materials FOR SELECT TO anon, authenticated
  USING (archived_at IS NULL);

CREATE POLICY materials_staff_read ON public.lesson_materials FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE INDEX IF NOT EXISTS cycles_archived_at_idx ON public.cycles (archived_at);
CREATE INDEX IF NOT EXISTS courses_archived_at_idx ON public.courses (archived_at);
CREATE INDEX IF NOT EXISTS lessons_archived_at_idx ON public.lessons (archived_at);
CREATE INDEX IF NOT EXISTS lesson_materials_archived_at_idx ON public.lesson_materials (archived_at);