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
import { cycles } from "@/lib/courses";
import heroAsset from "@/assets/hero-oracao.jpg.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Arautos — Despertando uma geração para Cristo" },
      { name: "description", content: "Movimento cristão de formação bíblica, despertar espiritual, discipulado, evangelismo e missões, com espiritualidade pentecostal e equilíbrio bíblico." },
      { property: "og:title", content: "Visão Arautos — Despertando uma geração para Cristo" },
      { property: "og:description", content: "Movimento cristão de formação bíblica, despertar espiritual, discipulado, evangelismo e missões, com espiritualidade pentecostal e equilíbrio bíblico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const fronts = [
  {
    icon: BookOpen,
    title: "Formação Bíblica",
    text: "Estudo sério das Escrituras, com profundidade e devoção.",
  },
  {
    icon: Flame,
    title: "Despertar Espiritual",
    text: "Encontros e vigílias para reacender o fogo do primeiro amor.",
  },
  {
    icon: Users,
    title: "Discipulado",
    text: "Relacionamentos que formam seguidores maduros de Jesus.",
  },
  {
    icon: Globe2,
    title: "Missões",
    text: "Envio, sustento e mobilização para o campo missionário.",
  },
  {
    icon: Heart,
    title: "Evangelismo",
    text: "Anunciar Cristo com clareza, coragem e compaixão.",
  },
  {
    icon: Sparkles,
    title: "Espiritualidade Pentecostal",
    text: "Fogo do Espírito com equilíbrio bíblico e reverência.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        {/* Background photograph */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroAsset.url}
            alt="Jovens reunidos em oração de mãos dadas ao amanhecer"
            className="h-full w-full object-cover object-center"
          />
          {/* Overlay: navy/black, mais escuro à esquerda */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-navy-deep/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
          <div className="max-w-2xl">
            <div className="border-gold/40 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase sm:text-xs">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              Visão Arautos
            </div>
            <h1 className="font-display mt-6 text-4xl leading-[1.05] tracking-tight uppercase sm:text-6xl lg:text-7xl">
              Despertando<br />
              <span className="text-gold-gradient">uma geração</span><br />
              para Cristo
            </h1>
            <div className="mt-7 h-px w-28 bg-gradient-to-r from-primary to-transparent" />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/85 sm:text-lg">
              Um chamado ao despertar, à Palavra e à missão.
            </p>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
              Movimento cristão evangélico comprometido com o Evangelho, a
              formação de uma geração e a missão de Cristo.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/sobre"
                className="bg-gold text-primary-foreground inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide uppercase shadow-gold transition-transform hover:scale-[1.02]"
              >
                Conheça a visão
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="border-gold text-primary hover:bg-primary/10 inline-flex items-center justify-center rounded-full border px-7 py-3.5 text-sm tracking-wide uppercase transition-colors"
              >
                Entrar na comunidade
              </Link>
            </div>

            <div className="mt-14 grid max-w-md grid-cols-3 gap-6">
              {[
                { n: "5", l: "Ciclos" },
                { n: "22+", l: "Cursos" },
                { n: "∞", l: "Missão" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-primary text-4xl">{s.n}</p>
                  <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* MISSÃO / VISÃO */}
      <section id="missao" className="border-t border-border/60 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-primary text-xs tracking-[0.3em] uppercase">Missão</p>
            <h2 className="font-display mt-4 text-4xl leading-tight">
              Formar arautos das boas novas para toda geração.
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Existimos para preparar homens e mulheres firmados na Palavra,
              cheios do Espírito e apaixonados por Jesus, capazes de anunciar o
              Evangelho com integridade em qualquer lugar da terra.
            </p>
          </div>
          <div id="visao">
            <p className="text-primary text-xs tracking-[0.3em] uppercase">Visão</p>
            <h2 className="font-display mt-4 text-4xl leading-tight">
              Uma geração desperta, madura e enviada.
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Sonhamos com uma igreja em avivamento sadio: profunda nas
              Escrituras, viva no Espírito, unida no amor e activa na missão de
              Cristo até os confins da terra.
            </p>
          </div>
        </div>
      </section>

      {/* FRENTES */}
      <section id="frentes" className="border-t border-border/60 bg-accent/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-primary text-xs tracking-[0.3em] uppercase">
              Frentes de ministério
            </p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">
              Seis frentes, um só chamado.
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
            {fronts.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group bg-card hover:bg-accent relative p-8 transition-colors"
              >
                <Icon className="text-primary h-8 w-8" strokeWidth={1.4} />
                <h3 className="font-display mt-6 text-2xl">{title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {text}
                </p>
                <div className="from-primary/0 via-primary/60 to-primary/0 mt-6 h-px w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESCOLA */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-primary text-xs tracking-[0.3em] uppercase">
                Escola Arautos
              </p>
              <h2 className="font-display mt-4 text-4xl sm:text-5xl">
                Cinco ciclos de formação profunda.
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Um caminho estruturado do fundamento à formação ministerial, com
                cursos, aulas, materiais e progresso pessoal.
              </p>
            </div>
            <Link
              to="/escola"
              className="text-primary inline-flex items-center gap-2 text-sm"
            >
              Ver todos os cursos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cycles.map((c) => (
              <Link
                key={c.id}
                to="/escola"
                hash={c.id}
                className="group border-border bg-card hover:border-gold relative overflow-hidden rounded-2xl border p-8 transition-all hover:shadow-elegant"
              >
                <p className="text-primary/70 font-display text-6xl leading-none">
                  {String(c.order).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-4 text-2xl">{c.title.split("—")[1]?.trim()}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{c.subtitle}</p>
                <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
                  {c.description}
                </p>
                <p className="text-primary mt-6 flex items-center gap-2 text-sm">
                  {c.courses.length} cursos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/60">
        <div className="bg-hero absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6">
          <p className="text-primary text-xs tracking-[0.3em] uppercase">
            Vem, arauto
          </p>
          <h2 className="font-display mt-6 text-4xl leading-tight sm:text-6xl">
            "Como são formosos os pés dos que anunciam <span className="text-gold-gradient">boas novas!</span>"
          </h2>
          <p className="text-muted-foreground mt-6 text-sm tracking-widest uppercase">
            Romanos 10.15
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="bg-gold text-primary-foreground rounded-full px-8 py-4 text-sm font-medium shadow-gold"
            >
              Começar minha jornada
            </Link>
            <Link
              to="/missoes"
              className="border-border hover:border-gold rounded-full border px-8 py-4 text-sm"
            >
              Apoiar missões
            </Link>
          </div>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
