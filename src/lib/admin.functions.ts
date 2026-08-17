import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  createdAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
};

async function assertStaff(
  supabase: { from: (t: "user_roles") => any },
  userId: string,
  requireAdmin = false,
) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles: string[] = (data ?? []).map((r: { role: string }) => r.role);
  const ok = requireAdmin
    ? roles.includes("admin")
    : roles.includes("admin") || roles.includes("moderator");
  if (!ok) throw new Error("Sem permissão para esta operação.");
  return roles;
}

/** Lista utilizadores (apenas administradores e moderadores). */
export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUser[]> => {
    await assertStaff(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw new Error(error.message);

    const ids = data.users.map((u) => u.id);
    const [{ data: profiles }, { data: roleRows }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name").in("id", ids),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids),
    ]);

    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
    const rolesById = new Map<string, string[]>();
    for (const r of roleRows ?? []) {
      rolesById.set(r.user_id, [...(rolesById.get(r.user_id) ?? []), r.role]);
    }

    return data.users.map((u) => ({
      id: u.id,
      email: u.email ?? "—",
      displayName: nameById.get(u.id) ?? "Arauto",
      roles: rolesById.get(u.id) ?? [],
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      confirmed: Boolean(u.email_confirmed_at),
    }));
  });

/** Define o papel de um utilizador (apenas administradores). */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "moderator", "user"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase as never, context.userId, true);
    if (data.userId === context.userId && data.role !== "admin") {
      throw new Error("Não pode remover o seu próprio papel de administrador.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
