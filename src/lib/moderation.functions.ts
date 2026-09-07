import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StaffContext = {
  supabase: { from: (t: string) => any };
  userId: string;
};

/** Confirma no servidor que quem chama é admin ou moderador e devolve o papel real. */
async function requireStaff(context: StaffContext) {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  const roles: string[] = (data ?? []).map((r: { role: string }) => r.role);
  const role = roles.includes("admin")
    ? ("admin" as const)
    : roles.includes("moderator")
      ? ("moderator" as const)
      : null;
  if (!role) throw new Error("Sem permissão para moderar conteúdo.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { admin: supabaseAdmin, role };
}

/** Aprova ou rejeita um comentário de aula (admin ou moderador). */
export const moderateComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["approved", "rejected", "pending"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { admin, role } = await requireStaff(context as never);

    const { data: before } = await admin
      .from("lesson_comments")
      .select("status, display_name")
      .eq("id", data.id)
      .maybeSingle();
    if (!before) throw new Error("Comentário não encontrado.");

    const { error } = await admin
      .from("lesson_comments")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(admin, {
      actorId: (context as StaffContext).userId,
      actorRole: role,
      action: "moderate",
      tableName: "lesson_comments",
      recordId: data.id,
      affectedCount: 1,
      summary: {
        moderation: "comment_status",
        author: before.display_name,
        previousState: before.status,
        newState: data.status,
      },
    });

    return { ok: true };
  });

/** Remove um comentário de aula (admin ou moderador). */
export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { admin, role } = await requireStaff(context as never);

    const { data: before } = await admin
      .from("lesson_comments")
      .select("status, display_name")
      .eq("id", data.id)
      .maybeSingle();
    if (!before) throw new Error("Comentário não encontrado.");

    const { error } = await admin.from("lesson_comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(admin, {
      actorId: (context as StaffContext).userId,
      actorRole: role,
      action: "delete",
      tableName: "lesson_comments",
      recordId: data.id,
      affectedCount: 1,
      summary: {
        moderation: "comment_removed",
        author: before.display_name,
        previousState: before.status,
        newState: "eliminado",
      },
    });

    return { ok: true };
  });

/** Remove um pedido de oração (admin ou moderador). */
export const deletePrayerRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { admin, role } = await requireStaff(context as never);

    const { data: before } = await admin
      .from("prayer_requests")
      .select("display_name, prayed_count")
      .eq("id", data.id)
      .maybeSingle();
    if (!before) throw new Error("Pedido não encontrado.");

    const { error } = await admin.from("prayer_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(admin, {
      actorId: (context as StaffContext).userId,
      actorRole: role,
      action: "delete",
      tableName: "prayer_requests",
      recordId: data.id,
      affectedCount: 1,
      summary: {
        moderation: "prayer_removed",
        author: before.display_name,
        prayedCount: before.prayed_count,
        previousState: "publicado",
        newState: "eliminado",
      },
    });

    return { ok: true };
  });
