-- Estrutura de conteúdo da Escola Arautos
CREATE TABLE public.cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  order_index integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cycles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycles TO authenticated;
GRANT ALL ON public.cycles TO service_role;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  order_index integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  slug text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  duration_label text,
  video_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.lesson_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'pdf',
  url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_materials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_materials TO authenticated;
GRANT ALL ON public.lesson_materials TO service_role;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.lesson_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Arauto',
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lesson_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_comments TO authenticated;
GRANT ALL ON public.lesson_comments TO service_role;
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'moderator')
  )
$$;

CREATE POLICY cycles_public_read ON public.cycles FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY cycles_staff_write ON public.cycles FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY courses_public_read ON public.courses FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY courses_staff_write ON public.courses FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY lessons_public_read ON public.lessons FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_staff(auth.uid()));
CREATE POLICY lessons_staff_write ON public.lessons FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY materials_public_read ON public.lesson_materials FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY materials_staff_write ON public.lesson_materials FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY comments_read ON public.lesson_comments FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY comments_insert_own ON public.lesson_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY comments_update_own ON public.lesson_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_staff(auth.uid()));
CREATE POLICY comments_delete_own ON public.lesson_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY prayer_requests_staff_manage ON public.prayer_requests FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY profiles_staff_read ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY user_roles_staff_read ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER cycles_updated_at BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER lesson_comments_updated_at BEFORE UPDATE ON public.lesson_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cycles (slug, order_index, title, subtitle, description) VALUES
('ciclo-1',1,'Ciclo 1 — Fundamentos','A base do discípulo','As colunas essenciais para caminhar com solidez nas Escrituras e na vida com Deus.'),
('ciclo-2',2,'Ciclo 2 — Formação Bíblica','A Palavra em profundidade','Um mergulho estruturado nas Escrituras, livro por livro, com contexto e teologia.'),
('ciclo-3',3,'Ciclo 3 — Teologia','Conhecer o Deus vivo','As grandes áreas da teologia sistemática apresentadas com profundidade e devoção.'),
('ciclo-4',4,'Ciclo 4 — Identidade Pentecostal','Espiritualidade com equilíbrio bíblico','A herança pentecostal ancorada nas Escrituras: fogo e verdade caminhando juntos.'),
('ciclo-5',5,'Ciclo 5 — Formação Ministerial','Servir com propósito','Ferramentas para líderes, discipuladores, evangelistas e missionários do Reino.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.courses (cycle_id, slug, order_index, title, description)
SELECT cy.id, v.slug, v.ord, v.title, v.descr FROM (VALUES
('ciclo-1','panorama-biblia',1,'Panorama Geral da Bíblia','Uma visão de sobrevoo das 66 janelas das Escrituras, do Gênesis ao Apocalipse.'),
('ciclo-1','hermeneutica',2,'Hermenêutica Bíblica','Princípios sadios para ler, interpretar e aplicar as Escrituras.'),
('ciclo-1','doutrinas',3,'Doutrinas Fundamentais','As verdades centrais da fé cristã organizadas com clareza pastoral.'),
('ciclo-1','vida-espiritual',4,'Vida Espiritual','Comunhão, oração, jejum e disciplinas que sustentam o caminhar diário.'),
('ciclo-2','livro-por-livro',1,'Estudo Livro por Livro','Visão panorâmica e temática dos 66 livros das Escrituras.'),
('ciclo-2','teologia-biblica',2,'Teologia Bíblica','Como a revelação de Deus se desdobra progressivamente na história.'),
('ciclo-2','historia-biblica',3,'História Bíblica','Contexto histórico-cultural que ilumina o texto sagrado.'),
('ciclo-2','cronologia',4,'Linha Cronológica da Bíblia','Da criação à consumação: uma linha do tempo integrada.'),
('ciclo-3','cristologia',1,'Cristologia','A pessoa e obra do Senhor Jesus Cristo.'),
('ciclo-3','pneumatologia',2,'Pneumatologia','A pessoa e obra do Espírito Santo.'),
('ciclo-3','escatologia',3,'Escatologia','As últimas coisas: esperança e vigilância.'),
('ciclo-3','soteriologia',4,'Soteriologia','A grande obra da salvação em Cristo.'),
('ciclo-3','eclesiologia',5,'Eclesiologia','A Igreja de Cristo: natureza, missão e ministério.'),
('ciclo-4','dons-espirituais',1,'Dons Espirituais','Natureza, propósito e exercício dos dons.'),
('ciclo-4','profecia',2,'Profecia','Ministério profético bíblico e pastoral.'),
('ciclo-4','discernimento',3,'Discernimento Espiritual','Distinguir espíritos, doutrinas e influências.'),
('ciclo-4','cura-divina',4,'Cura Divina','A obra redentora de Cristo aplicada ao corpo e à alma.'),
('ciclo-5','lideranca',1,'Liderança','Liderança segundo o coração de Deus.'),
('ciclo-5','discipulado',2,'Discipulado','Formar seguidores maduros de Jesus.'),
('ciclo-5','evangelismo',3,'Evangelismo','Anunciar Cristo com clareza e amor.'),
('ciclo-5','missoes',4,'Missões','O coração missionário de Deus.')
) AS v(cyslug, slug, ord, title, descr) JOIN public.cycles cy ON cy.slug = v.cyslug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.lessons (course_id, slug, order_index, title)
SELECT c.id, v.slug, v.ord, v.title FROM (VALUES
('panorama-biblia','l-1',1,'A grande história das Escrituras'),
('panorama-biblia','l-2',2,'Antigo Testamento — Lei e História'),
('panorama-biblia','l-3',3,'Poéticos e Sabedoria'),
('panorama-biblia','l-4',4,'Profetas Maiores e Menores'),
('panorama-biblia','l-5',5,'Evangelhos e Atos'),
('panorama-biblia','l-6',6,'Cartas e Apocalipse'),
('hermeneutica','l-1',1,'O que é hermenêutica'),
('hermeneutica','l-2',2,'Contexto histórico e cultural'),
('hermeneutica','l-3',3,'Gêneros literários da Bíblia'),
('hermeneutica','l-4',4,'Cristo como centro da interpretação'),
('hermeneutica','l-5',5,'Aplicação para a vida'),
('doutrinas','l-1',1,'Bibliologia'),
('doutrinas','l-2',2,'Teologia própria — quem é Deus'),
('doutrinas','l-3',3,'Antropologia e hamartiologia'),
('doutrinas','l-4',4,'Salvação em Cristo'),
('doutrinas','l-5',5,'Igreja e últimas coisas'),
('vida-espiritual','l-1',1,'Comunhão com o Pai'),
('vida-espiritual','l-2',2,'Oração perseverante'),
('vida-espiritual','l-3',3,'Jejum bíblico'),
('vida-espiritual','l-4',4,'Leitura devocional'),
('vida-espiritual','l-5',5,'Batalha espiritual'),
('livro-por-livro','l-1',1,'Gênesis a Deuteronômio'),
('livro-por-livro','l-2',2,'Josué a Ester'),
('livro-por-livro','l-3',3,'Jó a Cantares'),
('livro-por-livro','l-4',4,'Isaías a Malaquias'),
('livro-por-livro','l-5',5,'Mateus a Apocalipse'),
('teologia-biblica','l-1',1,'Criação e queda'),
('teologia-biblica','l-2',2,'Aliança e promessa'),
('teologia-biblica','l-3',3,'Reino de Deus'),
('teologia-biblica','l-4',4,'Cristo e a nova aliança'),
('teologia-biblica','l-5',5,'Consumação'),
('historia-biblica','l-1',1,'Mundo do Antigo Oriente'),
('historia-biblica','l-2',2,'Israel e as nações'),
('historia-biblica','l-3',3,'Período intertestamentário'),
('historia-biblica','l-4',4,'Mundo greco-romano'),
('historia-biblica','l-5',5,'Igreja primitiva'),
('cronologia','l-1',1,'Da criação aos patriarcas'),
('cronologia','l-2',2,'Êxodo e conquista'),
('cronologia','l-3',3,'Monarquia e exílio'),
('cronologia','l-4',4,'Vida de Cristo'),
('cronologia','l-5',5,'Igreja e consumação'),
('cristologia','l-1',1,'A pré-existência do Verbo'),
('cristologia','l-2',2,'A encarnação'),
('cristologia','l-3',3,'Ministério e ensinos'),
('cristologia','l-4',4,'Cruz e ressurreição'),
('cristologia','l-5',5,'Cristo glorificado'),
('pneumatologia','l-1',1,'O Espírito no Antigo Testamento'),
('pneumatologia','l-2',2,'Pentecostes'),
('pneumatologia','l-3',3,'Enchimento e comunhão'),
('pneumatologia','l-4',4,'Dons e frutos'),
('pneumatologia','l-5',5,'O Espírito e a missão'),
('escatologia','l-1',1,'A volta de Cristo'),
('escatologia','l-2',2,'Ressurreição e juízo'),
('escatologia','l-3',3,'Céu e inferno'),
('escatologia','l-4',4,'Novos céus e nova terra'),
('escatologia','l-5',5,'Vivendo à luz do fim'),
('soteriologia','l-1',1,'Graça e chamado'),
('soteriologia','l-2',2,'Arrependimento e fé'),
('soteriologia','l-3',3,'Justificação'),
('soteriologia','l-4',4,'Santificação'),
('soteriologia','l-5',5,'Glorificação'),
('eclesiologia','l-1',1,'O que é a Igreja'),
('eclesiologia','l-2',2,'Ordenanças'),
('eclesiologia','l-3',3,'Ministérios e dons'),
('eclesiologia','l-4',4,'Governo e disciplina'),
('eclesiologia','l-5',5,'Igreja e mundo'),
('dons-espirituais','l-1',1,'O que são os dons'),
('dons-espirituais','l-2',2,'Dons de revelação'),
('dons-espirituais','l-3',3,'Dons de poder'),
('dons-espirituais','l-4',4,'Dons de elocução'),
('dons-espirituais','l-5',5,'Ordem e edificação'),
('profecia','l-1',1,'Profecia nas Escrituras'),
('profecia','l-2',2,'Discernir a voz de Deus'),
('profecia','l-3',3,'Julgar profecias'),
('profecia','l-4',4,'Profecia e edificação'),
('profecia','l-5',5,'Cautelas pastorais'),
('discernimento','l-1',1,'Fundamentos do discernimento'),
('discernimento','l-2',2,'Provar os espíritos'),
('discernimento','l-3',3,'Falsas doutrinas'),
('discernimento','l-4',4,'Guerra espiritual sadia'),
('discernimento','l-5',5,'Vida de vigilância'),
('cura-divina','l-1',1,'Cura nas Escrituras'),
('cura-divina','l-2',2,'Fé e soberania'),
('cura-divina','l-3',3,'Cura interior'),
('cura-divina','l-4',4,'Ministração pastoral'),
('cura-divina','l-5',5,'Quando a cura tarda'),
('lideranca','l-1',1,'Chamado e caráter'),
('lideranca','l-2',2,'Visão e propósito'),
('lideranca','l-3',3,'Equipes saudáveis'),
('lideranca','l-4',4,'Conflitos e reconciliação'),
('lideranca','l-5',5,'Sustentabilidade ministerial'),
('discipulado','l-1',1,'O modelo de Jesus'),
('discipulado','l-2',2,'Discipulado um a um'),
('discipulado','l-3',3,'Discipulado em grupos'),
('discipulado','l-4',4,'Multiplicação'),
('discipulado','l-5',5,'Discipulado pela vida toda'),
('evangelismo','l-1',1,'O coração do Evangelho'),
('evangelismo','l-2',2,'Testemunho pessoal'),
('evangelismo','l-3',3,'Apologética prática'),
('evangelismo','l-4',4,'Evangelismo relacional'),
('evangelismo','l-5',5,'Evangelismo público'),
('missoes','l-1',1,'Deus missionário'),
('missoes','l-2',2,'Missões transculturais'),
('missoes','l-3',3,'Sensibilidade cultural'),
('missoes','l-4',4,'Envio e sustento'),
('missoes','l-5',5,'Igrejas que plantam igrejas')
) AS v(cslug, slug, ord, title) JOIN public.courses c ON c.slug = v.cslug
ON CONFLICT (course_id, slug) DO NOTHING;