import { useEffect, useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { listCandidatos, updateCandidato, type Candidato } from "@/lib/data/candidatos.repo";
import { pipelineStages, statusLabel } from "@/data/pipeline";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { AddCandidateModal } from "@/components/common/AddCandidateModal";
import { AddEntrevistaModal } from "@/components/common/AddEntrevistaModal";
import { StatusBtn } from "@/components/common/StatusBtn";
import { senioridadeLabel } from "@/data/pipeline";
import { MapPin } from "lucide-react";

function DroppableCol({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="tm-kanban-col"
      style={{ background: isOver ? "var(--color-primary-soft)" : undefined, transition: "background 0.15s" }}
    >
      {children}
    </div>
  );
}

function DraggableCard({ candidato, onStatusChange, onAgendar }: { candidato: Candidato; onStatusChange: () => void; onAgendar: (c: Candidato) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: candidato.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="tm-kanban-card"
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <div className="tm-flex tm-gap-3 tm-items-center" style={{ marginBottom: 8 }}>
        <Avatar nome={candidato.nome} tamanho="md" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{candidato.nome}</div>
          <div className="tm-muted" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {candidato.cargo_pretendido ?? "—"}
          </div>
        </div>
      </div>
      <div className="tm-flex tm-items-center tm-justify-between" style={{ fontSize: 12 }}>
        <div className="tm-flex tm-gap-2 tm-items-center">
          {candidato.senioridade && (
            <Badge variant="primary">{senioridadeLabel[candidato.senioridade] ?? candidato.senioridade}</Badge>
          )}
          {candidato.cidade && (
            <span className="tm-muted tm-flex tm-items-center tm-gap-1"><MapPin size={11} />{candidato.cidade}</span>
          )}
        </div>
        <div onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAgendar(candidato)}
            title="Agendar entrevista"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: 6, border: "1px solid var(--color-border)",
              background: "var(--color-card)", cursor: "pointer", color: "var(--color-muted-foreground)",
              flexShrink: 0,
            }}
          >
            <CalendarDays size={13} />
          </button>
        </div>
      </div>
      {candidato.status === "proposta" && (
        <div onPointerDown={(e) => e.stopPropagation()} style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
          <StatusBtn
            onAprovar={async () => { await updateCandidato(candidato.id, { status: "contratado" }); onStatusChange(); }}
            onReprovar={async () => { await updateCandidato(candidato.id, { status: "arquivado" }); onStatusChange(); }}
          />
        </div>
      )}
    </div>
  );
}

export default function PipelinePage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [candidatoEntrevista, setCandidatoEntrevista] = useState<Candidato | null>(null);

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    listCandidatos()
      .then(setCandidatos)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  async function recarregarCandidatos() {
    listCandidatos().then(setCandidatos).catch(console.error);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const novoStatus = over.id as string;
    setCandidatos((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, status: novoStatus } : c)),
    );
    await updateCandidato(active.id as string, { status: novoStatus });
  }

  if (carregando) {
    return (
      <div className="tm-page">
        <h1 className="tm-page-title">Pipeline</h1>
        <div className="tm-kanban">
          {pipelineStages.map((s) => (
            <div key={s.id} className="tm-kanban-col">
              <div className="tm-kanban-col-header">{statusLabel[s.id]}</div>
              <Skeleton height={80} />
              <Skeleton height={80} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page" style={{ maxWidth: "100%" }}>
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Pipeline</h1>
          <p className="tm-page-subtitle">Arraste os cards para movimentar candidatos entre as etapas.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModalAdicionar(true)}>Adicionar candidato</Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="tm-kanban">
          {pipelineStages.map((stage) => {
            const cards = candidatos.filter((c) => c.status === stage.id);
            return (
              <DroppableCol key={stage.id} id={stage.id}>
                <div className="tm-kanban-col-header">
                  <div className="tm-flex tm-items-center tm-gap-2">
                    <span className="tm-kanban-col-title">{statusLabel[stage.id]}</span>
                    <span className="tm-badge tm-badge-neutral" style={{ fontSize: 11 }}>{cards.length}</span>
                  </div>
                </div>
                <div className="tm-flex tm-flex-col tm-gap-2">
                  {cards.map((c) => <DraggableCard key={c.id} candidato={c} onStatusChange={recarregarCandidatos} onAgendar={setCandidatoEntrevista} />)}
                  {cards.length === 0 && (
                    <div className="tm-muted" style={{ fontSize: 12, textAlign: "center", padding: "1rem", border: "1px dashed var(--color-border)", borderRadius: 8 }}>
                      Solte aqui
                    </div>
                  )}
                </div>
              </DroppableCol>
            );
          })}
        </div>
      </DndContext>

      <AddCandidateModal
        aberto={modalAdicionar}
        onFechar={() => setModalAdicionar(false)}
        onCriado={setCandidatos}
      />

      <AddEntrevistaModal
        aberto={!!candidatoEntrevista}
        onFechar={() => setCandidatoEntrevista(null)}
        onCriada={() => {}}
        candidato={candidatoEntrevista ?? undefined}
      />
    </div>
  );
}
