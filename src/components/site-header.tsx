import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/roles";
import { cn } from "@/lib/utils";

type NavLeaf = { to: string; label: string; description?: string };
type NavItem = NavLeaf | { label: string; children: NavLeaf[] };

const nav: NavItem[] = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/escola", label: "Escola Arautos" },
  {
    label: "Conteúdos",
    children: [
      { to: "/blog", label: "Blog", description: "Reflexões e ensinos" },
      { to: "/eventos", label: "Eventos", description: "Encontros e vigílias" },
    ],
  },
  {
    label: "Comunidade",
    children: [
      { to: "/comunidade", label: "Comunidade", description: "Grupos e fórum" },
      { to: "/oracao", label: "Pedidos de oração", description: "Rede de intercessão" },
    ],
  },
  { to: "/missoes", label: "Missões" },
];

function isActivePath(pathname: string, to: string) {
  return pathname === to || (to !== "/" && pathname.startsWith(to));
}

function DesktopGroup({
  label,
  children,
  pathname,
}: {
  label: string;
  children: NavLeaf[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = children.some((c) => isActivePath(pathname, c.to));

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "focus-ring flex items-center gap-1 rounded-sm text-sm tracking-wide transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 z-50 -translate-x-1/2 pt-4">
          <ul className="border-border/60 bg-card/95 w-64 rounded-xl border p-2 shadow-elegant backdrop-blur-xl">
            {children.map((c) => (
              <li key={c.to}>
                <Link
                  to={c.to}
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent focus-ring block rounded-lg px-3 py-2.5 transition-colors"
                  activeProps={{ className: "text-primary" }}
                >
                  <span className="block text-sm">{c.label}</span>
                  {c.description && (
                    <span className="text-muted-foreground block text-xs">
                      {c.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { isStaff } = useRoles();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <a
        href="#conteudo"
        className="bg-gold text-primary-foreground focus-ring sr-only rounded-full px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100]"
      >
        Saltar para o conteúdo
      </a>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="focus-ring flex min-w-0 items-center gap-2.5 rounded-sm"
            aria-label="Visão Arautos — página inicial"
          >
            <img
              src={logoAsset.url}
              alt=""
              aria-hidden="true"
              className="h-9 w-auto shrink-0 object-contain sm:h-10"
            />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="font-display truncate text-base font-semibold tracking-[0.12em] uppercase sm:text-lg">
                Visão Arautos
              </span>
              <span className="text-muted-foreground hidden text-[10px] tracking-[0.2em] uppercase sm:block">
                Despertando uma geração
              </span>
            </div>
          </Link>


          <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
            {nav.map((n) =>
              "children" in n ? (
                <DesktopGroup
                  key={n.label}
                  label={n.label}
                  children={n.children}
                  pathname={pathname}
                />
              ) : (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={isActivePath(pathname, n.to) ? "page" : undefined}
                  className={cn(
                    "focus-ring rounded-sm text-sm tracking-wide transition-colors",
                    isActivePath(pathname, n.to)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                {isStaff && (
                  <Link
                    to="/admin"
                    className="border-gold/50 text-primary hover:bg-primary/10 focus-ring rounded-full border px-4 py-2 text-sm transition-colors"
                  >
                    Administração
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="bg-gold text-primary-foreground focus-ring rounded-full px-5 py-2 text-sm font-medium shadow-gold transition-transform hover:scale-[1.02]"
                >
                  Painel
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-muted-foreground hover:text-foreground focus-ring rounded-sm text-sm"
                >
                  Entrar
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "register" }}
                  className="border-gold text-primary hover:bg-primary/10 focus-ring rounded-full border px-4 py-2 text-sm transition-colors"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="focus-ring -mr-2 grid h-11 w-11 place-items-center rounded-md lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div
            id="menu-mobile"
            className="border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <nav
              aria-label="Navegação principal (telemóvel)"
              className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4"
            >
              {nav.map((n) =>
                "children" in n ? (
                  <div key={n.label} className="mt-2">
                    <p className="text-primary px-3 pb-1 text-[10px] tracking-[0.3em] uppercase">
                      {n.label}
                    </p>
                    {n.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        className="text-muted-foreground hover:text-foreground focus-ring block rounded-md px-3 py-2.5 text-sm"
                        activeProps={{ className: "text-primary" }}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="text-muted-foreground hover:text-foreground focus-ring rounded-md px-3 py-2.5 text-sm"
                    activeProps={{ className: "text-primary" }}
                  >
                    {n.label}
                  </Link>
                ),
              )}
              <div className="my-3 hairline" />
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gold text-primary-foreground focus-ring rounded-md px-3 py-2.5 text-center text-sm font-medium"
                >
                  Painel
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/auth"
                    className="focus-ring flex-1 rounded-md border border-border px-3 py-2.5 text-center text-sm"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/auth"
                    search={{ mode: "register" }}
                    className="bg-gold text-primary-foreground focus-ring flex-1 rounded-md px-3 py-2.5 text-center text-sm font-medium"
                  >
                    Criar conta
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
