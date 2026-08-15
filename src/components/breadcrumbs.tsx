import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  to?: string;
  params?: Record<string, string>;
  hash?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="text-xs">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link
                  to={item.to}
                  params={item.params as never}
                  hash={item.hash}
                  className="hover:text-foreground focus-ring rounded-sm tracking-widest uppercase transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="text-foreground/80 tracking-widest uppercase"
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
