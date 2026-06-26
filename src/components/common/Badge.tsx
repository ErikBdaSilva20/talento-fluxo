import type { ReactNode } from "react";

type Variant = "neutral" | "primary" | "info" | "success" | "warning" | "danger" | "outline";

export function Badge({ children, variant = "neutral", dot = false }: { children: ReactNode; variant?: Variant; dot?: boolean }) {
  return (
    <span className={`tm-badge tm-badge-${variant}`}>
      {dot && <span className="tm-badge-dot" />}
      {children}
    </span>
  );
}
