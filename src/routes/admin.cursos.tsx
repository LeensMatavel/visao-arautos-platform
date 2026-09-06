import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/states";
import { useRoles } from "@/lib/roles";
import {
  getImpact,
  setArchived,
  purgeItem,
  type CurriculumTable,
  type ImpactSummary,
} from "@/lib/curriculum.functions";

export const Route = createFileRoute("/admin/cursos")({
  component: AdminCourses,
});

type Material = {
  id: string;
  lesson_id: string;
  title: string;
  kind: string;
  url: string;
  order_index: number;
};
type Lesson = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  summary: string;
  duration_label: string | null;
  order_index: number;
  video_url: string | null;
  is_published: boolean;
  lesson_materials: Material[];
};
type Course = {
  id: string;
  cycle_id: string;
  slug: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  lessons: Lesson[];
};
type Cycle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  order_index: number;
  is_published: boolean;
  courses: Course[];
};

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea";
  required?: boolean;
  placeholder?: string;
};

const cycleFields: Field[] = [
  { name: "title", label: "Título", required: true },
  { name: "slug", label: "Identificador (slug)", required: true },
  { name: "subtitle", label: "Subtítulo" },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "order_index", label: "Ordem", type: "number" },
];
const courseFields: Field[] = [
  { name: "title", label: "Título", required: true },
  { name: "slug", label: "Identificador (slug)", required: true },
  { name: "description", label: "Descrição", type: "textarea" },
  { name: "order_index", label: "Ordem", type: "number" },
];
const lessonFields: Field[] = [
  { name: "title", label: "Título", required: true },
  { name: "slug", label: "Identificador (slug)", required: true },
  { name: "summary", label: "Resumo", type: "textarea" },
  { name: "duration_label", label: "Duração", placeholder: "ex.: 35 min" },
  {
    name: "video_url",
    label: "Ligação do vídeo",
    placeholder: "Deixe vazio se ainda não existir",
  },
  { name: "order_index", label: "Ordem", type: "number" },
];
const materialFields: Field[] = [
  { name: "title", label: "Título", required: true },
  { name: "kind", label: "Tipo", placeholder: "pdf, audio, ligação" },
  { name: "url", label: "Ligação", required: true },
  { name: "order_index", label: "Ordem", type: "number" },
];

type EditorTarget =
  | { table: "cycles"; fields: Field[]; row: Record<string, unknown> | null; base?: Record<string, unknown>; label: string }
  | { table: "courses"; fields: Field[]; row: Record<string, unknown> | null; base?: Record<string, unknown>; label: string }
  | { table: "lessons"; fields: Field[]; row: Record<string, unknown> | null; base?: Record<string, unknown>; label: string }
  | { table: "lesson_materials"; fields: Field[]; row: Record<string, unknown> | null; base?: Record<string, unknown>; label: string };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminCourses() {
  const { isAdmin } = useRoles();
  const [cycles, setCycles] = useState<Cycle[] | null>(null);
  const [error, setError] = useState(false);
  const [openCycles, setOpenCycles] = useState<Record<string, boolean>>({});
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>({});
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({});
  const [editor, setEditor] = useState<EditorTarget | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("cycles")
      .select(
        "id, slug, title, subtitle, description, order_index, is_published, courses(id, cycle_id, slug, title, description, order_index, is_published, lessons(id, course_id, slug, title, summary, duration_label, order_index, video_url, is_published, lesson_materials(id, lesson_id, title, kind, url, order_index)))",
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

  async function remove(
    table: "cycles" | "courses" | "lessons" | "lesson_materials",
    id: string,
    warning: string,
  ) {
    if (!window.confirm(warning)) return;
    const { error: err } = await supabase.from(table).delete().eq("id", id);
    if (err)
      return toast.error(
        "Não foi possível remover. Verifique se ainda existem itens associados.",
      );
    toast.success("Removido.");
    void load();
  }

  if (error)
    return <p className="text-muted-foreground text-sm">Não foi possível carregar o conteúdo.</p>;
  if (!cycles) return <LoadingState label="A carregar cursos…" />;

  const sortedCycles = cycles.slice().sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-muted-foreground max-w-2xl text-sm">
          Faça a gestão completa da Escola Arautos: crie e edite ciclos, cursos,
          aulas e materiais, defina a ordem e publique quando o conteúdo
          estiver pronto. Enquanto uma aula não tiver ligação de vídeo, mostra
          o estado “vídeo ainda não disponível”.
        </p>
        {isAdmin && (
          <button
            onClick={() =>
              setEditor({
                table: "cycles",
                fields: cycleFields,
                row: null,
                base: { order_index: sortedCycles.length + 1 },
                label: "Novo ciclo",
              })
            }
            className="border-gold/50 text-primary hover:bg-primary/10 focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Novo ciclo
          </button>
        )}
      </div>

      {sortedCycles.map((cy) => {
        const courses = (cy.courses ?? []).slice().sort((a, b) => a.order_index - b.order_index);
        const cycleOpen = openCycles[cy.id] ?? false;
        return (
          <section key={cy.id} className="border-border bg-card/40 rounded-2xl border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setOpenCycles((s) => ({ ...s, [cy.id]: !cycleOpen }))}
                aria-expanded={cycleOpen}
                className="focus-ring flex min-w-0 items-center gap-2 rounded-lg text-left"
              >
                <Caret open={cycleOpen} />
                <span className="min-w-0">
                  <span className="font-display block truncate text-xl">{cy.title}</span>
                  <span className="text-muted-foreground block text-xs">
                    {courses.length} cursos · ordem {cy.order_index} · /{cy.slug}
                  </span>
                </span>
              </button>
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <PublishToggle
                    checked={cy.is_published}
                    label={`Publicar ciclo ${cy.title}`}
                    onChange={(v) => togglePublished("cycles", cy.id, v)}
                  />
                  <IconButton
                    label={`Editar ciclo ${cy.title}`}
                    onClick={() =>
                      setEditor({ table: "cycles", fields: cycleFields, row: cy as never, label: "Editar ciclo" })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                  <IconButton
                    label={`Remover ciclo ${cy.title}`}
                    danger
                    onClick={() =>
                      remove("cycles", cy.id, `Remover o ciclo “${cy.title}”? Só é possível se não tiver cursos associados.`)
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                </div>
              )}
            </div>

            {cycleOpen && (
              <div className="mt-5 space-y-3 border-t border-border/60 pt-5">
                {isAdmin && (
                  <button
                    onClick={() =>
                      setEditor({
                        table: "courses",
                        fields: courseFields,
                        row: null,
                        base: { cycle_id: cy.id, order_index: courses.length + 1 },
                        label: `Novo curso em ${cy.title}`,
                      })
                    }
                    className="border-border focus-ring text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden /> Novo curso
                  </button>
                )}

                {courses.length === 0 && (
                  <p className="text-muted-foreground text-xs">Este ciclo ainda não tem cursos.</p>
                )}

                {courses.map((co) => {
                  const lessons = (co.lessons ?? []).slice().sort((a, b) => a.order_index - b.order_index);
                  const courseOpen = openCourses[co.id] ?? false;
                  return (
                    <div key={co.id} className="border-border bg-card rounded-2xl border p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => setOpenCourses((s) => ({ ...s, [co.id]: !courseOpen }))}
                          aria-expanded={courseOpen}
                          className="focus-ring flex min-w-0 items-center gap-2 rounded-lg text-left"
                        >
                          <Caret open={courseOpen} />
                          <span className="min-w-0">
                            <span className="font-display block truncate text-lg">{co.title}</span>
                            <span className="text-muted-foreground block text-xs">
                              {lessons.length} aulas · ordem {co.order_index} · /{co.slug}
                            </span>
                          </span>
                        </button>
                        {isAdmin && (
                          <div className="flex items-center gap-3">
                            <PublishToggle
                              checked={co.is_published}
                              label={`Publicar curso ${co.title}`}
                              onChange={(v) => togglePublished("courses", co.id, v)}
                            />
                            <IconButton
                              label={`Editar curso ${co.title}`}
                              onClick={() =>
                                setEditor({ table: "courses", fields: courseFields, row: co as never, label: "Editar curso" })
                              }
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                            </IconButton>
                            <IconButton
                              label={`Remover curso ${co.title}`}
                              danger
                              onClick={() =>
                                remove("courses", co.id, `Remover o curso “${co.title}”? Só é possível se não tiver aulas associadas.`)
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </IconButton>
                          </div>
                        )}
                      </div>

                      {courseOpen && (
                        <div className="mt-5 space-y-3 border-t border-border/60 pt-5">
                          {isAdmin && (
                            <button
                              onClick={() =>
                                setEditor({
                                  table: "lessons",
                                  fields: lessonFields,
                                  row: null,
                                  base: { course_id: co.id, order_index: lessons.length + 1 },
                                  label: `Nova aula em ${co.title}`,
                                })
                              }
                              className="border-border focus-ring text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden /> Nova aula
                            </button>
                          )}

                          {lessons.length === 0 && (
                            <p className="text-muted-foreground text-xs">Este curso ainda não tem aulas.</p>
                          )}

                          {lessons.map((l) => {
                            const materials = (l.lesson_materials ?? [])
                              .slice()
                              .sort((a, b) => a.order_index - b.order_index);
                            const lessonOpen = openLessons[l.id] ?? false;
                            return (
                              <div
                                key={l.id}
                                className="border-border/60 bg-background/40 rounded-xl border p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <button
                                    onClick={() => setOpenLessons((s) => ({ ...s, [l.id]: !lessonOpen }))}
                                    aria-expanded={lessonOpen}
                                    className="focus-ring flex min-w-0 items-center gap-2 rounded-lg text-left"
                                  >
                                    <Caret open={lessonOpen} />
                                    <span className="min-w-0">
                                      <span className="block truncate text-sm">{l.title}</span>
                                      <span className="text-muted-foreground block text-xs">
                                        {materials.length} materiais ·{" "}
                                        {l.video_url ? "vídeo associado" : "sem vídeo"} · ordem{" "}
                                        {l.order_index}
                                      </span>
                                    </span>
                                  </button>
                                  {isAdmin && (
                                    <div className="flex items-center gap-3">
                                      <PublishToggle
                                        checked={l.is_published}
                                        label={`Publicar aula ${l.title}`}
                                        onChange={(v) => togglePublished("lessons", l.id, v)}
                                      />
                                      <IconButton
                                        label={`Editar aula ${l.title}`}
                                        onClick={() =>
                                          setEditor({ table: "lessons", fields: lessonFields, row: l as never, label: "Editar aula" })
                                        }
                                      >
                                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                                      </IconButton>
                                      <IconButton
                                        label={`Remover aula ${l.title}`}
                                        danger
                                        onClick={() =>
                                          remove("lessons", l.id, `Remover a aula “${l.title}”? Esta acção não pode ser anulada.`)
                                        }
                                      >
                                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                      </IconButton>
                                    </div>
                                  )}
                                </div>

                                {lessonOpen && (
                                  <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                                        Materiais
                                      </p>
                                      {isAdmin && (
                                        <button
                                          onClick={() =>
                                            setEditor({
                                              table: "lesson_materials",
                                              fields: materialFields,
                                              row: null,
                                              base: {
                                                lesson_id: l.id,
                                                kind: "pdf",
                                                order_index: materials.length + 1,
                                              },
                                              label: `Novo material em ${l.title}`,
                                            })
                                          }
                                          className="border-gold/50 text-primary focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
                                        >
                                          <Plus className="h-3 w-3" aria-hidden /> Adicionar
                                        </button>
                                      )}
                                    </div>
                                    {materials.length === 0 && (
                                      <p className="text-muted-foreground text-xs">
                                        Ainda não há materiais nesta aula.
                                      </p>
                                    )}
                                    <ul className="space-y-2">
                                      {materials.map((m) => (
                                        <li
                                          key={m.id}
                                          className="border-border/60 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                                        >
                                          <span className="min-w-0">
                                            <span className="block truncate text-xs">{m.title}</span>
                                            <span className="text-muted-foreground block truncate text-[11px]">
                                              {m.kind} · {m.url}
                                            </span>
                                          </span>
                                          {isAdmin && (
                                            <span className="flex items-center gap-2">
                                              <IconButton
                                                label={`Editar material ${m.title}`}
                                                onClick={() =>
                                                  setEditor({
                                                    table: "lesson_materials",
                                                    fields: materialFields,
                                                    row: m as never,
                                                    label: "Editar material",
                                                  })
                                                }
                                              >
                                                <Pencil className="h-3.5 w-3.5" aria-hidden />
                                              </IconButton>
                                              <IconButton
                                                label={`Remover material ${m.title}`}
                                                danger
                                                onClick={() =>
                                                  remove("lesson_materials", m.id, `Remover o material “${m.title}”?`)
                                                }
                                              >
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                              </IconButton>
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {editor && (
        <RecordDialog
          target={editor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function Caret({ open }: { open: boolean }) {
  return open ? (
    <ChevronDown className="text-primary h-4 w-4 shrink-0" aria-hidden />
  ) : (
    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`border-border focus-ring hover:bg-foreground/5 rounded-full border p-2 transition-colors ${
        danger ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function RecordDialog({
  target,
  onClose,
  onSaved,
}: {
  target: EditorTarget;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = { ...(target.base ?? {}) };
    for (const f of target.fields) {
      const raw = String(form.get(f.name) ?? "").trim();
      if (f.type === "number") payload[f.name] = Number(raw || 0);
      else if (f.name === "video_url" || f.name === "duration_label")
        payload[f.name] = raw || null;
      else payload[f.name] = raw;
    }
    if (typeof payload["slug"] === "string" && payload["slug"]) {
      payload["slug"] = slugify(payload["slug"] as string);
    }

    setSaving(true);
    const row = target.row as { id?: string } | null;
    const { error } = row?.id
      ? await supabase.from(target.table).update(payload as never).eq("id", row.id)
      : await supabase.from(target.table).insert(payload as never);
    setSaving(false);

    if (error) {
      toast.error(
        error.message.includes("duplicate")
          ? "Já existe um registo com esse identificador (slug)."
          : "Não foi possível guardar. Verifique os campos e as permissões.",
      );
      return;
    }
    toast.success("Guardado.");
    onSaved();
  }

  return (
    <div
      className="bg-background/80 fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={target.label}
    >
      <form
        onSubmit={submit}
        className="border-border bg-card w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
      >
        <h2 className="font-display text-xl">{target.label}</h2>
        <div className="mt-5 space-y-4">
          {target.fields.map((f) => {
            const value = (target.row?.[f.name] ?? target.base?.[f.name] ?? "") as string | number;
            const cls =
              "border-border bg-background/60 focus:border-gold w-full rounded-lg border px-3 py-2 text-sm outline-none";
            return (
              <label key={f.name} className="block">
                <span className="text-muted-foreground mb-1.5 block text-xs">{f.label}</span>
                {f.type === "textarea" ? (
                  <textarea
                    name={f.name}
                    rows={3}
                    required={f.required}
                    defaultValue={String(value ?? "")}
                    placeholder={f.placeholder}
                    className={cls}
                  />
                ) : (
                  <input
                    name={f.name}
                    type={f.type === "number" ? "number" : "text"}
                    required={f.required}
                    defaultValue={String(value ?? "")}
                    placeholder={f.placeholder}
                    className={cls}
                  />
                )}
              </label>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border-border focus-ring text-muted-foreground rounded-full border px-5 py-2 text-xs"
          >
            Cancelar
          </button>
          <button
            disabled={saving}
            className="border-gold/50 text-primary hover:bg-primary/10 focus-ring rounded-full border px-5 py-2 text-xs disabled:opacity-60"
          >
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </form>
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
