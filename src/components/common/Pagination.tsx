import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  pagina,
  totalPaginas,
  onMudar,
}: {
  pagina: number;
  totalPaginas: number;
  onMudar: (p: number) => void;
}) {
  if (totalPaginas <= 1) return null;
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1,
  );
  return (
    <div className="tm-flex tm-items-center tm-gap-2" style={{ justifyContent: "flex-end", padding: "1rem" }}>
      <Button size="sm" variant="secondary" iconOnly icon={<ChevronLeft size={16} />} disabled={pagina === 1} onClick={() => onMudar(pagina - 1)} />
      {paginas.map((p, i) => (
        <span key={p} className="tm-flex tm-items-center tm-gap-2">
          {i > 0 && paginas[i] - paginas[i - 1] > 1 && <span className="tm-muted">…</span>}
          <Button
            size="sm"
            variant={p === pagina ? "primary" : "secondary"}
            onClick={() => onMudar(p)}
          >
            {p}
          </Button>
        </span>
      ))}
      <Button size="sm" variant="secondary" iconOnly icon={<ChevronRight size={16} />} disabled={pagina === totalPaginas} onClick={() => onMudar(pagina + 1)} />
    </div>
  );
}
