import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { LoadingState } from "@/components/states";
import { deleteComment, moderateComment } from "@/lib/moderation.functions";

export const Route = createFileRoute("/admin/comentarios")({
  head: () => ({ meta: [
    { title: "Moderação de comentários — Visão Arautos" },
    { name: "description", content: "Revisão dos comentários das aulas pela equipa Arautos." },
    { property: "og:title", content: "Moderação de comentários — Visão Arautos" },
    { property: "og:description", content: "Revisão dos comentários das aulas pela equipa Arautos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminComments,
});

type Row = {
  id: string;
  display_name: string;
  body: string;
  status: string;
  created_at: string;
  lessons: { title: string; courses: { title: string } | null } | null;
};

function AdminComments() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const moderate = useServerFn(moderateComment);
  const removeFn = useServerFn(deleteComment);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("lesson_comments")
      .select("id, display_name, body, status, created_at, lessons(title, courses(title))")
      .order("created_at", { ascending: false })
      .limit(200);
    setError(Boolean(err));
    setRows((data as unknown as Row[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: "approved" | "rejected") {
    try {
      await moderate({ data: { id, status } });
    } catch {
      return toast.error("Não foi possível actualizar o comentário.");
    }
    setRows((r) => (r ?? []).map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success(status === "approved" ? "Comentário aprovado." : "Comentário rejeitado.");
  }

  async function remove(id: string) {
    try {
      await removeFn({ data: { id } });
    } catch {
      return toast.error("Não foi possível remover o comentário.");
    }
    setRows((r) => (r ?? []).filter((c) => c.id !== id));
    toast.success("Comentário removido.");
  }

  if (error)
    return <p className="text-muted-foreground text-sm">Não foi possível carregar os comentários.</p>;
  if (!rows) return <LoadingState label="A carregar comentários…" />;
  if (rows.length === 0)
    return <p className="text-muted-foreground text-sm">Ainda não há comentários nas aulas.</p>;

  return (
    <ul className="space-y-3">
      {rows.map((c) => (
        <li
          key={c.id}
          className="border-border bg-card flex items-start justify-between gap-4 rounded-2xl border p-5"
        >
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              {c.lessons?.courses?.title ?? "Curso"} · {c.lessons?.title ?? "Aula"} ·{" "}
              {c.status === "approved"
                ? "aprovado"
                : c.status === "rejected"
                  ? "rejeitado"
                  : "em moderação"}
            </p>
            <p className="font-display mt-1 text-base">{c.display_name}</p>
            <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{c.body}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setStatus(c.id, "approved")}
              aria-label="Aprovar comentário"
              className="border-gold/50 text-primary rounded-full border p-2"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStatus(c.id, "rejected")}
              aria-label="Rejeitar comentário"
              className="border-border text-muted-foreground rounded-full border p-2"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={() => remove(c.id)}
              aria-label="Remover comentário"
              className="border-border text-muted-foreground rounded-full border p-2"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
