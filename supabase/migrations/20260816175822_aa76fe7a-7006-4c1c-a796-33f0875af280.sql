-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Arauto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- new user handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Arauto'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- prayer requests
CREATE TABLE public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  display_name TEXT NOT NULL DEFAULT 'Anónimo',
  body TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  prayed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prayer_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_requests TO authenticated;
GRANT ALL ON public.prayer_requests TO service_role;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prayer_requests_public_read" ON public.prayer_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "prayer_requests_insert_own" ON public.prayer_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prayer_requests_update_own" ON public.prayer_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prayer_requests_delete_own" ON public.prayer_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER prayer_requests_updated_at BEFORE UPDATE ON public.prayer_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- intercessions
CREATE TABLE public.prayer_intercessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.prayer_intercessions TO authenticated;
GRANT ALL ON public.prayer_intercessions TO service_role;
ALTER TABLE public.prayer_intercessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercessions_select_own" ON public.prayer_intercessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "intercessions_insert_own" ON public.prayer_intercessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "intercessions_delete_own" ON public.prayer_intercessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_prayed_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prayer_requests SET prayed_count = prayed_count + 1 WHERE id = NEW.request_id;
    RETURN NEW;
  ELSE
    UPDATE public.prayer_requests SET prayed_count = GREATEST(prayed_count - 1, 0) WHERE id = OLD.request_id;
    RETURN OLD;
  END IF;
END; $$;

CREATE TRIGGER intercessions_count_ins AFTER INSERT ON public.prayer_intercessions
FOR EACH ROW EXECUTE FUNCTION public.sync_prayed_count();
CREATE TRIGGER intercessions_count_del AFTER DELETE ON public.prayer_intercessions
FOR EACH ROW EXECUTE FUNCTION public.sync_prayed_count();

-- course progress
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.course_progress TO authenticated;
GRANT ALL ON public.course_progress TO service_role;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_select_own" ON public.course_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own" ON public.course_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_delete_own" ON public.course_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);