import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, logAuthError } from "@/lib/auth-context";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Definir nova palavra-passe — Visão Arautos" },
      { name: "description", content: "Defina uma nova palavra-passe para recuperar o acesso à sua conta Visão Arautos." },
      { property: "og:title", content: "Definir nova palavra-passe — Visão Arautos" },
      { property: "og:description", content: "Defina uma nova palavra-passe para recuperar o acesso à sua conta Visão Arautos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const isRecovery = hash.get("type") === "recovery";
    const hasLinkError = [query, hash].some((params) => params.has("error") || params.has("error_code"));
    if (hasLinkError) {
      setInvalid(true);
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        logAuthError(error, "password-update");
        setInvalid(true);
        return;
      }
      if (data.session && isRecovery) setReady(true);
    }).catch((error: unknown) => {
      logAuthError(error, "password-update");
      setInvalid(true);
    });
    const t = setTimeout(() => {
      setReady((r) => {
        if (!r) setInvalid(true);
        return r;
      });
    }, 4000);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password.length < 8) return toast.error("A palavra-passe deve ter pelo menos 8 caracteres.");
    if (password !== confirm) return toast.error("As palavras-passe não coincidem.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        logAuthError(error, "password-update");
        toast.error(authErrorMessage(error, "password-update"));
        return;
      }
      toast.success("Palavra-passe actualizada. Já pode continuar.");
      navigate({ to: "/dashboard" });
    } catch (error) {
      logAuthError(error, "password-update");
      toast.error(authErrorMessage(error, "password-update"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-hero flex min-h-screen items-center justify-center px-4">
      <div className="border-border/60 bg-card/70 w-full max-w-md rounded-2xl border p-8 shadow-elegant backdrop-blur-xl">
        <p className="text-primary text-xs tracking-[0.3em] uppercase">Recuperação</p>
        <h1 className="font-display mt-3 text-3xl">Nova palavra-passe</h1>
        {ready ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <PwField label="Nova palavra-passe" name="password" />
            <PwField label="Confirmar palavra-passe" name="confirm" />
            <button
              type="submit"
              disabled={loading}
              className="bg-gold text-primary-foreground w-full rounded-full py-3.5 text-sm font-medium shadow-gold transition disabled:opacity-60"
            >
              {loading ? "Aguarde..." : "Guardar palavra-passe"}
            </button>
          </form>
        ) : invalid ? (
          <div className="mt-6 space-y-4 text-sm">
            <p className="text-muted-foreground">
              Esta ligação é inválida ou expirou. Peça uma nova ligação de recuperação.
            </p>
            <Link to="/auth" search={{ mode: "forgot" }} className="text-primary">
              Pedir nova ligação
            </Link>
          </div>
        ) : (
          <p className="text-muted-foreground mt-6 text-sm">A validar a ligação...</p>
        )}
      </div>
    </div>
  );
}

function PwField({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="text-muted-foreground mb-2 block text-xs tracking-widest uppercase">{label}</span>
      <input
        name={name}
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        className="border-border bg-background/60 focus:border-gold focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
      />
    </label>
  );
}
