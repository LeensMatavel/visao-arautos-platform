/**
 * Escrita do histórico de auditoria. Apenas servidor:
 * o actor vem sempre da sessão autenticada, nunca do cliente.
 */
export type AuditAction = "archive" | "restore" | "delete" | "role_change" | "moderate";

export type AuditEvent = {
  actorId: string;
  actorRole: "admin" | "moderator" | "user" | null;
  action: AuditAction;
  tableName: string;
  recordId?: string | null;
  summary?: Record<string, unknown> | null;
  affectedCount?: number | null;
};

type AdminClient = {
  from: (t: string) => {
    insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

/** Regista um evento já concluído. Nunca chamar antes de a operação ter sucesso. */
export async function writeAudit(admin: unknown, event: AuditEvent) {
  const client = admin as AdminClient;
  const { error } = await client.from("admin_audit_log").insert({
    actor_id: event.actorId,
    actor_role: event.actorRole,
    action: event.action,
    table_name: event.tableName,
    record_id: event.recordId ?? null,
    summary: event.summary ?? null,
    affected_count: event.affectedCount ?? null,
  });
  if (error) throw new Error(`Falha ao registar auditoria: ${error.message}`);
}
