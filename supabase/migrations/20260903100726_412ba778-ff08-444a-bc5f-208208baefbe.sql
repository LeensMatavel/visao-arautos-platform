-- Cycles: structural changes = admin only; moderators keep read access via public policy
DROP POLICY IF EXISTS cycles_staff_all ON public.cycles;
CREATE POLICY cycles_admin_all ON public.cycles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY cycles_staff_read ON public.cycles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS courses_staff_all ON public.courses;
CREATE POLICY courses_admin_all ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY courses_staff_read ON public.courses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS lessons_staff_all ON public.lessons;
CREATE POLICY lessons_admin_all ON public.lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY lessons_staff_read ON public.lessons FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS materials_staff_all ON public.lesson_materials;
CREATE POLICY materials_admin_all ON public.lesson_materials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Moderation policies rewritten with has_role (same effective permissions)
DROP POLICY IF EXISTS comments_auth_read ON public.lesson_comments;
CREATE POLICY comments_auth_read ON public.lesson_comments FOR SELECT TO authenticated
  USING (status = 'approved' OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS comments_update ON public.lesson_comments;
CREATE POLICY comments_update ON public.lesson_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS comments_delete ON public.lesson_comments;
CREATE POLICY comments_delete ON public.lesson_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS prayer_requests_staff_update ON public.prayer_requests;
CREATE POLICY prayer_requests_staff_update ON public.prayer_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS prayer_requests_staff_delete ON public.prayer_requests;
CREATE POLICY prayer_requests_staff_delete ON public.prayer_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS profiles_staff_read ON public.profiles;
CREATE POLICY profiles_staff_read ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));