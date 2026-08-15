import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Visão Arautos" },
      { name: "description", content: "Reflexões, ensinos e testemunhos do movimento Arautos." },
    ],
  }),
  component: BlogPage,
});

const posts = [
  {
    tag: "Vida no Espírito",
    title: "O fogo que não consome, mas transforma",
    excerpt: "Uma reflexão sobre a chama do Espírito que Moisés viu em Horebe e o chamado que ainda ecoa hoje.",
    date: "12 nov 2025",
    author: "Pr. Daniel Reis",
  },
  {
    tag: "Discipulado",
    title: "O modelo de Jesus para formar seguidores",
    excerpt: "Como o Senhor moldou os doze e o que isso nos ensina sobre discipulado hoje.",
    date: "05 nov 2025",
    author: "Rebeca Andrade",
  },
  {
    tag: "Missões",
    title: "Ir ou enviar: o mesmo coração missionário",
    excerpt: "Não há hierarquia entre os que vão e os que enviam. Ambos são parte da missão de Deus.",
    date: "28 out 2025",
    author: "Miguel Costa",
  },
  {
    tag: "Escrituras",
    title: "Lendo os profetas com olhos de esperança",
    excerpt: "Os profetas maiores nos ensinam a lamentar sem perder a esperança messiânica.",
    date: "19 out 2025",
    author: "Pra. Sara Lima",
  },
];

function BlogPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">
      <section className="bg-hero border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Blog" }]} />
          <p className="text-primary text-xs tracking-[0.3em] uppercase">Blog</p>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl">
            Reflexões, ensinos e <span className="text-gold-gradient">testemunhos</span>.
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((p) => (
            <article
              key={p.title}
              className="group border-border bg-card hover:border-gold rounded-2xl border p-8 transition"
            >
              <p className="text-primary text-xs tracking-widest uppercase">
                {p.tag}
              </p>
              <h2 className="font-display mt-4 text-2xl leading-tight">{p.title}</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{p.excerpt}</p>
              <div className="text-muted-foreground mt-6 flex items-center justify-between text-xs">
                <span>{p.author}</span>
                <span>{p.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
