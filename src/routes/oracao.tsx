import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HeartHandshake, Send, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState, LoadingState } from "@/components/states";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/oracao")({
  head: () => ({
    meta: [
      { title: "Rede de Oração — Visão Arautos" },
      { name: "description", content: "Partilhe pedidos e interceda pela comunidade Arautos." },
      { property: "og:title", content: "Rede de Oração — Visão Arautos" },
      { property: "og:description", content: "Partilhe pedidos e interceda pela comunidade Arautos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OracaoPage,
});

type Prayer = {
  id: string;
  display_name: string;
  body: string;
  prayed_count: number;
  created_at: string;
};

function OracaoPage() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("id, display_name, body, prayed_count, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) toast.error("Não foi possível carregar os pedidos.");
    setPrayers((data as Prayer[]) ?? []);
    setLoading(false);

    if (user) {
      const [{ data: rows }, { data: ownRows, error: ownError }] = await Promise.all([
        supabase.from("prayer_intercessions").select("request_id"),
        supabase.rpc("own_prayer_request_ids"),
      ]);
      setMine(new Set((rows ?? []).map((r) => r.request_id)));
      setOwned(new Set((ownRows ?? []).map((r) => r.id)));
      if (ownError) toast.error("Não foi possível identificar os seus pedidos.");
    } else {
      setMine(new Set());
      setOwned(new Set());
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      toast.error("Entre na sua conta para partilhar um pedido.");
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("text") || "").trim();
    const anonymous = data.get("anonymous") === "on";
    const name = String(data.get("name") || "").trim();
    if (!body) return;

    setSending(true);
    const { error } = await supabase.from("prayer_requests").insert({
      user_id: user.id,
      body,
      is_anonymous: anonymous,
      display_name: anonymous ? "Anónimo" : name || user.name,
    });
    setSending(false);

    if (error) {
      toast.error("Não foi possível guardar o pedido.");
      return;
    }
    form.reset();
    toast.success("Pedido partilhado. Estamos a orar consigo.");
    void load();
  }

  async function prayFor(id: string) {
    if (!user) {
      toast.error("Entre na sua conta para interceder.");
      return;
    }
    const already = mine.has(id);
    setPrayers((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, prayed_count: Math.max(p.prayed_count + (already ? -1 : 1), 0) }
          : p,
      ),
    );
    setMine((s) => {
      const next = new Set(s);
      if (already) next.delete(id);
      else next.add(id);
      return next;
    });

    const { error } = already
      ? await supabase
          .from("prayer_intercessions")
          .delete()
          .eq("request_id", id)
          .eq("user_id", user.id)
      : await supabase
          .from("prayer_intercessions")
          .insert({ request_id: id, user_id: user.id });

    if (error) {
      toast.error("Não foi possível registar a intercessão.");
      void load();
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("prayer_requests").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível remover o pedido.");
      return;
    }
    setPrayers((ps) => ps.filter((p) => p.id !== id));
    toast.success("Pedido removido.");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-hero border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
            <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Pedidos de oração" }]} />
            <p className="text-primary text-xs tracking-[0.3em] uppercase">Rede de Oração</p>
            <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl">
              "Orai <span className="text-gold-gradient">uns pelos outros</span>."
            </h1>
            <p className="text-muted-foreground mt-4 text-sm tracking-widest uppercase">
              Tiago 5.16
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {loading ? (
              <LoadingState label="A carregar pedidos de oração..." />
            ) : prayers.length === 0 ? (
              <EmptyState
                title="Ainda não há pedidos"
                description="Seja o primeiro a partilhar um pedido com a comunidade."
              />
            ) : (
              prayers.map((p) => (
                <div key={p.id} className="border-border bg-card rounded-2xl border p-6">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-lg">{p.display_name}</p>
                      <p className="text-muted-foreground mt-2 text-sm whitespace-pre-line">
                        {p.body}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {user && owned.has(p.id) && (
                        <Button
                          onClick={() => remove(p.id)}
                          aria-label="Remover o meu pedido"
                          title="Remover o meu pedido"
                          variant="outline"
                          size="icon"
                          className="border-border text-muted-foreground hover:text-foreground rounded-full border p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <button
                        onClick={() => prayFor(p.id)}
                        aria-pressed={mine.has(p.id)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                          mine.has(p.id)
                            ? "border-gold bg-primary/15 text-primary"
                            : "border-gold/40 text-primary hover:bg-primary/10"
                        }`}
                      >
                        <HeartHandshake className="h-4 w-4" /> Orei ({p.prayed_count})
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="border-border bg-card h-fit rounded-2xl border p-6 md:sticky md:top-24">
            <h3 className="font-display text-lg">Partilhe um pedido</h3>
            {user ? (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <input
                  name="name"
                  defaultValue={user.name}
                  aria-label="Nome a apresentar"
                  placeholder="Nome a apresentar"
                  className="border-border bg-background/60 focus:border-gold w-full rounded-lg border px-4 py-3 text-sm outline-none"
                />
                <textarea
                  name="text"
                  rows={5}
                  aria-label="Pedido de oração"
                  placeholder="Como podemos orar por si?"
                  className="border-border bg-background/60 focus:border-gold w-full rounded-lg border px-4 py-3 text-sm outline-none"
                />
                <label className="text-muted-foreground flex items-center gap-2 text-xs">
                  <input type="checkbox" name="anonymous" className="accent-primary" />
                  Publicar como anónimo
                </label>
                <button
                  disabled={sending}
                  className="bg-gold text-primary-foreground inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> {sending ? "A enviar..." : "Enviar"}
                </button>
              </form>
            ) : (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm">
                  Entre na sua conta para partilhar pedidos e interceder pelos outros.
                </p>
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  className="bg-gold text-primary-foreground mt-4 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-medium"
                >
                  Entrar
                </Link>
              </div>
            )}
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
