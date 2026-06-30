import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Briefcase, Star, Plus } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { AddAvaliacaoModal } from "./AddAvaliacaoModal";
import { listAvaliacoes, type Avaliacao } from "@/lib/data/avaliacoes.repo";
import { statusLabel, statusVariant, senioridadeLabel, pipelineStages } from "@/data/pipeline";
import type { Candidato } from "@/lib/data/candidatos.repo";

const ORDEM_MINIMA_ELEGIVEL = pipelineStages.find((s) => s.id === "entrevista_rh")!.ordem;

interface CandidateDetailsModalProps {
  candidato: Candidato | null;
  onFechar: () => void;
}

export function CandidateDetailsModal({ candidato, onFechar }: CandidateDetailsModalProps) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregandoAv, setCarregandoAv] = useState(false);
  const [modalAvaliar, setModalAvaliar] = useState(false);

  function carregarAvaliacoes(candidatoId: string) {
    setCarregandoAv(true);
    listAvaliacoes()
      .then((all) => setAvaliacoes(all.filter((a) => a.candidato_id === candidatoId)))
      .catch(console.error)
      .finally(() => setCarregandoAv(false));
  }

  useEffect(() => {
    if (!candidato) return;
    carregarAvaliacoes(candidato.id);
  }, [candidato?.id]);

  const podeAvaliar = candidato
    ? (pipelineStages.find((s) => s.id === candidato.status)?.ordem ?? 0) >= ORDEM_MINIMA_ELEGIVEL &&
      candidato.status !== "arquivado"
    : false;

  const mediaAv = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + Number(a.nota), 0) / avaliacoes.length).toFixed(1)
    : null;

  return (
    <>
    <Modal
      aberto={!!candidato}
      titulo="Detalhes do candidato"
      onFechar={onFechar}
      acoes={<Button variant="secondary" onClick={onFechar}>Fechar</Button>}
    >
      {candidato && (
        <div className="tm-flex tm-flex-col tm-gap-4">
          <div className="tm-flex tm-items-center tm-gap-3">
            <Avatar nome={candidato.nome} tamanho="lg" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{candidato.nome}</div>
              {candidato.cargo_pretendido && (
                <div className="tm-muted tm-flex tm-items-center tm-gap-1">
                  <Briefcase size={13} />{candidato.cargo_pretendido}
                </div>
              )}
              <div style={{ marginTop: 4 }}>
                <Badge variant={statusVariant[candidato.status] as any} dot>
                  {statusLabel[candidato.status] ?? candidato.status}
                </Badge>
                {candidato.senioridade && (
                  <span style={{ marginLeft: 4 }}>
                    <Badge variant="primary">
                      {senioridadeLabel[candidato.senioridade] ?? candidato.senioridade}
                    </Badge>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="tm-flex tm-flex-col tm-gap-2" style={{ fontSize: 14 }}>
            <div className="tm-flex tm-items-center tm-gap-2 tm-muted">
              <Mail size={14} />{candidato.email}
            </div>
            {candidato.telefone && (
              <div className="tm-flex tm-items-center tm-gap-2 tm-muted">
                <Phone size={14} />{candidato.telefone}
              </div>
            )}
            {candidato.cidade && (
              <div className="tm-flex tm-items-center tm-gap-2 tm-muted">
                <MapPin size={14} />{candidato.cidade}{candidato.estado ? `, ${candidato.estado}` : ""}
              </div>
            )}
            {candidato.recrutador_nome && (
              <div className="tm-muted">Recrutador: <strong>{candidato.recrutador_nome}</strong></div>
            )}
            {candidato.observacoes && (
              <div className="tm-muted" style={{ marginTop: 4 }}>{candidato.observacoes}</div>
            )}
          </div>

          <div>
            <div className="tm-flex tm-items-center tm-justify-between" style={{ marginBottom: 8 }}>
              <div className="tm-flex tm-items-center tm-gap-3">
                <strong style={{ fontSize: 14 }}>Avaliações</strong>
                {mediaAv && (
                  <span className="tm-flex tm-items-center tm-gap-1" style={{ fontSize: 13, color: "var(--color-warning)" }}>
                    <Star size={13} fill="currentColor" />
                    <strong style={{ color: "var(--color-foreground)" }}>{mediaAv}</strong>
                    <span className="tm-muted">({avaliacoes.length})</span>
                  </span>
                )}
              </div>
              {podeAvaliar && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={13} />}
                  onClick={() => setModalAvaliar(true)}
                >
                  Avaliar
                </Button>
              )}
            </div>
            {carregandoAv ? (
              <div className="tm-flex tm-flex-col tm-gap-2">
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            ) : avaliacoes.length === 0 ? (
              <p className="tm-muted" style={{ fontSize: 13 }}>Nenhuma avaliação registrada.</p>
            ) : (
              <div className="tm-flex tm-flex-col tm-gap-2">
                {avaliacoes.map((a) => (
                  <div key={a.id} className="tm-card tm-card-pad" style={{ padding: "8px 12px" }}>
                    <div className="tm-flex tm-items-center tm-justify-between">
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{a.avaliador}</span>
                      <span className="tm-flex tm-items-center tm-gap-1" style={{ color: "var(--color-warning)", fontSize: 13 }}>
                        <Star size={12} fill="currentColor" />
                        <strong style={{ color: "var(--color-foreground)" }}>{Number(a.nota).toFixed(1)}</strong>
                      </span>
                    </div>
                    {a.comentario && <p className="tm-muted" style={{ fontSize: 12, marginTop: 4 }}>{a.comentario}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>

    {candidato && (
      <AddAvaliacaoModal
        aberto={modalAvaliar}
        onFechar={() => setModalAvaliar(false)}
        candidato={candidato}
        onCriada={() => carregarAvaliacoes(candidato.id)}
      />
    )}
    </>
  );
}
