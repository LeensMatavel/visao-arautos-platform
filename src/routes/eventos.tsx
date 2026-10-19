import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos — Visão Arautos" },
      { name: "description", content: "Vigílias, conferências e encontros do movimento Arautos." },
      { property: "og:title", content: "Eventos — Visão Arautos" },
      { property: "og:description", content: "Vigílias, conferências e encontros do movimento Arautos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventosPage,
});

const events = [
  { title: "Vigília do Despertar", date: "Sábado · 22h", city: "Maputo, Moçambique", tag: "Vigília" },
  { title: "Conferência Arautos", date: "12–14 de Dezembro", city: "Beira, Moçambique", tag: "Conferência" },
  { title: "Culto Missionário", date: "Domingo · 19h", city: "Online", tag: "Missões" },
  { title: "Retiro de Formação", date: "18–20 de Janeiro", city: "Nampula, Moçambique", tag: "Retiro" },
];

function EventosPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">
      <section className="bg-hero border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Eventos" }]} />
          <p className="text-primary text-xs tracking-[0.3em] uppercase">Eventos</p>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl">
            Encontros para <span className="text-gold-gradient">despertar</span> a Igreja.
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((e) => (
            <div key={e.title} className="border-border bg-card rounded-2xl border p-8">
              <p className="text-primary text-xs tracking-widest uppercase">{e.tag}</p>
              <h2 className="font-display mt-3 text-2xl">{e.title}</h2>
              <div className="text-muted-foreground mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {e.date}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {e.city}</p>
              </div>
              <button className="bg-gold text-primary-foreground mt-6 rounded-full px-5 py-2 text-xs font-medium">
                Quero participar
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
