import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/states";

export const Route = createFileRoute("/admin/cursos")({
  component: AdminCourses,
});

type Lesson = {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  video_url: string | null;
  is_published: boolean;
};
type Course = {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  is_published: boolean;
  lessons: Lesson[];
};
type Cycle = {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  is_published: boolean;
  courses: Course[];
};

function AdminCourses() {
  const [cycles, setCycles] = useState<Cycle[] | null>(null);
  const [error, setError] = useState(false);
  const [openCourse, setOpenCourse] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("cycles")
      .select(
        "id, slug, title, order_index, is_published, courses(id, slug, title, order_index, is_published, lessons(id, slug, title, order_index, video_url, is_published))",
      )
      .order("order_index");
    setError(Boolean(err));
    setCycles((data as unknown as Cycle[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePublished(
    table: "cycles" | "courses" | "lessons",
    id: string,
    value: boolean,
  ) {
    const { error: err } = await supabase
      .from(table)
      .update({ is_published: value })
      .eq("id", id);
    if (err) return toast.error("Não foi possível guardar a alteração.");
    toast.success(value ? "Publicado." : "Despublicado.");
    void load();
  }

  async function saveVideo(id: string, url: string) {
    const { error: err } = await supabase
      .from("lessons")
      .update({ video_url: url.trim() || null })
      .eq("id", id);
    if (err) return toast.error("Não foi possível guardar a ligação do vídeo.");
    toast.success("Ligação do vídeo actualizada.");
    void load();
  }

  if (error)
    return <p className="text-muted-foreground text-sm">Não foi possível carregar o conteúdo.</p>;
  if (!cycles) return <LoadingState label="A carregar cursos…" />;

  return (
    <div className="space-y-10">
      <p className="text-muted-foreground text-sm">
        Publique ou despublique ciclos, cursos e aulas e associe as ligações
        oficiais de vídeo. Enquanto não houver ligação, a aula mostra o estado
        “vídeo ainda não disponível”.
      </p>

      {cycles
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((cy) => (
          <section key={cy.id}>
            <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
              <h2 className="font-display text-xl">{cy.title}</h2>
              <PublishToggle
                checked={cy.is_published}
                label={`Publicar ciclo ${cy.title}`}
                onChange={(v) => togglePublished("cycles", cy.id, v)}
              />
            </div>

            <ul className="mt-4 space-y-3">
              {(cy.courses ?? [])
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((co) => (
                  <li key={co.id} className="border-border bg-card rounded-2xl border p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <button
                        onClick={() => setOpenCourse(openCourse === co.id ? null : co.id)}
                        aria-expanded={openCourse === co.id}
                        className="text-left"
                      >
                        <p className="font-display text-lg">{co.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {(co.lessons ?? []).length} aulas · /{co.slug}
                        </p>
                      </button>
                      <PublishToggle
                        checked={co.is_published}
                        label={`Publicar curso ${co.title}`}
                        onChange={(v) => togglePublished("courses", co.id, v)}
                      />
                    </div>

                    {openCourse === co.id && (
                      <ul className="mt-5 space-y-3 border-t border-border/60 pt-5">
                        {(co.lessons ?? [])
                          .slice()
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((l) => (
                            <li key={l.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                              <div className="min-w-0">
                                <p className="text-sm">{l.title}</p>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.currentTarget.elements.namedItem(
                                      "url",
                                    ) as HTMLInputElement;
                                    void saveVideo(l.id, input.value);
                                  }}
                                  className="mt-2 flex gap-2"
                                >
                                  <input
                                    name="url"
                                    defaultValue={l.video_url ?? ""}
                                    aria-label={`Ligação de vídeo de ${l.title}`}
                                    placeholder="Ligação do vídeo (deixe vazio se ainda não existir)"
                                    className="border-border bg-background/60 focus:border-gold min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
                                  />
                                  <button className="border-gold/50 text-primary shrink-0 rounded-lg border px-3 py-2 text-xs">
                                    Guardar
                                  </button>
                                </form>
                              </div>
                              <div className="self-start">
                                <PublishToggle
                                  checked={l.is_published}
                                  label={`Publicar aula ${l.title}`}
                                  onChange={(v) => togglePublished("lessons", l.id, v)}
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </div>
  );
}

function PublishToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary"
      />
      Publicado
    </label>
  );
}
