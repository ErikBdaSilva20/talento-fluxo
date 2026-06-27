import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatusBtnProps {
  onAprovar: () => Promise<void>;
  onReprovar: () => Promise<void>;
  onAdiar?: () => Promise<void>;
  compact?: boolean;
}

type LoadingState = "aprovado" | "reprovado" | "adiado" | null;

export function StatusBtn({ onAprovar, onReprovar, onAdiar, compact = false }: StatusBtnProps) {
  const [loading, setLoading] = useState<LoadingState>(null);

  async function handle(action: LoadingState, fn: () => Promise<void>) {
    setLoading(action);
    try {
      await fn();
    } finally {
      setLoading(null);
    }
  }

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: compact ? 0 : 4,
    padding: compact ? "5px" : "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    color: "#fff",
    opacity: loading ? 0.7 : 1,
  };

  const spinner = "·";

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
      <button
        title="Aprovar"
        style={{ ...base, background: "var(--color-success)" }}
        disabled={loading !== null}
        onClick={() => handle("aprovado", onAprovar)}
      >
        {loading === "aprovado" ? spinner : <CheckCircle2 size={compact ? 15 : 13} />}
        {!compact && (loading === "aprovado" ? "..." : "Aprovado")}
      </button>

      <button
        title="Reprovar"
        style={{ ...base, background: "var(--color-destructive)" }}
        disabled={loading !== null}
        onClick={() => handle("reprovado", onReprovar)}
      >
        {loading === "reprovado" ? spinner : <XCircle size={compact ? 15 : 13} />}
        {!compact && (loading === "reprovado" ? "..." : "Reprovado")}
      </button>

      {onAdiar && (
        <button
          title="Adiar"
          style={{ ...base, background: "var(--color-warning)" }}
          disabled={loading !== null}
          onClick={() => handle("adiado", onAdiar)}
        >
          {loading === "adiado" ? spinner : <Clock size={compact ? 15 : 13} />}
          {!compact && (loading === "adiado" ? "..." : "Adiar")}
        </button>
      )}
    </div>
  );
}
