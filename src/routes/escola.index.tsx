import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState, LoadingState } from "@/components/states";
import { listCurriculum } from "@/lib/content.functions";

export const Route = createFileRoute("/escola/")({
  loader: () => listCurriculum(),
  head: () => ({
    meta: [
      { title: "Escola Arautos — Formação bíblica em cinco ciclos" },
      {
        name: "description",
        content:
          "Cinco ciclos de formação: fundamentos, formação bíblica, teologia, identidade pentecostal e formação ministerial.",
      },
      { property: "og:title", content: "Escola Arautos" },
      {
        property: "og:description",
        content: "Cinco ciclos de formação profunda em Cristo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  pendingComponent: () => (
    <Shell>
      <LoadingState label="A carregar a Escola Arautos…" />
    </Shell>
  ),
  errorComponent: () => (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title="Não foi possível carregar os cursos"
          description="Houve uma falha ao contactar a plataforma. Actualize a página dentro de instantes."
          action={{ label: "Voltar ao início", to: "/" }}
        />
      </div>
    </Shell>
  ),
  component: EscolaPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">{children}</main>
      <SiteFooter />
    </div>
  );
}

function EscolaPage() {
  const cycles = Route.useLoaderData();

  return (
    <Shell>
      <section className="bg-hero relative border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Escola Arautos" }]} />
          <p className="text-primary text-xs tracking-[0.3em] uppercase">
            Escola Arautos
          </p>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Um caminho de <span className="text-gold-gradient">formação</span>,
            do fundamento ao envio.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
            Cinco ciclos progressivos com cursos, aulas e materiais de estudo,
            com acompanhamento do seu progresso.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        {cycles.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
            title="Ainda não há ciclos publicados"
            description="Assim que a equipa publicar os ciclos de formação, eles aparecem aqui."
          />
        ) : (
          <div className="space-y-24">
            {cycles.map((cycle) => (
              <div key={cycle.id} id={cycle.slug} className="scroll-mt-24">
                <div className="flex flex-wrap items-end gap-6 border-b border-border/60 pb-6">
                  <p className="text-primary/60 font-display text-7xl leading-none">
                    {String(cycle.order_index).padStart(2, "0")}
                  </p>
                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl">{cycle.title}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {cycle.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-6 max-w-2xl">
                  {cycle.description}
                </p>

                {cycle.courses.length === 0 ? (
                  <p className="text-muted-foreground mt-8 text-sm">
                    Sem cursos publicados neste ciclo.
                  </p>
                ) : (
                  <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {cycle.courses.map((course) => (
                      <Link
                        key={course.id}
                        to="/escola/$courseId"
                        params={{ courseId: course.slug }}
                        className="group border-border bg-card hover:border-gold flex flex-col overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-elegant"
                      >
                        <div className="border-gold/30 bg-gold/5 grid h-12 w-12 place-items-center rounded-full border">
                          <BookOpen className="text-primary h-5 w-5" />
                        </div>
                        <h3 className="font-display mt-6 text-xl leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
                          {course.description}
                        </p>
                        <div className="text-primary mt-6 flex items-center justify-between text-xs">
                          <span>{course.lessonCount} aulas</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
