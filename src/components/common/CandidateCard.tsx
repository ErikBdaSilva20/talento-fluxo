import type { Candidato } from "@/types";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { senioridadeLabel } from "@/data/pipeline";
import { MapPin } from "lucide-react";

export function CandidateCard({ candidato }: { candidato: Candidato }) {
  return (
    <div className="tm-kanban-card">
      <div className="tm-flex tm-gap-3 tm-items-center" style={{ marginBottom: 8 }}>
        <Avatar nome={candidato.nome} foto={candidato.foto} tamanho="md" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{candidato.nome}</div>
          <div className="tm-muted" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{candidato.cargoPretendido}</div>
        </div>
      </div>
      <div className="tm-flex tm-gap-2 tm-items-center" style={{ fontSize: 12 }}>
        <Badge variant="primary">{senioridadeLabel[candidato.senioridade]}</Badge>
        <span className="tm-muted tm-flex tm-items-center tm-gap-1"><MapPin size={11} />{candidato.cidade}</span>
      </div>
    </div>
  );
}
