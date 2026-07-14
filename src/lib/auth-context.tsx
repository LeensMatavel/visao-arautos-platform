import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ArautoUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
};

type AuthContextValue = {
  user: ArautoUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "arautos.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ArautoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = (u: ArautoUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login: AuthContextValue["login"] = async (email) => {
    await new Promise((r) => setTimeout(r, 400));
    persist({
      id: crypto.randomUUID(),
      name: email.split("@")[0] || "Arauto",
      email,
      role: email.endsWith("@arautos.admin") ? "admin" : "student",
    });
  };

  const register: AuthContextValue["register"] = async (name, email) => {
    await new Promise((r) => setTimeout(r, 500));
    persist({
      id: crypto.randomUUID(),
      name,
      email,
      role: "student",
    });
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const PROGRESS_KEY = "arautos.progress";
type ProgressMap = Record<string, string[]>; // courseId -> completed lesson ids

export function getProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function toggleLessonComplete(courseId: string, lessonId: string) {
  const p = getProgress();
  const set = new Set(p[courseId] || []);
  if (set.has(lessonId)) set.delete(lessonId);
  else set.add(lessonId);
  p[courseId] = Array.from(set);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  return p[courseId];
}
