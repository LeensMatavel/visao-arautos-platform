import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HeartHandshake, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { toast } from "sonner";

export const Route = createFileRoute("/oracao")({
  head: () => ({
    meta: [
      { title: "Rede de Oração — Visão Arautos" },
      { name: "description", content: "Compartilhe pedidos e interceda pela comunidade Arautos." },
    ],
  }),
  component: OracaoPage,
});

type Prayer = { id: string; name: string; text: string; prayed: number };

const seed: Prayer[] = [
  { id: "1", name: "Família Souza", text: "Cura para nossa filha e paz em nosso lar.", prayed: 42 },
  { id: "2", name: "Isaque", text: "Direção sobre o campo missionário na Ásia.", prayed: 27 },
  { id: "3", name: "Igreja em Belém", text: "Avivamento e novos discípulos nesta estação.", prayed: 61 },
];

function OracaoPage() {
  const [prayers, setPrayers] = useState<Prayer[]>(seed);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "Anônimo");
    const text = String(form.get("text") || "");
    if (!text) return;
    setPrayers((p) => [
      { id: crypto.randomUUID(), name, text, prayed: 0 },
      ...p,
    ]);
    (e.currentTarget as HTMLFormElement).reset();
    toast.success("Pedido compartilhado. Estamos orando com você.");
  }

  const prayFor = (id: string) =>
    setPrayers((ps) =>
      ps.map((p) => (p.id === id ? { ...p, prayed: p.prayed + 1 } : p)),
    );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-hero border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
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
          {prayers.map((p) => (
            <div key={p.id} className="border-border bg-card rounded-2xl border p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <p className="font-display text-lg">{p.name}</p>
                  <p className="text-muted-foreground mt-2 text-sm">{p.text}</p>
                </div>
                <button
                  onClick={() => prayFor(p.id)}
                  className="border-gold/40 text-primary hover:bg-primary/10 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs"
                >
                  <HeartHandshake className="h-4 w-4" /> Orei ({p.prayed})
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="border-border bg-card h-fit rounded-2xl border p-6 md:sticky md:top-24">
          <h3 className="font-display text-lg">Compartilhe um pedido</h3>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              name="name"
              placeholder="Seu nome (ou anônimo)"
              className="border-border bg-background/60 focus:border-gold w-full rounded-lg border px-4 py-3 text-sm outline-none"
            />
            <textarea
              name="text"
              rows={5}
              placeholder="Como podemos orar por você?"
              className="border-border bg-background/60 focus:border-gold w-full rounded-lg border px-4 py-3 text-sm outline-none"
            />
            <button className="bg-gold text-primary-foreground inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium">
              <Send className="h-4 w-4" /> Enviar
            </button>
          </form>
        </aside>
      </section>
      <SiteFooter />
    </div>
  );
}
