import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Plus } from "lucide-react";
import { pipelineStages, statusLabel } from "@/data/pipeline";
import { candidatos } from "@/data/candidatos";
import { CandidateCard } from "@/components/common/CandidateCard";
import { Button } from "@/components/common/Button";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — Talent Manager" },
      { name: "description", content: "Acompanhe seus candidatos em cada etapa do processo seletivo." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <div className="tm-page" style={{ maxWidth: "100%" }}>
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Pipeline</h1>
          <p className="tm-page-subtitle">Arraste os cards para movimentar candidatos entre as etapas.</p>
        </div>
        <Button icon={<Plus size={16} />}>Adicionar candidato</Button>
      </div>

      <div className="tm-kanban">
        {pipelineStages.map((stage) => {
          const cards = candidatos.filter((c) => c.status === stage.id);
          return (
            <div key={stage.id} className="tm-kanban-col">
              <div className="tm-kanban-col-header">
                <div className="tm-flex tm-items-center tm-gap-2">
                  <GripVertical size={14} className="tm-muted" />
                  <span className="tm-kanban-col-title">{statusLabel[stage.id]}</span>
                  <span className="tm-badge tm-badge-neutral" style={{ fontSize: 11 }}>{cards.length}</span>
                </div>
              </div>
              <div className="tm-flex tm-flex-col tm-gap-2">
                {cards.map((c) => <CandidateCard key={c.id} candidato={c} />)}
                {cards.length === 0 && (
                  <div className="tm-muted" style={{ fontSize: 12, textAlign: "center", padding: "1rem", border: "1px dashed var(--color-border)", borderRadius: 8 }}>
                    Solte aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
