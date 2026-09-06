import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const targetSchema = z.object({
  table: z.enum(["cycles", "courses", "lessons", "lesson_materials"]),
  id: z.string().uuid(),
});

export type CurriculumTable = z.infer<typeof targetSchema>["table"];

export type ImpactSummary = {
  title: string;
  archived: boolean;
  courses: number;
  lessons: number;
  materials: number;
  comments: number;
  progress: number;
};

type Admin = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

/** Confirma no servidor que quem chama é administrador. Nunca confia no cliente. */
async function requireAdmin(context: {
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> };
  userId: string;
}) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Apenas administradores podem executar esta operação.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

/** Identificadores de toda a árvore abaixo (e incluindo) do item indicado. */
async function collectTree(admin: Admin, table: CurriculumTable, id: string) {
  let cycleIds: string[] = [];
  let courseIds: string[] = [];
  let lessonIds: string[] = [];

  if (table === "cycles") {
    cycleIds = [id];
    const { data } = await admin.from("courses").select("id").eq("cycle_id", id);
    courseIds = (data ?? []).map((r: { id: string }) => r.id);
  } else if (table === "courses") {
    courseIds = [id];
  } else if (table === "lessons") {
    lessonIds = [id];
  }

  if (courseIds.length) {
    const { data } = await admin.from("lessons").select("id").in("course_id", courseIds);
    lessonIds = (data ?? []).map((r: { id: string }) => r.id);
  }

  let materialIds: string[] = [];
  if (lessonIds.length) {
    const { data } = await admin.from("lesson_materials").select("id").in("lesson_id", lessonIds);
    materialIds = (data ?? []).map((r: { id: string }) => r.id);
  }
  if (table === "lesson_materials") materialIds = [id];

  return { cycleIds, courseIds, lessonIds, materialIds };
}

async function countIn(admin: Admin, table: string, column: string, ids: string[]) {
  if (!ids.length) return 0;
  const client = admin as unknown as {
    from: (t: string) => {
      select: (c: string, o: { count: "exact"; head: true }) => {
        in: (col: string, v: string[]) => Promise<{ count: number | null }>;
      };
    };
  };
  const { count } = await client
    .from(table)
    .select("id", { count: "exact", head: true })
    .in(column, ids);
  return count ?? 0;
}

/** Resumo real (consultado na base de dados) do que uma eliminação definitiva afecta. */
export const getImpact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => targetSchema.parse(input))
  .handler(async ({ data, context }): Promise<ImpactSummary> => {
    const admin = await requireAdmin(context as never);
    const { data: row } = await admin
      .from(data.table)
      .select("title, archived_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("Item não encontrado.");

    const tree = await collectTree(admin, data.table, data.id);
    const [comments, progress] = await Promise.all([
      countIn(admin, "lesson_comments", "lesson_id", tree.lessonIds),
      countIn(admin, "course_progress", "lesson_id", tree.lessonIds),
    ]);

    return {
      title: (row as { title: string }).title,
      archived: Boolean((row as { archived_at: string | null }).archived_at),
      courses: tree.courseIds.filter((c) => c !== data.id).length + (data.table === "cycles" ? 0 : 0),
      lessons: data.table === "lessons" ? 0 : tree.lessonIds.length,
      materials: data.table === "lesson_materials" ? 0 : tree.materialIds.length,
      comments,
      progress,
    };
  });

/** Arquiva ou restaura conteúdo curricular, incluindo toda a árvore abaixo. */
export const setArchived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => targetSchema.extend({ archived: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context as never);
    const value = data.archived ? new Date().toISOString() : null;
    const tree = await collectTree(admin, data.table, data.id);

    if (tree.materialIds.length)
      await admin.from("lesson_materials").update({ archived_at: value }).in("id", tree.materialIds);
    if (tree.lessonIds.length)
      await admin.from("lessons").update({ archived_at: value }).in("id", tree.lessonIds);
    if (tree.courseIds.length)
      await admin.from("courses").update({ archived_at: value }).in("id", tree.courseIds);
    if (tree.cycleIds.length)
      await admin.from("cycles").update({ archived_at: value }).in("id", tree.cycleIds);

    return {
      ok: true,
      archived: data.archived,
      affected:
        tree.cycleIds.length + tree.courseIds.length + tree.lessonIds.length + tree.materialIds.length,
    };
  });

/** Eliminação definitiva: apenas admin e apenas depois de arquivado. */
export const purgeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => targetSchema.extend({ confirmTitle: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context as never);

    const { data: row } = await admin
      .from(data.table)
      .select("title, archived_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("Item não encontrado.");
    const item = row as { title: string; archived_at: string | null };
    if (!item.archived_at)
      throw new Error("Só é possível eliminar definitivamente conteúdo previamente arquivado.");
    if (data.confirmTitle.trim() !== item.title.trim())
      throw new Error("O nome escrito não corresponde ao item.");

    const tree = await collectTree(admin, data.table, data.id);

    let progressRemoved = 0;
    if (tree.lessonIds.length) {
      const { count } = await admin
        .from("course_progress")
        .delete({ count: "exact" })
        .in("lesson_id", tree.lessonIds);
      progressRemoved = count ?? 0;
    }

    const { error } = await admin.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    return {
      ok: true,
      title: item.title,
      progressRemoved,
      cascadeCourses: data.table === "cycles" ? tree.courseIds.length : 0,
      cascadeLessons: data.table === "lessons" ? 0 : tree.lessonIds.length,
      cascadeMaterials: data.table === "lesson_materials" ? 0 : tree.materialIds.length,
    };
  });
