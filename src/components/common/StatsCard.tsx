import type { ReactNode } from "react";

interface Props {
  label: string;
  valor: string | number;
  icone?: ReactNode;
  delta?: { valor: string; positivo?: boolean };
  acentoCor?: string;
}

export function StatsCard({ label, valor, icone, delta, acentoCor = "var(--color-primary)" }: Props) {
  return (
    <div className="tm-stat">
      <div className="tm-flex tm-items-center tm-justify-between">
        <span className="tm-stat-label">{label}</span>
        {icone && (
          <span
            style={{
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: `color-mix(in oklab, ${acentoCor} 12%, transparent)`,
              color: acentoCor,
            }}
          >
            {icone}
          </span>
        )}
      </div>
      <span className="tm-stat-value">{valor}</span>
      {delta && (
        <span className={`tm-stat-delta ${delta.positivo ? "pos" : "neg"}`}>
          {delta.positivo ? "▲" : "▼"} {delta.valor}
        </span>
      )}
    </div>
  );
}
