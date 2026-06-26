import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

export function Modal({
  aberto,
  titulo,
  children,
  onFechar,
  acoes,
}: {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  onFechar: () => void;
  acoes?: ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [aberto, onFechar]);

  if (!aberto) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        zIndex: 100,
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
      onClick={onFechar}
    >
      <div
        className="tm-card tm-fade-in"
        style={{ width: "100%", maxWidth: 520, padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tm-flex tm-items-center tm-justify-between" style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
          <h3 className="tm-h2" style={{ margin: 0 }}>{titulo}</h3>
          <button className="tm-btn tm-btn-ghost tm-btn-icon" onClick={onFechar}><X size={18} /></button>
        </div>
        <div style={{ padding: "1.25rem" }}>{children}</div>
        {acoes && (
          <div className="tm-flex tm-gap-2" style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--color-border)", justifyContent: "flex-end" }}>
            {acoes}
          </div>
        )}
      </div>
    </div>
  );
}
