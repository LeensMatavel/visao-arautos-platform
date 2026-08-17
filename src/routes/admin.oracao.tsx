import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/states";

export const Route = createFileRoute("/admin/oracao")({
  component: AdminPrayers,
});

type Row = {
  id: string;
  display_name: string;
  body: string;
  prayed_count: number;
  created_at: string;
};

function AdminPrayers() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("prayer_requests")
      .select("id, display_name, body, prayed_count, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setError(Boolean(err));
    setRows((data as Row[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    const { error: err } = await supabase.from("prayer_requests").delete().eq("id", id);
    if (err) return toast.error("Não foi possível remover o pedido.");
    toast.success("Pedido removido.");
    setRows((r) => (r ?? []).filter((x) => x.id !== id));
  }

  if (error)
    return <p className="text-muted-foreground text-sm">Não foi possível carregar os pedidos.</p>;
  if (!rows) return <LoadingState label="A carregar pedidos…" />;
  if (rows.length === 0)
    return <p className="text-muted-foreground text-sm">Ainda não há pedidos de oração.</p>;

  return (
    <ul className="space-y-3">
      {rows.map((p) => (
        <li
          key={p.id}
          className="border-border bg-card flex items-start justify-between gap-4 rounded-2xl border p-5"
        >
          <div className="min-w-0">
            <p className="font-display text-base">{p.display_name}</p>
            <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{p.body}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              {new Date(p.created_at).toLocaleString("pt-PT")} · {p.prayed_count} intercessões
            </p>
          </div>
          <button
            onClick={() => remove(p.id)}
            aria-label={`Remover pedido de ${p.display_name}`}
            className="border-border text-muted-foreground hover:text-foreground shrink-0 rounded-full border p-2"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
