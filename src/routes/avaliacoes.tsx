import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { listAvaliacoes, type Avaliacao } from "@/lib/data/avaliacoes.repo";
import { Skeleton } from "@/components/common/Skeleton";

const LIMITE_COMENTARIO = 120;

export default function AvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    listAvaliacoes()
      .then(setAvaliacoes)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const media = useMemo(
    () => avaliacoes.length ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(2) : "—",
    [avaliacoes],
  );

  function toggleExpandido(id: string) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function formatarData(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
  }

  if (carregando) {
    return (
      <div className="tm-page">
        <h1 className="tm-page-title">Avaliações</h1>
        <div className="tm-flex tm-flex-col tm-gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={48} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Avaliações</h1>
          <p className="tm-page-subtitle">
            Média geral{" "}
            <strong style={{ color: "var(--color-foreground)" }}>{media}</strong>{" "}
            em {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? "ões" : ""}.
          </p>
        </div>
      </div>

      <div className="tm-table-wrap">
        <table className="tm-table">
          <thead>
            <tr>
              <th>Avaliador</th>
              <th>Candidato</th>
              <th>Nota</th>
              <th>Comentário</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map((a) => {
              const comentario = a.comentario ?? "";
              const longo = comentario.length > LIMITE_COMENTARIO;
              const expandido = expandidos.has(a.id);
              return (
                <tr key={a.id}>
                  <td><strong>{a.avaliador}</strong></td>
                  <td>{a.candidato_nome}</td>
                  <td>
                    <span className="tm-flex tm-items-center tm-gap-1" style={{ color: "var(--color-warning)" }}>
                      <Star size={14} fill="currentColor" />
                      <strong style={{ color: "var(--color-foreground)" }}>{a.nota.toFixed(1)}</strong>
                    </span>
                  </td>
                  <td style={{ maxWidth: 480 }}>
                    <span className="tm-muted">
                      {longo && !expandido ? comentario.slice(0, LIMITE_COMENTARIO) + "…" : comentario}
                    </span>
                    {longo && (
                      <button
                        onClick={() => toggleExpandido(a.id)}
                        style={{ marginLeft: 6, fontSize: 12, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}
                      >
                        {expandido ? "Ler menos" : "Ler mais"}
                      </button>
                    )}
                  </td>
                  <td><span className="tm-muted">{formatarData(a.data)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
