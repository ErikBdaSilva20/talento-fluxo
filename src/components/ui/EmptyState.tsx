import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  titulo = "Nada por aqui ainda",
  descricao,
  icone,
  acao,
}: {
  titulo?: string;
  descricao?: string;
  icone?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="tm-empty">
      <span className="tm-empty-icon">{icone || <Inbox size={22} />}</span>
      <div className="tm-h3" style={{ color: "var(--color-foreground)" }}>{titulo}</div>
      {descricao && <p style={{ maxWidth: 360 }}>{descricao}</p>}
      {acao}
    </div>
  );
}
