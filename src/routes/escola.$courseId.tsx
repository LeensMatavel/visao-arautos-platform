import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FileDown,
  StickyNote,
  BookOpen,
  Check,
  Play,
  VideoOff,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState, LoadingState } from "@/components/states";
import { LessonComments } from "@/components/lesson-comments";
import { getCourse } from "@/lib/content.functions";
import { fetchProgress, toggleLesson } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/escola/$courseId")({
  loader: async ({ params }) => {
    const course = await getCourse({ data: { slug: params.courseId } });
    if (!course) throw notFound();
    return course;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Curso indisponível — Escola Arautos" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.title} — Escola Arautos`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  pendingComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">
        <LoadingState label="A carregar o curso…" />
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: CourseError,
  notFoundComponent: CourseNotFound,
  component: CoursePage,
});

function CoursePage() {
  const course = Route.useLoaderData();
  const courseId = course.slug;
  const cycle = course.cycle;
  const lessons = course.lessons;

  const [activeSlug, setActiveSlug] = useState(lessons[0]?.slug ?? "");
  const [completed, setCompleted] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const activeLesson = lessons.find((l) => l.slug === activeSlug) ?? lessons[0];

  useEffect(() => {
    let active = true;
    fetchProgress().then((map) => {
      if (active) setCompleted(map[courseId] || []);
    });
    setNotes(localStorage.getItem(`arautos.notes.${courseId}`) || "");
    return () => {
      active = false;
    };
  }, [courseId]);

  const pct = lessons.length
    ? Math.round((completed.length / lessons.length) * 100)
    : 0;

  const toggle = async () => {
    if (!activeLesson) return;
    const next = await toggleLesson(courseId, activeLesson.slug, completed);
    setCompleted(next);
    toast.success(
      next.includes(activeLesson.slug) ? "Aula concluída" : "Aula reaberta",
    );
  };

  const saveNotes = (v: string) => {
    setNotes(v);
    localStorage.setItem(`arautos.notes.${courseId}`, v);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="bg-hero absolute inset-0" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "Início", to: "/" },
                { label: "Escola Arautos", to: "/escola" },
                ...(cycle
                  ? [{ label: cycle.subtitle, to: "/escola", hash: cycle.slug }]
                  : []),
                { label: course.title },
              ]}
            />
            {cycle && (
              <p className="text-primary mt-6 text-xs tracking-[0.3em] uppercase">
                {cycle.title}
              </p>
            )}
            <h1 className="font-display mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {course.title}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              {course.description}
            </p>

            <div className="mt-8 flex max-w-md items-center gap-4">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="bg-gold h-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-muted-foreground text-xs">{pct}%</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {!activeLesson ? (
            <EmptyState
              icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
              title="Curso ainda sem aulas publicadas"
              description="A equipa está a preparar as aulas deste curso. Volte em breve."
              action={{ label: "Ver outros cursos", to: "/escola" }}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="min-w-0 space-y-8">
                <div className="border-border bg-card overflow-hidden rounded-2xl border">
                  <div className="aspect-video w-full bg-black">
                    {activeLesson.video_url ? (
                      <iframe
                        key={activeLesson.id}
                        className="h-full w-full"
                        src={activeLesson.video_url}
                        title={activeLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                        <VideoOff className="text-primary h-6 w-6" aria-hidden="true" />
                        <p className="font-display text-lg">Vídeo ainda não disponível</p>
                        <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
                          Esta aula já faz parte do programa, mas a gravação oficial
                          ainda não foi publicada.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-6 sm:flex sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-xs tracking-widest uppercase">
                        Aula em curso
                      </p>
                      <h2 className="font-display mt-1 truncate text-xl">
                        {activeLesson.title}
                      </h2>
                      {activeLesson.summary && (
                        <p className="text-muted-foreground mt-2 text-sm">
                          {activeLesson.summary}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={toggle}
                      className={cn(
                        "shrink-0 rounded-full px-5 py-2 text-xs font-medium transition",
                        completed.includes(activeLesson.slug)
                          ? "border border-primary text-primary"
                          : "bg-gold text-primary-foreground shadow-gold",
                      )}
                    >
                      {completed.includes(activeLesson.slug)
                        ? "Concluída ✓"
                        : "Marcar como concluída"}
                    </button>
                  </div>
                </div>

                {/* Materiais */}
                <div className="border-border bg-card rounded-2xl border p-6">
                  <div className="flex items-center gap-3">
                    <div className="border-gold/40 bg-gold/5 grid h-11 w-11 place-items-center rounded-full border">
                      <FileDown className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg">Materiais de estudo</p>
                      <p className="text-muted-foreground text-xs">
                        Documentos de apoio a esta aula
                      </p>
                    </div>
                  </div>
                  {activeLesson.materials.length === 0 ? (
                    <p className="text-muted-foreground mt-5 text-sm">
                      Ainda não há materiais publicados para esta aula.
                    </p>
                  ) : (
                    <ul className="mt-5 space-y-2">
                      {activeLesson.materials.map((m) => (
                        <li
                          key={m.id}
                          className="border-border flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
                        >
                          <span className="min-w-0 truncate text-sm">{m.title}</span>
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-border hover:border-gold shrink-0 rounded-full border px-4 py-1.5 text-xs"
                          >
                            Descarregar
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Anotações */}
                <div className="border-border bg-card rounded-2xl border p-6">
                  <div className="flex items-center gap-2">
                    <StickyNote className="text-primary h-4 w-4" />
                    <h3 className="font-display text-sm tracking-widest uppercase">
                      As minhas anotações
                    </h3>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => saveNotes(e.target.value)}
                    placeholder="Escreva o que o Senhor lhe falou nesta aula…"
                    rows={6}
                    aria-label="As minhas anotações"
                    className="border-border bg-background/60 focus:border-gold mt-4 w-full rounded-lg border p-4 text-sm outline-none"
                  />
                  <p className="text-muted-foreground mt-2 text-xs">
                    As suas anotações ficam guardadas neste dispositivo.
                  </p>
                </div>

                <LessonComments lessonId={activeLesson.id} />
              </div>

              {/* Aulas */}
              <aside className="border-border bg-card h-fit rounded-2xl border p-5 lg:sticky lg:top-24">
                <p className="font-display px-2 text-sm tracking-widest uppercase">
                  Aulas
                </p>
                <ul className="mt-4 space-y-1">
                  {lessons.map((l, i) => {
                    const done = completed.includes(l.slug);
                    const active = l.slug === activeLesson.slug;
                    return (
                      <li key={l.id}>
                        <button
                          onClick={() => setActiveSlug(l.slug)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition",
                            active
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px]",
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border",
                            )}
                          >
                            {done ? <Check className="h-3 w-3" /> : i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{l.title}</span>
                            <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px]">
                              <Play className="h-2.5 w-2.5" />
                              {l.duration_label ?? (l.video_url ? "Vídeo" : "Sem vídeo ainda")}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CourseError() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title="Não foi possível carregar o curso"
          description="Houve uma falha ao contactar a plataforma. Tente novamente dentro de instantes."
          action={{ label: "Ver todos os cursos", to: "/escola" }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

function CourseNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: "Escola Arautos", to: "/escola" },
            { label: "Curso não encontrado" },
          ]}
        />
        <div className="mt-10">
          <EmptyState
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
            title="Curso não encontrado"
            description="Este curso não existe ou foi movido. Consulte os cinco ciclos da Escola Arautos para encontrar o percurso certo."
            action={{ label: "Ver todos os cursos", to: "/escola" }}
          />
        </div>
      </main>
      <SiteFooter />
      <Link to="/escola" className="sr-only">
        Escola Arautos
      </Link>
    </div>
  );
}
