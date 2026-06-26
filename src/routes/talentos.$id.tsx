import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Mail, Phone, MapPin, Linkedin, Github, Globe,
  Briefcase, GraduationCap, Languages, Award, FileText, Star, MessageSquare, Download,
} from "lucide-react";
import { candidatos } from "@/data/candidatos";
import { avaliacoes } from "@/data/avaliacoes";
import { statusLabel, statusVariant, senioridadeLabel } from "@/data/pipeline";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Timeline } from "@/components/ui/Timeline";
import { Textarea } from "@/components/ui/Input";
import { formatarMoeda, formatarData, tempoRelativo } from "@/utils/format";

export const Route = createFileRoute("/talentos/$id")({
  loader: ({ params }) => {
    const c = candidatos.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nome ?? "Candidato"} — Talent Manager` },
      { name: "description", content: `Perfil completo de ${loaderData?.nome ?? "candidato"}.` },
    ],
  }),
  component: PerfilCandidato,
  notFoundComponent: () => (
    <div className="tm-page">
      <Link to="/talentos" className="tm-btn tm-btn-ghost"><ArrowLeft size={16} /> Voltar</Link>
      <h1 className="tm-page-title" style={{ marginTop: 16 }}>Candidato não encontrado</h1>
    </div>
  ),
});

type Tab = "dados" | "experiencia" | "skills" | "timeline" | "avaliacoes" | "documentos";

function PerfilCandidato() {
  const c = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("dados");
  const avals = avaliacoes.filter((a) => a.candidatoId === c.id);

  return (
    <div className="tm-page">
      <Link to="/talentos" className="tm-btn tm-btn-ghost" style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Banco de Talentos
      </Link>

      <div className="tm-card tm-card-pad" style={{ marginBottom: 16 }}>
        <div className="tm-flex tm-gap-4" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
          <Avatar nome={c.nome} foto={c.foto} tamanho="xl" />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1 className="tm-page-title" style={{ marginBottom: 4 }}>{c.nome}</h1>
            <div className="tm-flex tm-gap-2 tm-items-center" style={{ flexWrap: "wrap" }}>
              <span className="tm-muted">{c.cargoPretendido}</span>
              <Badge variant="primary">{senioridadeLabel[c.senioridade]}</Badge>
              <Badge variant={statusVariant[c.status] as any} dot>{statusLabel[c.status]}</Badge>
            </div>
            <div className="tm-flex tm-gap-4 tm-items-center" style={{ marginTop: 12, flexWrap: "wrap", fontSize: 13 }}>
              <span className="tm-muted tm-flex tm-items-center tm-gap-2"><Mail size={14} />{c.email}</span>
              <span className="tm-muted tm-flex tm-items-center tm-gap-2"><Phone size={14} />{c.telefone}</span>
              <span className="tm-muted tm-flex tm-items-center tm-gap-2"><MapPin size={14} />{c.cidade}/{c.estado}</span>
            </div>
            <div className="tm-flex tm-gap-2" style={{ marginTop: 12, flexWrap: "wrap" }}>
              {c.linkedin && <a className="tm-btn tm-btn-secondary tm-btn-sm" href="#" onClick={(e) => e.preventDefault()}><Linkedin size={14} /> LinkedIn</a>}
              {c.github && <a className="tm-btn tm-btn-secondary tm-btn-sm" href="#" onClick={(e) => e.preventDefault()}><Github size={14} /> GitHub</a>}
              {c.portfolio && <a className="tm-btn tm-btn-secondary tm-btn-sm" href="#" onClick={(e) => e.preventDefault()}><Globe size={14} /> Portfólio</a>}
            </div>
          </div>
          <div style={{ minWidth: 180, textAlign: "right" }}>
            <div className="tm-label">Pretensão salarial</div>
            <div className="tm-h2" style={{ marginTop: 4 }}>{formatarMoeda(c.pretensaoSalarial)}</div>
            <div className="tm-muted" style={{ fontSize: 12, marginTop: 4 }}>
              Recrutador: <strong style={{ color: "var(--color-foreground)" }}>{c.recrutadorResponsavel}</strong>
            </div>
            <div className="tm-flex tm-gap-2" style={{ marginTop: 12, justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm">Mover etapa</Button>
              <Button size="sm">Agendar entrevista</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="tm-tabs">
        {([
          ["dados", "Dados pessoais"],
          ["experiencia", "Experiência & Formação"],
          ["skills", "Skills & Idiomas"],
          ["timeline", "Timeline"],
          ["avaliacoes", "Avaliações"],
          ["documentos", "Documentos"],
        ] as [Tab, string][]).map(([k, label]) => (
          <div key={k} className={`tm-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{label}</div>
        ))}
      </div>

      {tab === "dados" && (
        <div className="tm-grid-2">
          <div className="tm-card tm-card-pad">
            <h3 className="tm-h2" style={{ marginBottom: 12 }}>Contato</h3>
            <Linha label="Email" valor={c.email} />
            <Linha label="Telefone" valor={c.telefone} />
            <Linha label="Cidade" valor={`${c.cidade} / ${c.estado}`} />
            <Linha label="LinkedIn" valor={c.linkedin || "—"} />
            <Linha label="GitHub" valor={c.github || "—"} />
            <Linha label="Portfólio" valor={c.portfolio || "—"} />
          </div>
          <div className="tm-card tm-card-pad">
            <h3 className="tm-h2" style={{ marginBottom: 12 }}>Observações</h3>
            <Textarea defaultValue={c.observacoes} rows={6} />
            <div className="tm-flex" style={{ justifyContent: "flex-end", marginTop: 12 }}>
              <Button size="sm">Salvar observações</Button>
            </div>
          </div>
        </div>
      )}

      {tab === "experiencia" && (
        <div className="tm-grid-2">
          <div className="tm-card tm-card-pad">
            <h3 className="tm-h2 tm-flex tm-items-center tm-gap-2" style={{ marginBottom: 16 }}><Briefcase size={18} /> Experiência</h3>
            {c.experiencias.map((e) => (
              <div key={e.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ fontWeight: 600 }}>{e.cargo}</div>
                <div className="tm-muted" style={{ fontSize: 13 }}>{e.empresa} · {e.inicio} — {e.fim || "Atual"}</div>
                <p style={{ marginTop: 8, fontSize: 13 }}>{e.descricao}</p>
              </div>
            ))}
          </div>
          <div className="tm-card tm-card-pad">
            <h3 className="tm-h2 tm-flex tm-items-center tm-gap-2" style={{ marginBottom: 16 }}><GraduationCap size={18} /> Formação</h3>
            {c.formacoes.map((f) => (
              <div key={f.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ fontWeight: 600 }}>{f.curso}</div>
                <div className="tm-muted" style={{ fontSize: 13 }}>{f.instituicao} · {f.inicio} — {f.fim}</div>
              </div>
            ))}
            <h3 className="tm-h2 tm-flex tm-items-center tm-gap-2" style={{ marginTop: 20, marginBottom: 12 }}><Award size={18} /> Certificações</h3>
            {c.certificacoes.map((cert, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{cert.nome}</div>
                <div className="tm-muted" style={{ fontSize: 12 }}>{cert.emissor} · {cert.data}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div className="tm-grid-2">
          <div className="tm-card tm-card-pad">
            <h3 className="tm-h2" style={{ marginBottom: 12 }}>Skills</h3>
            <div className="tm-flex tm-gap-2" style={{ flexWrap: "wrap" }}>
              {c.skills.map((s) => <Badge key={s} variant="info">{s}</Badge>)}
            </div>
          </div>
          <div className="tm-card tm-card-pad">
            <h3 className="tm-h2 tm-flex tm-items-center tm-gap-2" style={{ marginBottom: 12 }}><Languages size={18} /> Idiomas</h3>
            {c.idiomas.map((i) => (
              <div key={i.idioma} className="tm-flex tm-justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span>{i.idioma}</span>
                <Badge variant="neutral">{i.nivel}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Histórico de movimentações</h3>
          <Timeline eventos={c.timeline} />
        </div>
      )}

      {tab === "avaliacoes" && (
        <div className="tm-flex tm-flex-col tm-gap-3">
          {avals.length === 0 && <div className="tm-card tm-card-pad tm-muted">Nenhuma avaliação registrada ainda.</div>}
          {avals.map((a) => (
            <div key={a.id} className="tm-card tm-card-pad">
              <div className="tm-flex tm-justify-between tm-items-center" style={{ marginBottom: 8 }}>
                <div className="tm-flex tm-items-center tm-gap-2">
                  <MessageSquare size={16} />
                  <strong>{a.avaliador}</strong>
                  <span className="tm-muted" style={{ fontSize: 12 }}>· {tempoRelativo(a.data)}</span>
                </div>
                <div className="tm-flex tm-items-center tm-gap-1">
                  <Star size={14} fill="currentColor" style={{ color: "var(--color-warning)" }} />
                  <strong>{a.nota.toFixed(1)}</strong>
                </div>
              </div>
              <p style={{ fontSize: 14 }}>{a.comentario}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "documentos" && (
        <div className="tm-card" style={{ padding: 0 }}>
          {c.documentos.map((d, i) => (
            <div key={d.id} className="tm-flex tm-items-center tm-justify-between" style={{ padding: "14px 18px", borderBottom: i < c.documentos.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <div className="tm-flex tm-items-center tm-gap-3">
                <span style={{ width: 36, height: 36, background: "var(--color-muted)", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><FileText size={16} /></span>
                <div>
                  <div style={{ fontWeight: 500 }}>{d.nome}</div>
                  <div className="tm-muted" style={{ fontSize: 12 }}>{d.tipo} · {d.tamanho} · {formatarData(d.adicionadoEm)}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" icon={<Download size={14} />}>Baixar</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="tm-flex tm-justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--color-border)", fontSize: 14 }}>
      <span className="tm-muted">{label}</span>
      <span style={{ fontWeight: 500 }}>{valor}</span>
    </div>
  );
}
