import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LoadingState } from "@/components/states";
import { listAuditLog, type AuditRow } from "@/lib/audit.functions";

export const Route = createFileRoute("/admin/historico")({
  component: AdminHistory,
});

const actions = {
  all: "Todas",
  archive: "Arquivar",
  restore: "Restaurar",
  delete: "Eliminar",
  role_change: "Mudança de papel",
  moderate: "Moderação",
} as const;
type ActionKey = keyof typeof actions;

const tables: Record<string, string> = {
  cycles: "Ciclo",
  courses: "Curso",
  lessons: "Aula",
  lesson_materials: "Material",
  lesson_comments: "Comentário",
  prayer_requests: "Pedido de oração",
  user_roles: "Papel de utilizador",
};

const roleNames: Record<string, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  user: "Aluno",
};

function describe(r: AuditRow) {
  const s = r.summary ?? {};
  const title = typeof s.title === "string" ? s.title : null;
  if (r.action === "role_change") {
    const nr = typeof s.newRole === "string" ? roleNames[s.newRole] ?? s.newRole : "";
    return `Novo papel: ${nr}`;
  }
  return title ?? (typeof s.status === "string" ? `Estado: ${s.status}` : null);
}

function AdminHistory() {
  const fetchLog = useServerFn(listAuditLog);
  const [filter, setFilter] = useState<ActionKey>("all");
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setRows(null);
    setError(false);
    fetchLog({ data: { action: filter, limit: 200 } })
      .then((r) => active && setRows(r))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [filter, fetchLog]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por ação">
        {(Object.keys(actions) as ActionKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            aria-pressed={filter === k}
            className={`focus-ring rounded-full border px-3 py-1.5 text-xs transition-colors ${
              filter === k
                ? "border-gold text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {actions[k]}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-muted-foreground text-sm">Não foi possível carregar o histórico.</p>
      ) : !rows ? (
        <LoadingState label="A carregar histórico…" />
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Ainda não há registos para este filtro.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const detail = describe(r);
            return (
              <li key={r.id} className="border-border bg-card rounded-2xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-display">{r.actorName}</span>
                    {r.actorRole && (
                      <span className="text-muted-foreground"> · {roleNames[r.actorRole] ?? r.actorRole}</span>
                    )}
                  </p>
                  <time className="text-muted-foreground text-xs" dateTime={r.createdAt}>
                    {new Date(r.createdAt).toLocaleString("pt-PT")}
                  </time>
                </div>
                <p className="mt-2 text-sm">
                  <span className="text-primary">{actions[r.action as ActionKey] ?? r.action}</span>
                  {" — "}
                  {tables[r.tableName] ?? r.tableName}
                  {detail && <span className="text-muted-foreground"> · {detail}</span>}
                </p>
                {r.affectedCount != null && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {r.affectedCount} {r.affectedCount === 1 ? "item afetado" : "itens afetados"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
