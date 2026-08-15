import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Bell,
  Users,
  Sparkles,
  Calendar,
  LogOut,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useAuth, getProgress } from "@/lib/auth-context";
import { allCourses, cycles } from "@/lib/courses";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "O meu painel — Visão Arautos" },
      { name: "description", content: "Acompanhe o seu progresso na Escola Arautos, os cursos iniciados e a vida da comunidade." },
      { property: "og:title", content: "O meu painel — Visão Arautos" },
      { property: "og:description", content: "Acompanhe o seu progresso na Escola Arautos, os cursos iniciados e a vida da comunidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    setProgress(getProgress());
  }, [user]);

  const stats = useMemo(() => {
    const totalLessons = allCourses.reduce((s, c) => s + c.lessons.length, 0);
    const done = Object.values(progress).reduce((s, arr) => s + arr.length, 0);
    const enrolled = Object.keys(progress).length;
    return { totalLessons, done, enrolled, pct: totalLessons ? Math.round((done / totalLessons) * 100) : 0 };
  }, [progress]);

  if (loading || !user) return null;

  const myCourses = allCourses.filter((c) => progress[c.id]?.length);
  const recommended = allCourses.filter((c) => !progress[c.id]).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-primary text-xs tracking-[0.3em] uppercase">
              Painel
            </p>
            <h1 className="font-display mt-2 truncate text-3xl sm:text-4xl">
              Shalom, {user.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Continua a caminhar na Palavra e no Espírito.
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Flame} label="Progresso geral" value={`${stats.pct}%`} />
          <StatCard icon={BookOpen} label="Cursos iniciados" value={String(stats.enrolled)} />
          <StatCard icon={Sparkles} label="Aulas concluídas" value={String(stats.done)} />
          <StatCard icon={Users} label="Comunidade" value="Activa" />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {/* Meus cursos */}
            <section>
              <SectionTitle title="Meus cursos" href="/escola" />
              {myCourses.length === 0 ? (
                <EmptyState
                  text="Você ainda não iniciou nenhum curso."
                  cta="Explorar a Escola Arautos"
                  href="/escola"
                />
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {myCourses.map((c) => {
                    const pct = Math.round(
                      ((progress[c.id]?.length || 0) / c.lessons.length) * 100,
                    );
                    return (
                      <Link
                        key={c.id}
                        to="/escola/$courseId"
                        params={{ courseId: c.id }}
                        className="group border-border bg-card hover:border-gold rounded-2xl border p-6 transition"
                      >
                        <p className="text-muted-foreground text-xs tracking-widest uppercase">
                          {cycles.find((cy) => cy.id === c.cycleId)?.title.split("—")[0]}
                        </p>
                        <h3 className="font-display mt-2 text-xl">{c.title}</h3>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="bg-gold h-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-muted-foreground mt-2 text-xs">
                          {pct}% concluído
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recomendados */}
            <section>
              <SectionTitle title="Estudos recomendados" href="/escola" />
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {recommended.map((c) => (
                  <Link
                    key={c.id}
                    to="/escola/$courseId"
                    params={{ courseId: c.id }}
                    className="border-border bg-card hover:border-gold group rounded-2xl border p-5 transition"
                  >
                    <BookOpen className="text-primary h-5 w-5" />
                    <h4 className="font-display mt-4 text-lg">{c.title}</h4>
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                      {c.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <SidePanel icon={Bell} title="Notificações">
              <Item title="Nova aula em Cristologia" meta="há 2 dias" />
              <Item title="Encontro de oração — sexta" meta="há 3 dias" />
              <Item title="Bem-vindo à Escola Arautos" meta="há 5 dias" />
            </SidePanel>

            <SidePanel icon={Users} title="Comunidade">
              <Item title="Pedido de oração — família Souza" meta="Rede de oração" />
              <Item title="Testemunho de missões — Norte" meta="Missões" />
              <Item title="Grupo de estudo — Romanos" meta="Discipulado" />
            </SidePanel>

            <SidePanel icon={Calendar} title="Próximos eventos">
              <Item title="Vigília do Despertar" meta="Sáb, 20h" />
              <Item title="Escola Arautos — turma 03" meta="Início dia 15" />
              <Item title="Culto missionário" meta="Dom, 19h" />
            </SidePanel>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-6">
      <Icon className="text-primary h-5 w-5" />
      <p className="font-display mt-4 text-3xl">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase">
        {label}
      </p>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="font-display text-2xl">{title}</h2>
      <Link to={href} className="text-primary inline-flex items-center gap-1 text-xs">
        Ver tudo <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function SidePanel({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center gap-2">
        <Icon className="text-primary h-4 w-4" />
        <h3 className="font-display text-sm tracking-widest uppercase">
          {title}
        </h3>
      </div>
      <div className="mt-4 divide-y divide-border/60">{children}</div>
    </div>
  );
}

function Item({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="py-3">
      <p className="text-sm">{title}</p>
      <p className="text-muted-foreground mt-0.5 text-xs">{meta}</p>
    </div>
  );
}

function EmptyState({
  text,
  cta,
  href,
}: {
  text: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="border-border bg-card mt-6 rounded-2xl border p-10 text-center">
      <p className="text-muted-foreground text-sm">{text}</p>
      <Link
        to={href}
        className="bg-gold text-primary-foreground mt-4 inline-flex rounded-full px-5 py-2 text-xs font-medium"
      >
        {cta}
      </Link>
    </div>
  );
}
