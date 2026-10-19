import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const search = z.object({
  mode: z.enum(["login", "register", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Visão Arautos" },
      { name: "description", content: "Aceda à plataforma Visão Arautos para acompanhar a sua formação na Escola Arautos, a comunidade e os pedidos de oração." },
      { property: "og:title", content: "Entrar ou criar conta — Visão Arautos" },
      { property: "og:description", content: "Aceda à plataforma Visão Arautos para acompanhar a sua formação na Escola Arautos, a comunidade e os pedidos de oração." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: search,
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  if (mode === "forgot") {
    return (
      <div className="bg-hero flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const email = String(new FormData(e.currentTarget).get("email") || "");
            if (!email) return toast.error("Indique o seu email.");
            setLoading(true);
            try {
              await resetPassword(email);
              toast.success("Se a conta existir, receberá um email com a ligação de recuperação.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Não foi possível enviar o email.");
            } finally {
              setLoading(false);
            }
          }}
          className="border-border/60 bg-card/70 w-full max-w-md space-y-4 rounded-2xl border p-8 shadow-elegant backdrop-blur-xl"
        >
          <p className="text-primary text-xs tracking-[0.3em] uppercase">Recuperação</p>
          <h1 className="font-display text-3xl">Esqueceu a palavra-passe?</h1>
          <Field label="Email" name="email" type="email" />
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-primary-foreground w-full rounded-full py-3.5 text-sm font-medium shadow-gold disabled:opacity-60"
          >
            {loading ? "Aguarde..." : "Enviar ligação de recuperação"}
          </button>
          <Link to="/auth" search={{ mode: "login" }} className="text-primary block text-center text-sm">
            Voltar a entrar
          </Link>
        </form>
      </div>
    );
  }


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");
    if (!email || !password || (isRegister && !name)) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        toast.success("Conta criada. Verifique o seu email para confirmar.");
      } else {
        await login(email, password);
        toast.success("Bem-vindo de volta.");
      }
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível autenticar.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      toast.error("Não foi possível entrar com o Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-hero relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,oklch(0.82_0.13_85/0.15)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl px-4 sm:px-6 lg:grid-cols-2">
        <div className="hidden flex-col justify-between py-12 pr-12 lg:flex">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gold grid h-9 w-9 place-items-center rounded-full">
              <span className="font-display text-primary-foreground text-lg font-bold">A</span>
            </div>
            <span className="font-display text-lg">Visão Arautos</span>
          </Link>
          <div>
            <h2 className="font-display text-5xl leading-tight">
              "Ide por todo o <span className="text-gold-gradient">mundo</span>
              e pregai o evangelho a toda criatura."
            </h2>
            <p className="text-muted-foreground mt-6 text-sm tracking-widest uppercase">
              Marcos 16.15
            </p>
          </div>
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Visão Arautos
          </p>
        </div>

        <div className="flex items-center py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-gold grid h-9 w-9 place-items-center rounded-full">
                  <span className="font-display text-primary-foreground font-bold">A</span>
                </div>
                <span className="font-display text-lg">Visão Arautos</span>
              </Link>
            </div>

            <div className="border-border/60 bg-card/70 rounded-2xl border p-8 backdrop-blur-xl shadow-elegant">
              <p className="text-primary text-xs tracking-[0.3em] uppercase">
                {isRegister ? "Criar conta" : "Entrar"}
              </p>
              <h1 className="font-display mt-3 text-3xl">
                {isRegister ? "Comece a sua jornada" : "Bem-vindo de volta"}
              </h1>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {isRegister && (
                  <Field label="Nome completo" name="name" type="text" />
                )}
                <Field label="Email" name="email" type="email" />
                <Field label="Palavra-passe" name="password" type="password" />
                {!isRegister && (
                  <Link to="/auth" search={{ mode: "forgot" }} className="text-primary block text-right text-xs">
                    Esqueceu a palavra-passe?
                  </Link>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold text-primary-foreground w-full rounded-full py-3.5 text-sm font-medium shadow-gold transition disabled:opacity-60"
                >
                  {loading
                    ? "Aguarde..."
                    : isRegister
                      ? "Criar minha conta"
                      : "Entrar"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <span className="bg-border h-px flex-1" />
                <span className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase">
                  ou
                </span>
                <span className="bg-border h-px flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="border-border hover:border-gold focus-ring w-full rounded-full border py-3.5 text-sm font-medium transition disabled:opacity-60"
              >
                Continuar com o Google
              </button>

              <p className="text-muted-foreground mt-6 text-center text-sm">
                {isRegister ? "Já tem conta? " : "Novo por aqui? "}
                <Link
                  to="/auth"
                  search={{ mode: isRegister ? "login" : "register" }}
                  className="text-primary"
                >
                  {isRegister ? "Entrar" : "Criar conta"}
                </Link>
              </p>
            </div>

            <p className="text-muted-foreground mt-6 text-center text-xs">
              Ao continuar, concorda com os princípios do movimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
}: {
  label: string;
  name: string;
  type: string;
}) {
  return (
    <label className="block">
      <span className="text-muted-foreground mb-2 block text-xs tracking-widest uppercase">
        {label}
      </span>
      <input
        name={name}
        type={type}
        className="border-border bg-background/60 focus:border-gold focus:ring-primary/20 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
      />
    </label>
  );
}
