import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function LoadingState({ label = "A carregar…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 sm:px-6"
    >
      <span className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
      <p className="text-muted-foreground mt-6 text-xs tracking-[0.3em] uppercase">
        {label}
      </p>
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="A carregar conteúdo"
      className="grid gap-5 md:grid-cols-2"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card/60 h-44 animate-pulse rounded-2xl border"
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: { label: string; to: string };
}) {
  return (
    <div className="border-border/60 bg-card/40 rounded-2xl border border-dashed px-6 py-16 text-center">
      {icon && (
        <div className="border-gold/30 bg-gold/5 text-primary mx-auto grid h-12 w-12 place-items-center rounded-full border">
          {icon}
        </div>
      )}
      <h3 className="font-display mt-6 text-2xl">{title}</h3>
      <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <Link
          to={action.to}
          className="border-gold/50 text-primary hover:bg-primary/10 focus-ring mt-8 inline-flex rounded-full border px-6 py-2.5 text-sm transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
