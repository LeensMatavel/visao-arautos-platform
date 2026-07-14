import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Início" },
  { to: "/escola", label: "Escola Arautos" },
  { to: "/blog", label: "Blog" },
  { to: "/eventos", label: "Eventos" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/missoes", label: "Missões" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gold grid h-8 w-8 place-items-center rounded-full shadow-gold">
            <span className="font-display text-primary-foreground text-lg font-bold">
              A
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold tracking-wide">
              Visão Arautos
            </span>
            <span className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
              Movimento
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-gold text-primary-foreground rounded-full px-5 py-2 text-sm font-medium shadow-gold transition-transform hover:scale-[1.02]"
            >
              Meu Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Entrar
              </Link>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="border-gold text-primary hover:bg-primary/10 rounded-full border px-4 py-2 text-sm transition-colors"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden"
          aria-label="menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 hairline" />
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="bg-gold text-primary-foreground rounded-md px-3 py-2 text-center text-sm font-medium"
              >
                Meu Dashboard
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm"
                >
                  Entrar
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "register" }}
                  onClick={() => setOpen(false)}
                  className="bg-gold text-primary-foreground flex-1 rounded-md px-3 py-2 text-center text-sm font-medium"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
