import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { avaliacoes } from "@/data/avaliacoes";
import { formatarData } from "@/utils/format";

export const Route = createFileRoute("/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações — Talent Manager" },
      { name: "description", content: "Avaliações dos recrutadores sobre os candidatos." },
    ],
  }),
  component: AvaliacoesPage,
});

function AvaliacoesPage() {
  const media = avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length;
  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Avaliações</h1>
          <p className="tm-page-subtitle">Média geral <strong style={{ color: "var(--color-foreground)" }}>{media.toFixed(2)}</strong> em {avaliacoes.length} avaliações.</p>
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
            {avaliacoes.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.avaliador}</strong></td>
                <td>{a.candidatoNome}</td>
                <td>
                  <span className="tm-flex tm-items-center tm-gap-1" style={{ color: "var(--color-warning)" }}>
                    <Star size={14} fill="currentColor" />
                    <strong style={{ color: "var(--color-foreground)" }}>{a.nota.toFixed(1)}</strong>
                  </span>
                </td>
                <td style={{ maxWidth: 480 }}><span className="tm-muted">{a.comentario}</span></td>
                <td><span className="tm-muted">{formatarData(a.data)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
