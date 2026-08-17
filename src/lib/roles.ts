import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type AppRole = "admin" | "moderator" | "user";

export const roleLabel: Record<AppRole, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  user: "Aluno",
};

/** Papéis do utilizador autenticado (lidos da base de dados, nunca do cliente). */
export function useRoles() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setRoles([]);
      setLoading(authLoading);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setRoles((data ?? []).map((r) => r.role as AppRole));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const isAdmin = roles.includes("admin");
  const isStaff = isAdmin || roles.includes("moderator");
  const primary: AppRole = isAdmin ? "admin" : roles.includes("moderator") ? "moderator" : "user";

  return { roles, primary, isAdmin, isStaff, loading };
}
