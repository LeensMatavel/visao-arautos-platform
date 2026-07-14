import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Play,
  FileDown,
  Check,
  ChevronLeft,
  MessageCircle,
  StickyNote,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  findCourse,
  findCycleForCourse,
  type Lesson,
} from "@/lib/courses";
import { getProgress, toggleLessonComplete } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/escola/$courseId")({
  loader: ({ params }) => {
    const course = findCourse(params.courseId);
    if (!course) throw notFound();
    return { courseId: params.courseId };
  },
  component: CoursePage,
});

function CoursePage() {
  const { courseId } = Route.useParams();
  const course = findCourse(courseId)!;
  const cycle = findCycleForCourse(courseId);

  const [activeLesson, setActiveLesson] = useState<Lesson>(course.lessons[0]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCompleted(getProgress()[courseId] || []);
    setNotes(localStorage.getItem(`arautos.notes.${courseId}`) || "");
  }, [courseId]);

  const pct = Math.round((completed.length / course.lessons.length) * 100);

  const toggle = () => {
    const next = toggleLessonComplete(courseId, activeLesson.id);
    setCompleted(next);
    toast.success(
      next.includes(activeLesson.id) ? "Aula concluída" : "Aula reaberta",
    );
  };

  const saveNotes = (v: string) => {
    setNotes(v);
    localStorage.setItem(`arautos.notes.${courseId}`, v);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Cover banner */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-hero absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Link
            to="/escola"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs tracking-widest uppercase"
          >
            <ChevronLeft className="h-4 w-4" /> Escola Arautos
          </Link>
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
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="min-w-0 space-y-8">
            <div className="border-border bg-card overflow-hidden rounded-2xl border">
              <div className="aspect-video w-full bg-black">
                <iframe
                  key={activeLesson.id}
                  className="h-full w-full"
                  src={activeLesson.videoUrl}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-6 sm:flex sm:justify-between">
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs tracking-widest uppercase">
                    Aula em andamento
                  </p>
                  <h2 className="font-display mt-1 truncate text-xl">
                    {activeLesson.title}
                  </h2>
                </div>
                <button
                  onClick={toggle}
                  className={cn(
                    "shrink-0 rounded-full px-5 py-2 text-xs font-medium transition",
                    completed.includes(activeLesson.id)
                      ? "border border-primary text-primary"
                      : "bg-gold text-primary-foreground shadow-gold",
                  )}
                >
                  {completed.includes(activeLesson.id)
                    ? "Concluída ✓"
                    : "Marcar como concluída"}
                </button>
              </div>
            </div>

            {/* PDF */}
            <div className="border-border bg-card flex items-center justify-between gap-4 rounded-2xl border p-6">
              <div className="flex items-center gap-3">
                <div className="border-gold/40 bg-gold/5 grid h-11 w-11 place-items-center rounded-full border">
                  <FileDown className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg">Material em PDF</p>
                  <p className="text-muted-foreground text-xs">
                    Baixe para estudar offline
                  </p>
                </div>
              </div>
              <a
                href={activeLesson.pdfUrl}
                className="border-border hover:border-gold rounded-full border px-5 py-2 text-xs"
              >
                Baixar
              </a>
            </div>

            {/* Notes */}
            <div className="border-border bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-2">
                <StickyNote className="text-primary h-4 w-4" />
                <h3 className="font-display text-sm tracking-widest uppercase">
                  Minhas anotações
                </h3>
              </div>
              <textarea
                value={notes}
                onChange={(e) => saveNotes(e.target.value)}
                placeholder="Escreva o que o Senhor te falou nesta aula..."
                rows={6}
                className="border-border bg-background/60 focus:border-gold mt-4 w-full rounded-lg border p-4 text-sm outline-none"
              />
              <p className="text-muted-foreground mt-2 text-xs">
                Suas anotações ficam salvas neste dispositivo.
              </p>
            </div>

            {/* Discussion */}
            <div className="border-border bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-2">
                <MessageCircle className="text-primary h-4 w-4" />
                <h3 className="font-display text-sm tracking-widest uppercase">
                  Discussão
                </h3>
              </div>
              <div className="mt-6 space-y-5">
                {[
                  { n: "Ana", t: "Que aula profunda! O ponto sobre contexto histórico mudou minha leitura de Romanos." },
                  { n: "Lucas", t: "Alguém tem indicação de livros complementares?" },
                ].map((c) => (
                  <div key={c.n} className="flex gap-3">
                    <div className="border-gold/40 bg-gold/10 text-primary grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs">
                      {c.n[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.n}</p>
                      <p className="text-muted-foreground mt-1 text-sm">{c.t}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Comentário enviado à moderação.");
                  (e.currentTarget as HTMLFormElement).reset();
                }}
                className="mt-6 flex gap-2"
              >
                <input
                  name="comment"
                  placeholder="Deixe um comentário..."
                  className="border-border bg-background/60 focus:border-gold flex-1 rounded-full border px-5 py-2.5 text-sm outline-none"
                />
                <button className="bg-gold text-primary-foreground rounded-full px-5 py-2.5 text-xs font-medium">
                  Enviar
                </button>
              </form>
            </div>
          </div>

          {/* Lessons sidebar */}
          <aside className="border-border bg-card h-fit rounded-2xl border p-5 lg:sticky lg:top-24">
            <p className="font-display px-2 text-sm tracking-widest uppercase">
              Aulas
            </p>
            <ul className="mt-4 space-y-1">
              {course.lessons.map((l, i) => {
                const done = completed.includes(l.id);
                const active = l.id === activeLesson.id;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setActiveLesson(l)}
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
                          <Play className="h-2.5 w-2.5" /> {l.duration}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
