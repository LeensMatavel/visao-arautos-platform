import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, HeartHandshake, MessageCircle, Users } from "lucide-react";
import { LoadingState } from "@/components/states";
import { getPlatformReport } from "@/lib/reports.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchReport = useServerFn(getPlatformReport);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "report"],
    queryFn: () => fetchReport(),
  });

  if (error)
    return <p className="text-muted-foreground text-sm">Não foi possível carregar os indicadores.</p>;
  if (isLoading || !data) return <LoadingState label="A carregar indicadores…" />;

  const cards = [
    { icon: BookOpen, label: "Ciclos publicados", value: data.content.cycles },
    { icon: BookOpen, label: "Cursos publicados", value: data.content.courses },
    { icon: BookOpen, label: "Aulas publicadas", value: data.content.lessons },
    { icon: BookOpen, label: "Itens ocultos ou arquivados", value: data.content.hidden },
    { icon: Users, label: "Perfis registados", value: data.people.profiles },
    { icon: GraduationCap, label: "Estudantes com progresso", value: data.people.activeStudents },
    { icon: GraduationCap, label: "Activos nos últimos 30 dias", value: data.people.active30d },
    { icon: HeartHandshake, label: "Pedidos de oração", value: data.community.prayers },
    { icon: MessageCircle, label: "Comentários", value: data.community.comments },
    { icon: MessageCircle, label: "Comentários por moderar", value: data.community.pending },
  ];

  return (
    <div>
      <p className="text-muted-foreground text-sm">
        Números reais da plataforma. O conteúdo e o progresso contam apenas ciclos, cursos e aulas
        publicados e não arquivados.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="border-border bg-card rounded-2xl border p-5">
            <c.icon className="text-primary h-5 w-5" />
            <p className="font-display mt-3 text-3xl">{c.value}</p>
            <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display mt-12 text-2xl">Progresso por curso</h2>
      {data.courses.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">Ainda não há cursos publicados.</p>
      ) : (
        <div className="border-border mt-4 overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-card text-muted-foreground text-left text-xs uppercase tracking-widest">
              <tr>
                <th className="p-3">Curso</th>
                <th className="p-3 text-right">Aulas</th>
                <th className="p-3 text-right">Iniciaram</th>
                <th className="p-3 text-right">Concluíram</th>
                <th className="p-3">Média</th>
              </tr>
            </thead>
            <tbody>
              {data.courses.map((c) => (
                <tr key={c.id} className="border-border border-t">
                  <td className="p-3">
                    <p>{c.title}</p>
                    <p className="text-muted-foreground text-xs">{c.cycleTitle}</p>
                  </td>
                  <td className="p-3 text-right">{c.lessons}</td>
                  <td className="p-3 text-right">{c.started}</td>
                  <td className="p-3 text-right">{c.completed}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted h-1.5 w-20 rounded-full">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${c.avgPercent}%` }} />
                      </div>
                      <span className="text-muted-foreground text-xs">{c.avgPercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
