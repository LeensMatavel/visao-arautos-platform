import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type LessonMaterial = {
  id: string;
  title: string;
  kind: string;
  url: string;
};

export type LessonRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  duration_label: string | null;
  video_url: string | null;
  order_index: number;
  materials: LessonMaterial[];
};

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order_index: number;
  lessonCount: number;
};

export type CycleSummary = {
  id: string;
  slug: string;
  order_index: number;
  title: string;
  subtitle: string;
  description: string;
  courses: CourseSummary[];
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Currículo público: ciclos, cursos e número de aulas. */
export const listCurriculum = createServerFn({ method: "GET" }).handler(
  async (): Promise<CycleSummary[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("cycles")
      .select(
        "id, slug, order_index, title, subtitle, description, courses(id, slug, title, description, order_index, is_published, lessons(id))",
      )
      .order("order_index");
    if (error) throw new Error(error.message);

    return (data ?? []).map((cy) => ({
      id: cy.id,
      slug: cy.slug,
      order_index: cy.order_index,
      title: cy.title,
      subtitle: cy.subtitle,
      description: cy.description,
      courses: (cy.courses ?? [])
        .filter((c) => c.is_published)
        .sort((a, b) => a.order_index - b.order_index)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description,
          order_index: c.order_index,
          lessonCount: (c.lessons ?? []).length,
        })),
    }));
  },
);

/** Detalhe público de um curso com as suas aulas e materiais. */
export const getCourse = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("courses")
      .select(
        "id, slug, title, description, cycle:cycles(id, slug, title, subtitle), lessons(id, slug, title, summary, duration_label, video_url, order_index, is_published, lesson_materials(id, title, kind, url, order_index))",
      )
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return null;

    const lessons: LessonRow[] = (row.lessons ?? [])
      .filter((l) => l.is_published)
      .sort((a, b) => a.order_index - b.order_index)
      .map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        summary: l.summary,
        duration_label: l.duration_label,
        video_url: l.video_url,
        order_index: l.order_index,
        materials: (l.lesson_materials ?? [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((m) => ({ id: m.id, title: m.title, kind: m.kind, url: m.url })),
      }));

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      cycle: row.cycle,
      lessons,
    };
  });
