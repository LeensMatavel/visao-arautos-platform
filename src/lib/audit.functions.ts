import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AuditRow = {
  id: string;
  actorId: string | null;
  actorName: string;
  actorRole: string | null;
  action: string;
  tableName: string;
  recordId: string | null;
  summary: Record<string, string | number | boolean | null | string[]> | null;
  affectedCount: number | null;
  createdAt: string;
};

/** Lê o histórico (admin e moderador). RLS aplica-se como o utilizador. */
export const listAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        action: z.enum(["all", "archive", "restore", "delete", "role_change", "moderate"]),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<AuditRow[]> => {
    const sb = context.supabase;
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", context.userId);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("admin") && !list.includes("moderator")) {
      throw new Error("Sem permissão para consultar o histórico.");
    }
    let q = sb
      .from("admin_audit_log")
      .select("id, actor_id, actor_role, action, table_name, record_id, summary, affected_count, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.action !== "all") q = q.eq("action", data.action);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = [...new Set((rows ?? []).map((r) => r.actor_id).filter(Boolean))] as string[];
    const names = new Map<string, string>();
    if (ids.length) {
      const { data: profiles } = await sb.from("profiles").select("id, display_name").in("id", ids);
      for (const p of profiles ?? []) names.set(p.id, p.display_name);
    }
    return (rows ?? []).map((r) => ({
      id: r.id,
      actorId: r.actor_id,
      actorName: r.actor_id ? (names.get(r.actor_id) ?? "Utilizador removido") : "Sistema",
      actorRole: r.actor_role,
      action: r.action,
      tableName: r.table_name,
      recordId: r.record_id,
      summary: (r.summary as AuditRow["summary"]) ?? null,
      affectedCount: r.affected_count,
      createdAt: r.created_at,
    }));
  });
