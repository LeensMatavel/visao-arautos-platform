import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

type Comment = {
  id: string;
  user_id: string;
  display_name: string;
  body: string;
  status: string;
  created_at: string;
};

export function LessonComments({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("lesson_comments")
      .select("id, user_id, display_name, body, status, created_at")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false })
      .limit(50);
    setError(Boolean(err));
    setComments((data as Comment[]) ?? []);
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = e.currentTarget;
    const body = String(new FormData(form).get("comment") || "").trim();
    if (!body) return;

    setSending(true);
    const { error: err } = await supabase.from("lesson_comments").insert({
      lesson_id: lessonId,
      user_id: user.id,
      display_name: user.name,
      body,
    });
    setSending(false);
    if (err) {
      toast.error("Não foi possível enviar o comentário.");
      return;
    }
    form.reset();
    toast.success("Comentário enviado para moderação.");
    void load();
  }

  return (
    <div className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="text-primary h-4 w-4" />
        <h3 className="font-display text-sm tracking-widest uppercase">Discussão</h3>
      </div>

      <div className="mt-6 space-y-5">
        {loading ? (
          <p className="text-muted-foreground text-sm">A carregar comentários…</p>
        ) : error ? (
          <p className="text-muted-foreground text-sm">
            Não foi possível carregar a discussão desta aula.
          </p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Ainda não há comentários publicados nesta aula.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="border-gold/40 bg-gold/10 text-primary grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs">
                {c.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {c.display_name}
                  {c.status !== "approved" && (
                    <span className="text-muted-foreground ml-2 text-[10px] tracking-widest uppercase">
                      {c.status === "rejected" ? "não aprovado" : "em moderação"}
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">
                  {c.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {user ? (
        <form onSubmit={submit} className="mt-6 flex gap-2">
          <input
            name="comment"
            aria-label="Comentário"
            placeholder="Deixe um comentário…"
            className="border-border bg-background/60 focus:border-gold flex-1 rounded-full border px-5 py-2.5 text-sm outline-none"
          />
          <button
            disabled={sending}
            className="bg-gold text-primary-foreground rounded-full px-5 py-2.5 text-xs font-medium disabled:opacity-60"
          >
            {sending ? "A enviar…" : "Enviar"}
          </button>
        </form>
      ) : (
        <p className="text-muted-foreground mt-6 text-sm">
          <Link to="/auth" search={{ mode: "login" }} className="text-primary underline">
            Entre na sua conta
          </Link>{" "}
          para participar na discussão. Os comentários passam por moderação.
        </p>
      )}
    </div>
  );
}
