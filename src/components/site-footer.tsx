import { Link } from "@tanstack/react-router";

const columns = [
  {
    title: "Movimento",
    links: [
      { to: "/sobre", label: "Sobre o movimento" },
      { to: "/sobre", label: "Missão e visão", hash: "missao-visao" },
      { to: "/sobre", label: "Frentes de ministério", hash: "frentes" },
      { to: "/missoes", label: "Projetos missionários" },
    ],
  },
  {
    title: "Formação",
    links: [
      { to: "/escola", label: "Escola Arautos" },
      { to: "/blog", label: "Blog" },
      { to: "/eventos", label: "Eventos" },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { to: "/comunidade", label: "Grupos e fórum" },
      { to: "/oracao", label: "Pedidos de oração" },
      { to: "/auth", label: "Entrar na plataforma" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-gold grid h-8 w-8 place-items-center rounded-full">
                <span className="font-display text-primary-foreground font-bold">
                  A
                </span>
              </div>
              <span className="font-display text-lg">Visão Arautos</span>
            </div>
            <p className="text-primary mt-4 text-xs tracking-[0.25em] uppercase">
              Despertando uma geração para Cristo
            </p>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              Movimento cristão evangélico, pentecostal e interdenominacional,
              dedicado à formação bíblica, ao despertar espiritual, ao
              discipulado, ao evangelismo e às missões.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="font-display text-primary mb-3 text-sm tracking-wider uppercase">
                {col.title}
              </h2>
              <ul className="text-muted-foreground space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={`${l.to}-${l.label}`}>
                    <Link
                      to={l.to}
                      hash={"hash" in l ? (l.hash as string) : undefined}
                      className="hover:text-foreground focus-ring rounded-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="my-12 hairline" />

        <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Visão Arautos. Todos os direitos reservados.</p>
          <p className="tracking-widest uppercase">Palavra · Espírito · Missão</p>
        </div>
      </div>
    </footer>
  );
}
