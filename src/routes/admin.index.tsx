import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, HeartHandshake, MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/states";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

type Counts = {
  cycles: number;
  courses: number;
  lessons: number;
  prayers: number;
  comments: number;
  pending: number;
  profiles: number;
};

async function count(table: string, filter?: [string, string]) {
  let q = supabase.from(table as never).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]) as never;
  const { count: c } = await q;
  return c ?? 0;
}

function AdminOverview() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cycles, courses, lessons, prayers, comments, pending, profiles] =
          await Promise.all([
            count("cycles"),
            count("courses"),
            count("lessons"),
            count("prayer_requests"),
            count("lesson_comments"),
            count("lesson_comments", ["status", "pending"]),
            count("profiles"),
          ]);
        setCounts({ cycles, courses, lessons, prayers, comments, pending, profiles });
      } catch {
        setError(true);
      }
    })();
  }, []);

  if (error)
    return (
      <p className="text-muted-foreground text-sm">
        Não foi possível carregar os indicadores.
      </p>
    );
  if (!counts) return <LoadingState label="A carregar indicadores…" />;

  const cards = [
    { icon: BookOpen, label: "Ciclos", value: counts.cycles },
    { icon: BookOpen, label: "Cursos", value: counts.courses },
    { icon: BookOpen, label: "Aulas", value: counts.lessons },
    { icon: Users, label: "Perfis registados", value: counts.profiles },
    { icon: HeartHandshake, label: "Pedidos de oração", value: counts.prayers },
    { icon: MessageCircle, label: "Comentários", value: counts.comments },
    { icon: MessageCircle, label: "Comentários por moderar", value: counts.pending },
  ];

  return (
    <div>
      <p className="text-muted-foreground text-sm">
        Todos os números abaixo são lidos directamente da base de dados da
        plataforma — não há dados de demonstração.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border-border bg-card rounded-2xl border p-6">
            <c.icon className="text-primary h-5 w-5" />
            <p className="font-display mt-4 text-3xl">{c.value}</p>
            <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase">
              {c.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
