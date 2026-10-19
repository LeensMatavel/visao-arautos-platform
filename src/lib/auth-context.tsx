import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ArautoUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
};

type AuthContextValue = {
  user: ArautoUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(u: User): ArautoUser {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (typeof meta.display_name === "string" && meta.display_name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    u.email?.split("@")[0] ||
    "Arauto";
  return { id: u.id, name, email: u.email ?? "", role: "student" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ArautoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ? mapUser(s.user) : null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ? mapUser(data.session.user) : null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const register = useCallback<AuthContextValue["register"]>(
    async (name, email, password) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { display_name: name },
        },
      });
      if (error) throw error;
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) throw result.error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, login, register, loginWithGoogle, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
