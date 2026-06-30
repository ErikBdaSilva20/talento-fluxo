import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Field, Input, Select } from "./Input";
import { createEntrevista, listEntrevistas, type Entrevista } from "@/lib/data/entrevistas.repo";
import { listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";
import { hojeUTC3, agoraHorarioUTC3 } from "@/lib/utils";

const tipoEntrevistaLabel: Record<string, string> = {
  rh: "RH", tecnica: "Técnica", cultural: "Cultural", gestor: "Gestor", final: "Final",
};

const formVazio = { candidato_id: "", candidato_nome: "", entrevistador: "", data: "", horario: "", tipo: "rh" };

interface AddEntrevistaModalProps {
  aberto: boolean;
  onFechar: () => void;
  onCriada: (lista: Entrevista[]) => void;
  candidatos?: Candidato[];
  candidato?: Candidato;
}

export function AddEntrevistaModal({ aberto, onFechar, onCriada, candidatos: candidatosProp, candidato }: AddEntrevistaModalProps) {
  const [candidatos, setCandidatos] = useState<Candidato[]>(candidatosProp ?? []);
  const [form, setForm] = useState(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!candidatosProp && !candidato) {
      listCandidatos().then(setCandidatos).catch(console.error);
    }
  }, [candidatosProp, candidato]);

  useEffect(() => {
    if (candidatosProp) setCandidatos(candidatosProp);
  }, [candidatosProp]);

  useEffect(() => {
    if (aberto) {
      setForm({
        ...formVazio,
        candidato_id: candidato?.id ?? "",
        candidato_nome: candidato?.nome ?? "",
      });
      setErro("");
    }
  }, [aberto, candidato]);

  const set_ = (campo: string) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = ev.target.value;
    if (campo === "candidato_id") {
      const c = candidatos.find((c) => c.id === val);
      setForm((f) => ({ ...f, candidato_id: val, candidato_nome: c?.nome ?? "" }));
    } else {
      setForm((f) => ({ ...f, [campo]: val }));
    }
  };

  async function handleSalvar() {
    if (!form.candidato_id || !form.entrevistador || !form.data || !form.horario) return;
    if (form.data < hojeUTC3()) { setErro("Data no passado."); return; }
    if (form.data === hojeUTC3() && form.horario < agoraHorarioUTC3()) { setErro("Horário já passou."); return; }
    setErro("");
    setSalvando(true);
    try {
      await createEntrevista({
        candidato_id: form.candidato_id,
        candidato_nome: form.candidato_nome,
        entrevistador: form.entrevistador,
        data: form.data,
        horario: form.horario,
        tipo: form.tipo,
      });
      const lista = await listEntrevistas();
      onCriada(lista);
      onFechar();
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  const podeSalvar = !!form.candidato_id && !!form.entrevistador && !!form.data && !!form.horario;

  return (
    <Modal
      aberto={aberto}
      titulo="Nova entrevista"
      onFechar={onFechar}
      acoes={
        <>
          <Button variant="secondary" onClick={onFechar} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={salvando || !podeSalvar}>
            {salvando ? "Salvando…" : "Agendar"}
          </Button>
        </>
      }
    >
      <div className="tm-flex tm-flex-col tm-gap-3">
        {candidato ? (
          <Field label="Candidato">
            <Input value={candidato.nome} disabled />
          </Field>
        ) : (
          <Field label="Candidato *">
            <Select value={form.candidato_id} onChange={set_("candidato_id")}>
              <option value="">Selecione um candidato</option>
              {candidatos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Entrevistador *">
          <Input value={form.entrevistador} onChange={set_("entrevistador")} placeholder="Nome do entrevistador" />
        </Field>
        <Field label="Data *">
          <Input type="date" value={form.data} onChange={set_("data")} min={hojeUTC3()} />
        </Field>
        <Field label="Horário *">
          <Input type="time" value={form.horario} onChange={set_("horario")} min={form.data === hojeUTC3() ? agoraHorarioUTC3() : undefined} />
        </Field>
        <p style={{ fontSize: 12, color: "var(--color-warning)", margin: 0 }}>⚠ Horários em UTC-3 (Brasília)</p>
        {erro && <p style={{ fontSize: 12, color: "var(--color-destructive)", margin: 0 }}>{erro}</p>}
        <Field label="Tipo">
          <Select value={form.tipo} onChange={set_("tipo")}>
            {Object.entries(tipoEntrevistaLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
