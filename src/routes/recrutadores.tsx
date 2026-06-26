import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, Plus, Pencil, Trash2 } from "lucide-react";
import { recrutadores as data } from "@/data/recrutadores";
import { Badge } from "@/components/common/Badge";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Field, Input, Select } from "@/components/common/Input";

export const Route = createFileRoute("/recrutadores")({
  head: () => ({
    meta: [
      { title: "Recrutadores — Talent Manager" },
      { name: "description", content: "Equipe de recrutadores responsáveis pelos processos seletivos." },
    ],
  }),
  component: RecrutadoresPage,
});

function RecrutadoresPage() {
  const [modal, setModal] = useState(false);
  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Recrutadores</h1>
          <p className="tm-page-subtitle">Gerencie sua equipe de R&S.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModal(true)}>Novo recrutador</Button>
      </div>

      <div className="tm-table-wrap">
        <table className="tm-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Candidatos</th>
              <th>Status</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="tm-flex tm-items-center tm-gap-3">
                    <Avatar nome={r.nome} />
                    <strong>{r.nome}</strong>
                  </div>
                </td>
                <td>{r.cargo}</td>
                <td><span className="tm-muted tm-flex tm-items-center tm-gap-2"><Mail size={13} />{r.email}</span></td>
                <td><span className="tm-muted tm-flex tm-items-center tm-gap-2"><Phone size={13} />{r.telefone}</span></td>
                <td><strong>{r.candidatos}</strong></td>
                <td>
                  {r.status === "ativo" ? <Badge variant="success" dot>Ativo</Badge> : <Badge variant="neutral" dot>Inativo</Badge>}
                </td>
                <td>
                  <div className="tm-flex tm-gap-1">
                    <Button variant="ghost" size="sm" iconOnly icon={<Pencil size={14} />} />
                    <Button variant="ghost" size="sm" iconOnly icon={<Trash2 size={14} />} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        aberto={modal}
        titulo="Novo recrutador"
        onFechar={() => setModal(false)}
        acoes={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={() => setModal(false)}>Salvar</Button>
          </>
        }
      >
        <div className="tm-flex tm-flex-col tm-gap-3">
          <Field label="Nome completo"><Input placeholder="Ex.: Mariana Souza" /></Field>
          <Field label="Cargo"><Input placeholder="Ex.: Tech Recruiter Sênior" /></Field>
          <Field label="Email"><Input type="email" placeholder="email@masia.com" /></Field>
          <Field label="Telefone"><Input placeholder="(11) 99999-9999" /></Field>
          <Field label="Status">
            <Select defaultValue="ativo">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
