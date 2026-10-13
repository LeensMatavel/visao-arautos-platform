import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";

const tabs = [
  { to: "/admin", label: "Visão geral", exact: true },
  { to: "/admin/utilizadores", label: "Utilizadores" },
  { to: "/admin/cursos", label: "Cursos e aulas" },
  { to: "/admin/comentarios", label: "Comentários" },
  { to: "/admin/oracao", label: "Pedidos de oração" },
  { to: "/admin/historico", label: "Histórico" },
];

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("admin") && !list.includes("moderator")) {
      throw redirect({ to: "/dashboard" });
    }
    return { adminRoles: list };
  },
  head: () => ({
    meta: [
      { title: "Administração — Visão Arautos" },
      {
        name: "description",
        content: "Área reservada à equipa da Visão Arautos.",
      },
      { property: "og:title", content: "Administração — Visão Arautos" },
      {
        property: "og:description",
        content: "Área reservada à equipa da Visão Arautos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-primary text-xs tracking-[0.3em] uppercase">
          Administração
        </p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">
          Gestão da plataforma
        </h1>
        <nav
          aria-label="Secções de administração"
          className="mt-8 flex flex-wrap gap-2 border-b border-border/60 pb-4"
        >
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact ?? false }}
              activeProps={{ className: "border-gold text-primary" }}
              className="border-border focus-ring text-muted-foreground hover:text-foreground rounded-full border px-4 py-2 text-xs transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
