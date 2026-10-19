import { createFileRoute } from "@tanstack/react-router";
import { Globe2, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const Route = createFileRoute("/missoes")({
  head: () => ({
    meta: [
      { title: "Missões — Visão Arautos" },
      { name: "description", content: "Projetos missionários apoiados pelo movimento Arautos." },
      { property: "og:title", content: "Missões — Visão Arautos" },
      { property: "og:description", content: "Projetos missionários apoiados pelo movimento Arautos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MissoesPage,
});

const projects = [
  {
    region: "Moçambique",
    title: "Comunidades rurais do Zambeze",
    text: "Evangelismo, discipulado e apoio social em comunidades rurais.",
    goal: 78,
  },
  {
    region: "Ásia Central",
    title: "Povos não alcançados",
    text: "Envio de família missionária para tradução bíblica e plantação de igrejas.",
    goal: 42,
  },
  {
    region: "África Ocidental",
    title: "Escola bíblica rural",
    text: "Formação de líderes locais em regiões de difícil acesso.",
    goal: 61,
  },
  {
    region: "Europa",
    title: "Reavivamento nas cidades",
    text: "Plantação de comunidades em cidades pós-cristãs.",
    goal: 25,
  },
];

function MissoesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">
      <section className="bg-hero border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Missões" }]} />
          <p className="text-primary text-xs tracking-[0.3em] uppercase">Missões</p>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl">
            Até os <span className="text-gold-gradient">confins</span> da terra.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
            Projetos missionários apoiados, sustentados e enviados pelo movimento Arautos.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((p) => (
            <div key={p.title} className="border-border bg-card rounded-2xl border p-8">
              <div className="flex items-center gap-3">
                <div className="border-gold/40 bg-gold/5 grid h-10 w-10 place-items-center rounded-full border">
                  <Globe2 className="text-primary h-4 w-4" />
                </div>
                <p className="text-muted-foreground text-xs tracking-widest uppercase inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {p.region}
                </p>
              </div>
              <h3 className="font-display mt-4 text-2xl">{p.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{p.text}</p>
              <div className="mt-6">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="bg-gold h-full" style={{ width: `${p.goal}%` }} />
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {p.goal}% da meta anual arrecadada
                </p>
              </div>
              <button className="bg-gold text-primary-foreground mt-6 rounded-full px-5 py-2 text-xs font-medium">
                Apoiar este projeto
              </button>
            </div>
          ))}
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
