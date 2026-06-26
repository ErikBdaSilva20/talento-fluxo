import { useEffect, useState } from "react";
import { Mail, Phone, Plus, Pencil, Trash2 } from "lucide-react";
import {
  listRecrutadores, createRecrutador, updateRecrutador, deleteRecrutador,
  type Recrutador,
} from "@/lib/data/recrutadores.repo";
import { Badge } from "@/components/common/Badge";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { Modal } from "@/components/common/Modal";
import { Field, Input, Select } from "@/components/common/Input";

type FormData = { nome: string; cargo: string; email: string; telefone: string; status: string };
const formVazio: FormData = { nome: "", cargo: "", email: "", telefone: "", status: "ativo" };

export default function RecrutadoresPage() {
  const [recrutadores, setRecrutadores] = useState<Recrutador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState<Recrutador | null>(null);
  const [form, setForm] = useState<FormData>(formVazio);
  const [confirmExcluir, setConfirmExcluir] = useState<Recrutador | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listRecrutadores()
      .then(setRecrutadores)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const set_ = (campo: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  function abrirNovo() { setEditando(null); setForm(formVazio); setModalForm(true); }
  function abrirEditar(r: Recrutador) {
    setEditando(r);
    setForm({ nome: r.nome, cargo: r.cargo ?? "", email: r.email, telefone: r.telefone ?? "", status: r.status });
    setModalForm(true);
  }

  async function handleSalvar() {
    if (!form.nome || !form.email) return;
    setSalvando(true);
    try {
      if (editando) {
        await updateRecrutador(editando.id, { nome: form.nome, cargo: form.cargo || null, email: form.email, telefone: form.telefone || null, status: form.status });
      } else {
        await createRecrutador({ nome: form.nome, cargo: form.cargo || null, email: form.email, telefone: form.telefone || null, status: form.status });
      }
      setRecrutadores(await listRecrutadores());
      setModalForm(false);
    } catch (err) { console.error(err); }
    finally { setSalvando(false); }
  }

  async function handleExcluir() {
    if (!confirmExcluir) return;
    setSalvando(true);
    try {
      await deleteRecrutador(confirmExcluir.id);
      setRecrutadores(await listRecrutadores());
      setConfirmExcluir(null);
    } catch (err) { console.error(err); }
    finally { setSalvando(false); }
  }

  if (carregando) {
    return (
      <div className="tm-page">
        <h1 className="tm-page-title">Recrutadores</h1>
        <div className="tm-flex tm-flex-col tm-gap-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={48} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Recrutadores</h1>
          <p className="tm-page-subtitle">Gerencie sua equipe de R&S.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={abrirNovo}>Novo recrutador</Button>
      </div>

      <div className="tm-table-wrap">
        <table className="tm-table">
          <thead>
            <tr>
              <th>Nome</th><th>Cargo</th><th>Email</th><th>Telefone</th><th>Status</th><th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {recrutadores.map((r) => (
              <tr key={r.id}>
                <td><div className="tm-flex tm-items-center tm-gap-3"><Avatar nome={r.nome} /><strong>{r.nome}</strong></div></td>
                <td>{r.cargo ?? "—"}</td>
                <td><span className="tm-muted tm-flex tm-items-center tm-gap-2"><Mail size={13} />{r.email}</span></td>
                <td><span className="tm-muted tm-flex tm-items-center tm-gap-2"><Phone size={13} />{r.telefone ?? "—"}</span></td>
                <td>{r.status === "ativo" ? <Badge variant="success" dot>Ativo</Badge> : <Badge variant="neutral" dot>Inativo</Badge>}</td>
                <td>
                  <div className="tm-flex tm-gap-1">
                    <Button variant="ghost" size="sm" iconOnly icon={<Pencil size={14} />} onClick={() => abrirEditar(r)} />
                    <Button variant="ghost" size="sm" iconOnly icon={<Trash2 size={14} />} onClick={() => setConfirmExcluir(r)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        aberto={modalForm}
        titulo={editando ? "Editar recrutador" : "Novo recrutador"}
        onFechar={() => setModalForm(false)}
        acoes={
          <>
            <Button variant="secondary" onClick={() => setModalForm(false)} disabled={salvando}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={salvando || !form.nome || !form.email}>
              {salvando ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      >
        <div className="tm-flex tm-flex-col tm-gap-3">
          <Field label="Nome *"><Input value={form.nome} onChange={set_("nome")} placeholder="Ex.: Mariana Souza" /></Field>
          <Field label="Cargo"><Input value={form.cargo} onChange={set_("cargo")} placeholder="Ex.: Tech Recruiter Sênior" /></Field>
          <Field label="Email *"><Input type="email" value={form.email} onChange={set_("email")} placeholder="email@masia.com" /></Field>
          <Field label="Telefone"><Input value={form.telefone} onChange={set_("telefone")} placeholder="(11) 99999-9999" /></Field>
          <Field label="Status">
            <Select value={form.status} onChange={set_("status")}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        aberto={!!confirmExcluir}
        titulo="Confirmar exclusão"
        onFechar={() => setConfirmExcluir(null)}
        acoes={
          <>
            <Button variant="secondary" onClick={() => setConfirmExcluir(null)} disabled={salvando}>Cancelar</Button>
            <Button variant="danger" onClick={handleExcluir} disabled={salvando}>
              {salvando ? "Excluindo…" : "Confirmar exclusão"}
            </Button>
          </>
        }
      >
        <p>Deseja excluir o recrutador <strong>{confirmExcluir?.nome}</strong>? Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}
