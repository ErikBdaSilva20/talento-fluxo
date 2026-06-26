import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { tags as data } from "@/data/tags";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Field, Input, Select } from "@/components/common/Input";

export const Route = createFileRoute("/tags")({
  head: () => ({
    meta: [
      { title: "Tags — Talent Manager" },
      { name: "description", content: "Gerencie as tags utilizadas para classificar candidatos." },
    ],
  }),
  component: TagsPage,
});

const categoriaLabel: Record<string, string> = {
  skill: "Skill",
  modalidade: "Modalidade",
  idioma: "Idioma",
  nivel: "Nível",
  disponibilidade: "Disponibilidade",
  geral: "Geral",
};

function TagsPage() {
  const [modal, setModal] = useState(false);
  const grupos = Array.from(new Set(data.map((t) => t.categoria)));
  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Tags</h1>
          <p className="tm-page-subtitle">Organize candidatos com tags personalizadas.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Nova tag</Button>
      </div>

      <div className="tm-flex tm-flex-col tm-gap-4">
        {grupos.map((cat) => (
          <div key={cat} className="tm-card tm-card-pad">
            <h3 className="tm-h2" style={{ marginBottom: 12 }}>{categoriaLabel[cat]}</h3>
            <div className="tm-flex tm-gap-2" style={{ flexWrap: "wrap" }}>
              {data.filter((t) => t.categoria === cat).map((t) => (
                <div key={t.id} className="tm-flex tm-items-center tm-gap-2" style={{ background: "var(--color-surface-2)", borderRadius: 999, padding: "4px 4px 4px 12px", border: "1px solid var(--color-border)" }}>
                  <Badge variant={t.cor as any}>{t.nome}</Badge>
                  <span className="tm-muted" style={{ fontSize: 12 }}>{t.usos}</span>
                  <Button variant="ghost" size="sm" iconOnly icon={<Pencil size={12} />} />
                  <Button variant="ghost" size="sm" iconOnly icon={<Trash2 size={12} />} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        aberto={modal}
        titulo="Nova tag"
        onFechar={() => setModal(false)}
        acoes={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button onClick={() => setModal(false)}>Salvar</Button></>}
      >
        <div className="tm-flex tm-flex-col tm-gap-3">
          <Field label="Nome"><Input placeholder="Ex.: React" /></Field>
          <Field label="Categoria">
            <Select>
              {Object.entries(categoriaLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Cor">
            <Select>
              <option value="primary">Primária</option>
              <option value="info">Info</option>
              <option value="success">Sucesso</option>
              <option value="warning">Atenção</option>
              <option value="danger">Crítico</option>
              <option value="neutral">Neutro</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
