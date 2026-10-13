import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CourseReport = {
  id: string;
  title: string;
  cycleTitle: string;
  lessons: number;
  started: number;
  completed: number;
  avgPercent: number;
};

export type PlatformReport = {
  content: { cycles: number; courses: number; lessons: number; hidden: number };
  people: { profiles: number; activeStudents: number; active30d: number };
  community: { prayers: number; comments: number; pending: number };
  courses: CourseReport[];
};

/** Relatório para a equipa (admin e moderador). Só conta conteúdo publicado e não arquivado. */
export const getPlatformReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlatformReport> => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const list = (roles ?? []).map((r) => r.role);
    if (!list.includes("admin") && !list.includes("moderator")) {
      throw new Error("Sem permissão para consultar relatórios.");
    }
    const { supabaseAdmin: sb } = await import("@/integrations/supabase/client.server");

    const [cyclesR, coursesR, lessonsR, progressR, profilesR, prayersR, commentsR, pendingR] =
      await Promise.all([
        sb.from("cycles").select("id, title, is_published, archived_at"),
        sb.from("courses").select("id, title, cycle_id, order_index, is_published, archived_at"),
        sb.from("lessons").select("id, course_id, is_published, archived_at"),
        sb.from("course_progress").select("user_id, course_id, lesson_id, completed_at"),
        sb.from("profiles").select("id", { count: "exact", head: true }),
        sb.from("prayer_requests").select("id", { count: "exact", head: true }),
        sb.from("lesson_comments").select("id", { count: "exact", head: true }),
        sb.from("lesson_comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

    const live = <T extends { is_published: boolean; archived_at: string | null }>(x: T) =>
      x.is_published && !x.archived_at;
    const cycles = (cyclesR.data ?? []).filter(live);
    const cycleIds = new Map(cycles.map((c) => [c.id, c.title]));
    const courses = (coursesR.data ?? [])
      .filter((c) => live(c) && cycleIds.has(c.cycle_id))
      .sort((a, b) => a.order_index - b.order_index);
    const courseIds = new Set(courses.map((c) => c.id));
    const lessons = (lessonsR.data ?? []).filter((l) => live(l) && courseIds.has(l.course_id));
    const lessonsByCourse = new Map<string, Set<string>>();
    for (const l of lessons) {
      if (!lessonsByCourse.has(l.course_id)) lessonsByCourse.set(l.course_id, new Set());
      lessonsByCourse.get(l.course_id)!.add(l.id);
    }
    const totalAll =
      (cyclesR.data?.length ?? 0) + (coursesR.data?.length ?? 0) + (lessonsR.data?.length ?? 0);

    // Só conta progresso em aulas que ainda existem e estão visíveis.
    const since = Date.now() - 30 * 24 * 3600 * 1000;
    const active = new Set<string>();
    const active30 = new Set<string>();
    const perCourse = new Map<string, Map<string, number>>();
    for (const p of progressR.data ?? []) {
      const set = lessonsByCourse.get(p.course_id);
      if (!set?.has(p.lesson_id)) continue;
      active.add(p.user_id);
      if (new Date(p.completed_at).getTime() >= since) active30.add(p.user_id);
      if (!perCourse.has(p.course_id)) perCourse.set(p.course_id, new Map());
      const m = perCourse.get(p.course_id)!;
      m.set(p.user_id, (m.get(p.user_id) ?? 0) + 1);
    }

    const courseReports: CourseReport[] = courses.map((c) => {
      const total = lessonsByCourse.get(c.id)?.size ?? 0;
      const users = [...(perCourse.get(c.id)?.values() ?? [])];
      const completed = total ? users.filter((n) => n >= total).length : 0;
      const avg =
        users.length && total
          ? Math.round((users.reduce((s, n) => s + n / total, 0) / users.length) * 100)
          : 0;
      return {
        id: c.id,
        title: c.title,
        cycleTitle: cycleIds.get(c.cycle_id) ?? "",
        lessons: total,
        started: users.length,
        completed,
        avgPercent: avg,
      };
    });

    return {
      content: {
        cycles: cycles.length,
        courses: courses.length,
        lessons: lessons.length,
        hidden: totalAll - cycles.length - courses.length - lessons.length,
      },
      people: { profiles: profilesR.count ?? 0, activeStudents: active.size, active30d: active30.size },
      community: {
        prayers: prayersR.count ?? 0,
        comments: commentsR.count ?? 0,
        pending: pendingR.count ?? 0,
      },
      courses: courseReports,
    };
  });
