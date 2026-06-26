import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, Workflow, Tag, Palette, Bell } from "lucide-react";
import { Field, Input, Textarea, Select } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { pipelineStages, statusLabel } from "@/data/pipeline";
import { recrutadores } from "@/data/recrutadores";
import { tags } from "@/data/tags";
import { Avatar } from "@/components/common/Avatar";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Talent Manager" },
      { name: "description", content: "Personalize empresa, equipe, pipeline e preferências." },
    ],
  }),
  component: ConfiguracoesPage,
});

type Aba = "empresa" | "equipe" | "pipeline" | "tags" | "aparencia" | "notificacoes";

const abas: { id: Aba; label: string; icon: any }[] = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "equipe", label: "Equipe", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: Workflow },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "notificacoes", label: "Notificações", icon: Bell },
];

function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return <span className={`tm-switch ${on ? "on" : ""}`} onClick={onChange} role="switch" aria-checked={on} />;
}

function ConfiguracoesPage() {
  const [aba, setAba] = useState<Aba>("empresa");
  const [notif, setNotif] = useState({ email: true, novosCandidatos: true, entrevistas: true, semanal: false });

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Configurações</h1>
          <p className="tm-page-subtitle">Personalize a plataforma para a sua operação.</p>
        </div>
      </div>

      <div className="tm-tabs">
        {abas.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className={`tm-tab ${aba === a.id ? "active" : ""}`} onClick={() => setAba(a.id)}>
              <span className="tm-flex tm-items-center tm-gap-2"><Icon size={14} />{a.label}</span>
            </div>
          );
        })}
      </div>

      {aba === "empresa" && (
        <div className="tm-card tm-card-pad" style={{ maxWidth: 720 }}>
          <h3 className="tm-h2" style={{ marginBottom: 16 }}>Dados da empresa</h3>
          <div className="tm-grid-2">
            <Field label="Razão social"><Input defaultValue="MasIA Tecnologia Ltda." /></Field>
            <Field label="CNPJ"><Input defaultValue="00.000.000/0001-00" /></Field>
            <Field label="Email institucional"><Input defaultValue="rh@masia.com" /></Field>
            <Field label="Telefone"><Input defaultValue="(11) 4000-0000" /></Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label="Descrição"><Textarea rows={3} defaultValue="MasIA — plataforma de gestão interna de talentos." /></Field>
          </div>
          <div className="tm-flex" style={{ justifyContent: "flex-end", marginTop: 16 }}><Button>Salvar alterações</Button></div>
        </div>
      )}

      {aba === "equipe" && (
        <div className="tm-card" style={{ padding: 0 }}>
          {recrutadores.map((r, i) => (
            <div key={r.id} className="tm-flex tm-items-center tm-justify-between" style={{ padding: "14px 18px", borderBottom: i < recrutadores.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <div className="tm-flex tm-items-center tm-gap-3">
                <Avatar nome={r.nome} />
                <div>
                  <div style={{ fontWeight: 500 }}>{r.nome}</div>
                  <div className="tm-muted" style={{ fontSize: 12 }}>{r.cargo} · {r.email}</div>
                </div>
              </div>
              {r.status === "ativo" ? <Badge variant="success" dot>Ativo</Badge> : <Badge variant="neutral" dot>Inativo</Badge>}
            </div>
          ))}
        </div>
      )}

      {aba === "pipeline" && (
        <div className="tm-card tm-card-pad" style={{ maxWidth: 720 }}>
          <h3 className="tm-h2" style={{ marginBottom: 8 }}>Etapas do pipeline</h3>
          <p className="tm-muted" style={{ marginBottom: 16, fontSize: 13 }}>Reordene ou renomeie as etapas do seu processo seletivo.</p>
          {pipelineStages.map((s) => (
            <div key={s.id} className="tm-flex tm-items-center tm-gap-3" style={{ padding: "10px 12px", border: "1px solid var(--color-border)", borderRadius: 8, marginBottom: 8 }}>
              <span className="tm-mono tm-muted" style={{ fontSize: 12, width: 24 }}>{s.ordem}</span>
              <Input defaultValue={statusLabel[s.id]} style={{ flex: 1 }} />
              <Badge variant="neutral">{s.id}</Badge>
            </div>
          ))}
        </div>
      )}

      {aba === "tags" && (
        <div className="tm-card tm-card-pad">
          <p className="tm-muted" style={{ marginBottom: 12 }}>Gerencie suas tags na <strong>tela de Tags</strong>.</p>
          <div className="tm-flex tm-gap-2" style={{ flexWrap: "wrap" }}>
            {tags.slice(0, 12).map((t) => <Badge key={t.id} variant={t.cor as any}>{t.nome}</Badge>)}
          </div>
        </div>
      )}

      {aba === "aparencia" && (
        <div className="tm-card tm-card-pad" style={{ maxWidth: 720 }}>
          <h3 className="tm-h2" style={{ marginBottom: 16 }}>Aparência</h3>
          <Field label="Tema">
            <Select defaultValue="claro">
              <option value="claro">Claro</option>
              <option value="escuro">Escuro</option>
              <option value="sistema">Seguir sistema</option>
            </Select>
          </Field>
          <div style={{ marginTop: 16 }}>
            <Field label="Cor de destaque">
              <div className="tm-flex tm-gap-2">
                {["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444"].map((c) => (
                  <span key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: "2px solid var(--color-border)" }} />
                ))}
              </div>
            </Field>
          </div>
        </div>
      )}

      {aba === "notificacoes" && (
        <div className="tm-card tm-card-pad" style={{ maxWidth: 720 }}>
          {[
            { k: "email" as const, t: "Receber resumo por email", d: "Resumos diários sobre seus candidatos." },
            { k: "novosCandidatos" as const, t: "Novos candidatos cadastrados", d: "Seja notificado quando um candidato for adicionado." },
            { k: "entrevistas" as const, t: "Lembretes de entrevistas", d: "Lembretes 1h antes de cada entrevista." },
            { k: "semanal" as const, t: "Relatório semanal", d: "Relatório enviado toda segunda-feira." },
          ].map((it, i, arr) => (
            <div key={it.k} className="tm-flex tm-items-center tm-justify-between" style={{ padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <div>
                <div style={{ fontWeight: 500 }}>{it.t}</div>
                <div className="tm-muted" style={{ fontSize: 13 }}>{it.d}</div>
              </div>
              <Switch on={notif[it.k]} onChange={() => setNotif((n) => ({ ...n, [it.k]: !n[it.k] }))} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
