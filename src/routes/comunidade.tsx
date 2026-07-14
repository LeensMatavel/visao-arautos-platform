import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Users, HeartHandshake } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade — Visão Arautos" },
      { name: "description", content: "Grupos de estudo, fóruns e vida em comunidade." },
    ],
  }),
  component: ComunidadePage,
});

const groups = [
  { name: "Estudo em Romanos", members: 128, topic: "Discipulado" },
  { name: "Jovens Arautos", members: 245, topic: "Juventude" },
  { name: "Intercessão pelas Nações", members: 96, topic: "Oração" },
  { name: "Missões Transculturais", members: 74, topic: "Missões" },
];

function ComunidadePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-hero border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <p className="text-primary text-xs tracking-[0.3em] uppercase">Comunidade</p>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl">
            Ninguém caminha <span className="text-gold-gradient">sozinho</span>.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
            Grupos de estudo, redes de oração e comunhão para andar em unidade.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.name} className="border-border bg-card rounded-2xl border p-8">
              <div className="flex items-center gap-3">
                <div className="border-gold/40 bg-gold/5 grid h-10 w-10 place-items-center rounded-full border">
                  <Users className="text-primary h-4 w-4" />
                </div>
                <p className="text-muted-foreground text-xs tracking-widest uppercase">
                  {g.topic}
                </p>
              </div>
              <h3 className="font-display mt-4 text-2xl">{g.name}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{g.members} membros</p>
              <button className="border-border hover:border-gold mt-6 rounded-full border px-5 py-2 text-xs">
                Entrar no grupo
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          <Link
            to="/oracao"
            className="border-border bg-card hover:border-gold group rounded-2xl border p-8 transition"
          >
            <HeartHandshake className="text-primary h-6 w-6" />
            <h3 className="font-display mt-4 text-2xl">Rede de Oração</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Compartilhe e interceda por pedidos da comunidade.
            </p>
          </Link>
          <div className="border-border bg-card rounded-2xl border p-8">
            <MessageCircle className="text-primary h-6 w-6" />
            <h3 className="font-display mt-4 text-2xl">Fórum</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Discussões teológicas, dúvidas de estudo e edificação mútua.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
