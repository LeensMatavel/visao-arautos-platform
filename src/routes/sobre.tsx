import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Flame,
  Users,
  Globe2,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Visão Arautos — Movimento cristão de formação e missão" },
      {
        name: "description",
        content:
          "Conheça a Visão Arautos: movimento cristão evangélico, pentecostal e interdenominacional de formação bíblica, despertar, discipulado, evangelismo e missões.",
      },
      { property: "og:title", content: "Sobre a Visão Arautos" },
      {
        property: "og:description",
        content:
          "Identidade, missão, visão, valores e frentes de ministério do movimento Visão Arautos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SobrePage,
});

const fronts = [
  {
    icon: BookOpen,
    title: "Formação bíblica",
    text: "Estudo sério das Escrituras, com profundidade e devoção.",
  },
  {
    icon: Flame,
    title: "Despertar espiritual",
    text: "Encontros e vigílias para reacender o fogo do primeiro amor.",
  },
  {
    icon: Users,
    title: "Discipulado",
    text: "Relações que formam seguidores maduros de Jesus.",
  },
  {
    icon: Heart,
    title: "Evangelismo",
    text: "Anunciar Cristo com clareza, coragem e compaixão.",
  },
  {
    icon: Globe2,
    title: "Missões",
    text: "Envio, sustento e mobilização para o campo missionário.",
  },
  {
    icon: Sparkles,
    title: "Espiritualidade pentecostal",
    text: "Fogo do Espírito com equilíbrio bíblico e reverência.",
  },
];

const values = [
  {
    title: "Escrituras em primeiro lugar",
    text: "A Bíblia é a nossa regra de fé e prática; toda experiência é avaliada por ela.",
  },
  {
    title: "Espiritualidade com equilíbrio",
    text: "Vivemos a plenitude do Espírito sem sensacionalismo, com reverência e sobriedade.",
  },
  {
    title: "Interdenominacional",
    text: "Servimos a Igreja de Cristo, sem substituir a igreja local de cada arauto.",
  },
  {
    title: "Formação que envia",
    text: "Formamos para o serviço: quem aprende, discipula; quem é enviado, permanece sustentado.",
  },
];

function SobrePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-hero border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Sobre" }]} />
            <p className="text-primary mt-8 text-xs tracking-[0.3em] uppercase">
              Sobre o movimento
            </p>
            <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl">
              Despertando uma geração{" "}
              <span className="text-gold-gradient">para Cristo</span>.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
              A Visão Arautos é um movimento cristão evangélico, pentecostal e
              interdenominacional, dedicado à formação bíblica, ao despertar
              espiritual, ao discipulado, ao evangelismo e às missões.
            </p>
          </div>
        </section>

        <section id="missao-visao" className="scroll-mt-24 border-b border-border/60 py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-2">
            <div>
              <h2 className="text-primary text-xs tracking-[0.3em] uppercase">Missão</h2>
              <p className="font-display mt-4 text-4xl leading-tight">
                Formar arautos das boas novas para toda a geração.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Existimos para preparar homens e mulheres firmados na Palavra,
                cheios do Espírito e apaixonados por Jesus, capazes de anunciar o
                Evangelho com integridade em qualquer lugar da terra.
              </p>
            </div>
            <div>
              <h2 className="text-primary text-xs tracking-[0.3em] uppercase">Visão</h2>
              <p className="font-display mt-4 text-4xl leading-tight">
                Uma geração desperta, madura e enviada.
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Sonhamos com uma Igreja em avivamento sadio: profunda nas
                Escrituras, viva no Espírito, unida no amor e activa na missão de
                Cristo até aos confins da terra.
              </p>
            </div>
          </div>
        </section>

        <section id="valores" className="scroll-mt-24 border-b border-border/60 bg-accent/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-primary text-xs tracking-[0.3em] uppercase">Valores</h2>
            <p className="font-display mt-4 max-w-2xl text-4xl leading-tight">
              O que nos mantém firmes.
            </p>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2">
              {values.map((v) => (
                <div key={v.title} className="bg-card p-8">
                  <h3 className="font-display text-2xl">{v.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="frentes" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-primary text-xs tracking-[0.3em] uppercase">
              Frentes de ministério
            </h2>
            <p className="font-display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
              Seis frentes, um só chamado.
            </p>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
              {fronts.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-card p-8">
                  <Icon className="text-primary h-8 w-8" strokeWidth={1.4} aria-hidden="true" />
                  <h3 className="font-display mt-6 text-2xl">{title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap gap-3">
              <Link
                to="/escola"
                className="bg-gold text-primary-foreground focus-ring inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium shadow-gold"
              >
                Conhecer a Escola Arautos
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/missoes"
                className="border-border hover:border-gold focus-ring inline-flex items-center rounded-full border px-7 py-3.5 text-sm transition-colors"
              >
                Ver projectos missionários
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
