import { Link } from "@tanstack/react-router";

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
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              Um movimento cristão de formação bíblica, despertar espiritual,
              discipulado e missões.
            </p>
          </div>

          <div>
            <h4 className="font-display text-primary mb-3 text-sm tracking-wider uppercase">
              Movimento
            </h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><Link to="/" hash="missao" className="hover:text-foreground">Missão</Link></li>
              <li><Link to="/" hash="visao" className="hover:text-foreground">Visão</Link></li>
              <li><Link to="/" hash="frentes" className="hover:text-foreground">Frentes</Link></li>
              <li><Link to="/missoes" className="hover:text-foreground">Projetos missionários</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-primary mb-3 text-sm tracking-wider uppercase">
              Formação
            </h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><Link to="/escola" className="hover:text-foreground">Escola Arautos</Link></li>
              <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><Link to="/eventos" className="hover:text-foreground">Eventos</Link></li>
              <li><Link to="/oracao" className="hover:text-foreground">Rede de oração</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-primary mb-3 text-sm tracking-wider uppercase">
              Comunidade
            </h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><Link to="/comunidade" className="hover:text-foreground">Fórum</Link></li>
              <li><Link to="/oracao" className="hover:text-foreground">Pedidos de oração</Link></li>
              <li><Link to="/auth" className="hover:text-foreground">Entrar</Link></li>
            </ul>
          </div>
        </div>

        <div className="my-12 hairline" />

        <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Visão Arautos. Ide por todo o mundo.</p>
          <p className="tracking-widest uppercase">Fé · Verdade · Missão</p>
        </div>
      </div>
    </footer>
  );
}
