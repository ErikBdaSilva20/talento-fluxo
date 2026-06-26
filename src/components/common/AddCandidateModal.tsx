import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Field, Input, Select } from "./Input";
import { createCandidato, listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";

interface AddCandidateModalProps {
  aberto: boolean;
  onFechar: () => void;
  onCriado: (lista: Candidato[]) => void;
}

export function AddCandidateModal({ aberto, onFechar, onCriado }: AddCandidateModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo_pretendido: "",
    senioridade: "",
  });

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function handleSalvar() {
    if (!form.nome || !form.email) return;
    setSalvando(true);
    try {
      await createCandidato({
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || null,
        cargo_pretendido: form.cargo_pretendido || null,
        senioridade: form.senioridade || null,
      });
      const lista = await listCandidatos();
      onCriado(lista);
      setForm({ nome: "", email: "", telefone: "", cargo_pretendido: "", senioridade: "" });
      onFechar();
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      titulo="Novo candidato"
      onFechar={onFechar}
      acoes={
        <>
          <Button variant="secondary" onClick={onFechar} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={salvando || !form.nome || !form.email}>
            {salvando ? "Salvando…" : "Criar"}
          </Button>
        </>
      }
    >
      <div className="tm-flex tm-flex-col tm-gap-3">
        <Field label="Nome *"><Input value={form.nome} onChange={set("nome")} placeholder="Ex.: Ana Lima" /></Field>
        <Field label="E-mail *"><Input type="email" value={form.email} onChange={set("email")} placeholder="ana@empresa.com" /></Field>
        <Field label="Telefone"><Input value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-9999" /></Field>
        <Field label="Cargo pretendido"><Input value={form.cargo_pretendido} onChange={set("cargo_pretendido")} placeholder="Ex.: Dev Frontend" /></Field>
        <Field label="Senioridade">
          <Select value={form.senioridade} onChange={set("senioridade")}>
            <option value="">Selecione</option>
            <option value="estagiario">Estagiário</option>
            <option value="junior">Júnior</option>
            <option value="pleno">Pleno</option>
            <option value="senior">Sênior</option>
            <option value="especialista">Especialista</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
