DROP POLICY cycles_public_read ON public.cycles;
DROP POLICY cycles_staff_write ON public.cycles;
DROP POLICY courses_public_read ON public.courses;
DROP POLICY courses_staff_write ON public.courses;
DROP POLICY lessons_public_read ON public.lessons;
DROP POLICY lessons_staff_write ON public.lessons;
DROP POLICY materials_public_read ON public.lesson_materials;
DROP POLICY materials_staff_write ON public.lesson_materials;
DROP POLICY comments_read ON public.lesson_comments;
DROP POLICY comments_update_own ON public.lesson_comments;
DROP POLICY comments_delete_own ON public.lesson_comments;
DROP POLICY prayer_requests_staff_manage ON public.prayer_requests;
DROP POLICY profiles_staff_read ON public.profiles;
DROP POLICY user_roles_staff_read ON public.user_roles;
DROP FUNCTION IF EXISTS public.is_staff(uuid);

-- Leitura pública apenas do conteúdo publicado
CREATE POLICY cycles_public_read ON public.cycles FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY courses_public_read ON public.courses FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY lessons_public_read ON public.lessons FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY materials_public_read ON public.lesson_materials FOR SELECT TO anon, authenticated USING (true);

-- Equipa (admin/moderador) gere todo o conteúdo
CREATE POLICY cycles_staff_all ON public.cycles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));
CREATE POLICY courses_staff_all ON public.courses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));
CREATE POLICY lessons_staff_all ON public.lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));
CREATE POLICY materials_staff_all ON public.lesson_materials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));

-- Comentários
CREATE POLICY comments_public_read ON public.lesson_comments FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY comments_auth_read ON public.lesson_comments FOR SELECT TO authenticated
  USING (status = 'approved' OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));
CREATE POLICY comments_update ON public.lesson_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));
CREATE POLICY comments_delete ON public.lesson_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));

-- Moderação de pedidos de oração e leitura de perfis pela equipa
CREATE POLICY prayer_requests_staff_update ON public.prayer_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));
CREATE POLICY prayer_requests_staff_delete ON public.prayer_requests FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));
CREATE POLICY profiles_staff_read ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('admin','moderator')));