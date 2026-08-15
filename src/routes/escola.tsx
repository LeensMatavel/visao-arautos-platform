import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { cycles } from "@/lib/courses";

export const Route = createFileRoute("/escola")({
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
    ],
  }),
  component: EscolaPage,
});

function EscolaPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo">

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
            Cinco ciclos progressivos com cursos, aulas em vídeo, materiais em
            PDF e acompanhamento de progresso.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="space-y-24">
          {cycles.map((cycle) => (
            <div key={cycle.id} id={cycle.id} className="scroll-mt-24">
              <div className="flex flex-wrap items-end gap-6 border-b border-border/60 pb-6">
                <p className="text-primary/60 font-display text-7xl leading-none">
                  {String(cycle.order).padStart(2, "0")}
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

              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {cycle.courses.map((course) => (
                  <Link
                    key={course.id}
                    to="/escola/$courseId"
                    params={{ courseId: course.id }}
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
                      <span>{course.lessons.length} aulas</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
