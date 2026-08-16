import { supabase } from "@/integrations/supabase/client";

export type ProgressMap = Record<string, string[]>; // courseId -> completed lesson ids

const PROGRESS_KEY = "arautos.progress";

function readLocal(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocal(map: ProgressMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

/** Progresso do utilizador autenticado (base de dados) ou local para visitantes. */
export async function fetchProgress(): Promise<ProgressMap> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return readLocal();

  const { data, error } = await supabase
    .from("course_progress")
    .select("course_id, lesson_id");
  if (error) return readLocal();

  const map: ProgressMap = {};
  for (const row of data ?? []) {
    (map[row.course_id] ||= []).push(row.lesson_id);
  }
  return map;
}

/** Alterna a conclusão de uma aula e devolve as aulas concluídas do curso. */
export async function toggleLesson(
  courseId: string,
  lessonId: string,
  current: string[],
): Promise<string[]> {
  const done = current.includes(lessonId);
  const next = done
    ? current.filter((id) => id !== lessonId)
    : [...current, lessonId];

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  if (!userId) {
    const map = readLocal();
    map[courseId] = next;
    writeLocal(map);
    return next;
  }

  if (done) {
    await supabase
      .from("course_progress")
      .delete()
      .eq("course_id", courseId)
      .eq("lesson_id", lessonId)
      .eq("user_id", userId);
  } else {
    await supabase
      .from("course_progress")
      .insert({ course_id: courseId, lesson_id: lessonId, user_id: userId });
  }
  return next;
}

/** Sincroniza progresso guardado localmente para a conta após o login. */
export async function syncLocalProgress(userId: string) {
  const local = readLocal();
  const rows = Object.entries(local).flatMap(([course_id, lessons]) =>
    lessons.map((lesson_id) => ({ user_id: userId, course_id, lesson_id })),
  );
  if (!rows.length) return;
  await supabase.from("course_progress").upsert(rows, {
    onConflict: "user_id,course_id,lesson_id",
    ignoreDuplicates: true,
  });
  writeLocal({});
}
