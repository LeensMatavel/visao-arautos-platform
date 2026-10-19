import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listUsers, setUserRole, type AdminUser } from "@/lib/admin.functions";
import { LoadingState } from "@/components/states";
import { useRoles, roleLabel, type AppRole } from "@/lib/roles";

export const Route = createFileRoute("/admin/utilizadores")({
  head: () => ({ meta: [
    { title: "Gestão de utilizadores — Visão Arautos" },
    { name: "description", content: "Gestão dos utilizadores e papéis da plataforma Arautos." },
    { property: "og:title", content: "Gestão de utilizadores — Visão Arautos" },
    { property: "og:description", content: "Gestão dos utilizadores e papéis da plataforma Arautos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminUsers,
});

function AdminUsers() {
  const fetchUsers = useServerFn(listUsers);
  const updateRole = useServerFn(setUserRole);
  const { isAdmin } = useRoles();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar utilizadores.");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function change(userId: string, role: AppRole) {
    try {
      await updateRole({ data: { userId, role } });
      toast.success("Papel actualizado.");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível actualizar.");
    }
  }

  if (error) return <p className="text-muted-foreground text-sm">{error}</p>;
  if (!users) return <LoadingState label="A carregar utilizadores…" />;
  if (users.length === 0)
    return <p className="text-muted-foreground text-sm">Ainda não há utilizadores.</p>;

  return (
    <div className="border-border bg-card overflow-x-auto rounded-2xl border">
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground text-xs tracking-widest uppercase">
          <tr className="border-b border-border/60">
            <th scope="col" className="px-5 py-4">Nome</th>
            <th scope="col" className="px-5 py-4">Email</th>
            <th scope="col" className="px-5 py-4">Papel</th>
            <th scope="col" className="px-5 py-4">Registo</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const current: AppRole = u.roles.includes("admin")
              ? "admin"
              : u.roles.includes("moderator")
                ? "moderator"
                : "user";
            return (
              <tr key={u.id} className="border-b border-border/40 last:border-0">
                <td className="px-5 py-4">{u.displayName}</td>
                <td className="text-muted-foreground px-5 py-4">{u.email}</td>
                <td className="px-5 py-4">
                  {isAdmin ? (
                    <select
                      aria-label={`Papel de ${u.displayName}`}
                      value={current}
                      onChange={(e) => change(u.id, e.target.value as AppRole)}
                      className="border-border bg-background/60 rounded-lg border px-3 py-1.5 text-xs"
                    >
                      <option value="user">Aluno</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    roleLabel[current]
                  )}
                </td>
                <td className="text-muted-foreground px-5 py-4 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("pt-PT")}
                  {!u.confirmed && " · email por confirmar"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
