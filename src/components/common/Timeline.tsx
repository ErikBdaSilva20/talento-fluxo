import type { TimelineEvento } from "@/types";
import { tempoRelativo } from "@/utils/format";
import { Activity, MessageSquare, Star, UserPlus, ArrowRight, Paperclip } from "lucide-react";

const iconePorTipo = {
  criacao: <UserPlus size={14} />,
  mudanca_status: <ArrowRight size={14} />,
  entrevista: <Activity size={14} />,
  avaliacao: <Star size={14} />,
  nota: <MessageSquare size={14} />,
  documento: <Paperclip size={14} />,
};

export function Timeline({ eventos }: { eventos: TimelineEvento[] }) {
  return (
    <div className="tm-timeline">
      {eventos.map((e) => (
        <div key={e.id} className="tm-timeline-item">
          <div className="tm-timeline-rail">
            <span className="tm-timeline-dot">{iconePorTipo[e.tipo]}</span>
            <span className="tm-timeline-line" />
          </div>
          <div className="tm-timeline-content">
            <div style={{ fontWeight: 500, fontSize: 14 }}>{e.titulo}</div>
            {e.descricao && <div className="tm-muted" style={{ fontSize: 13, marginTop: 2 }}>{e.descricao}</div>}
            <div className="tm-muted" style={{ fontSize: 12, marginTop: 4 }}>
              {e.autor} · {tempoRelativo(e.data)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
