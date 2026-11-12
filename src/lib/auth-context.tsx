import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthFlow = "login" | "register" | "recovery" | "password-update" | "google" | "session";

function getErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") return { message: "", code: "", status: undefined };
  const details = error as { message?: unknown; code?: unknown; status?: unknown; name?: unknown };
  return {
    message: typeof details.message === "string" ? details.message.toLowerCase() : "",
    code: typeof details.code === "string" ? details.code.toLowerCase() : "",
    status: typeof details.status === "number" ? details.status : undefined,
    name: typeof details.name === "string" ? details.name : "",
  };
}

export function authErrorMessage(error: unknown, flow: AuthFlow): string {
  const { message, code, status, name } = getErrorDetails(error);
  const details = `${message} ${code} ${name}`;
  const isNetworkError = /network|fetch|connection|offline|load failed/.test(details);
  const isRateLimited = status === 429 || /rate.?limit|too many requests/.test(details);
  const isWeakPassword = /weak_password|password.*(weak|short)|should be at least/.test(details);
  const isInvalidEmail = /invalid_email|email.*invalid|valid email/.test(details);

  if (isRateLimited) return "Muitas tentativas foram feitas. Aguarde um pouco e tente novamente.";
  if (isNetworkError) return "Sem ligação ao serviço. Verifique a internet e tente novamente.";

  if (flow === "recovery") {
    return "Não foi possível enviar a ligação agora. Verifique a ligação à internet e tente novamente.";
  }
  if (flow === "login") {
    if (/email_not_confirmed|email not confirmed/.test(details)) {
      return "Confirme o seu email através da ligação enviada antes de entrar. Verifique também a pasta de spam.";
    }
    if (/invalid_credentials|invalid login credentials|user not found|wrong password/.test(details)) {
      return "O email ou a palavra-passe não está correcto. Verifique os dados e tente novamente.";
    }
    if (isInvalidEmail) return "Indique um endereço de email válido.";
    return "Não foi possível entrar. Verifique os seus dados e tente novamente.";
  }
  if (flow === "register") {
    if (isWeakPassword) return "Escolha uma palavra-passe mais segura, com pelo menos 8 caracteres.";
    if (isInvalidEmail) return "Indique um endereço de email válido.";
    return "Não foi possível criar a conta com estes dados. Verifique-os e tente novamente.";
  }
  if (flow === "password-update") {
    if (isWeakPassword) return "Escolha uma palavra-passe mais segura, com pelo menos 8 caracteres.";
    if (/expired|invalid.*(token|otp|link)|otp.*expired|recovery/.test(details)) {
      return "Esta ligação expirou ou já foi utilizada. Peça uma nova ligação de recuperação.";
    }
    return "Não foi possível guardar a nova palavra-passe. Tente novamente ou peça outra ligação.";
  }
  if (flow === "google") return "Não foi possível entrar com o Google. Tente novamente ou use o seu email.";
  return "A sua sessão não está disponível. Entre novamente para continuar.";
}

export function logAuthError(error: unknown, flow: AuthFlow) {
  const { code, status, name } = getErrorDetails(error);
  console.error(`[Auth] ${flow} failed`, { code, status, name });
}

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
  const sessionRef = useRef<Session | null>(null);
  const signingOutRef = useRef(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_OUT" && sessionRef.current && !signingOutRef.current) {
        toast.error("A sua sessão terminou. Entre novamente para continuar.");
      }
      if (event === "SIGNED_OUT") signingOutRef.current = false;
      sessionRef.current = s;
      setSession(s);
      setUser(s?.user ? mapUser(s.user) : null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) logAuthError(error, "session");
      sessionRef.current = data.session;
      setSession(data.session);
      setUser(data.session?.user ? mapUser(data.session.user) : null);
      setLoading(false);
    }).catch((error: unknown) => {
      logAuthError(error, "session");
      sessionRef.current = null;
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { display_name: name },
        },
      });
      if (error) throw error;
      return Boolean(data.session);
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
    signingOutRef.current = true;
    const { error } = await supabase.auth.signOut();
    if (error) {
      signingOutRef.current = false;
      throw error;
    }
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
