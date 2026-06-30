import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Field, Input, Select, Textarea } from "./Input";
import { createAvaliacao, listAvaliacoes, type Avaliacao } from "@/lib/data/avaliacoes.repo";
import { listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";
import { listEntrevistas, type Entrevista } from "@/lib/data/entrevistas.repo";

const STATUS_ELEGIVEIS = new Set(["entrevista_rh", "entrevista_tecnica", "proposta", "contratado"]);

interface AddAvaliacaoModalProps {
  aberto: boolean;
  onFechar: () => void;
  candidato?: Candidato | null;
  onCriada: (lista: Avaliacao[]) => void;
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function dataMaisRecente(entrevistas: Entrevista[], candidatoId: string): string {
  const doCandidato = entrevistas
    .filter((e) => e.candidato_id === candidatoId)
    .sort((a, b) => b.data.localeCompare(a.data));
  return doCandidato[0]?.data ?? hoje();
}

export function AddAvaliacaoModal({ aberto, onFechar, candidato, onCriada }: AddAvaliacaoModalProps) {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    candidato_id: "",
    avaliador: "",
    nota: "7",
    comentario: "",
    data: hoje(),
  });

  useEffect(() => {
    Promise.all([
      candidato ? Promise.resolve([]) : listCandidatos(),
      listEntrevistas(),
    ])
      .then(([cands, entrs]) => {
        setCandidatos((cands as Candidato[]).filter((c) => STATUS_ELEGIVEIS.has(c.status)));
        setEntrevistas(entrs as Entrevista[]);
      })
      .catch(console.error);
  }, [candidato]);

  useEffect(() => {
    if (!aberto) return;
    const candidatoId = candidato?.id ?? "";
    const data = candidatoId ? dataMaisRecente(entrevistas, candidatoId) : hoje();
    setForm({
      candidato_id: candidatoId,
      avaliador: "",
      nota: "7",
      comentario: "",
      data,
    });
  }, [aberto, candidato, entrevistas]);

  function set(campo: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor = e.target.value;
      setForm((f) => {
        const next = { ...f, [campo]: valor };
        if (campo === "candidato_id" && valor) {
          next.data = dataMaisRecente(entrevistas, valor);
        }
        return next;
      });
    };
  }

  const candidatoNome = candidato
    ? candidato.nome
    : candidatos.find((c) => c.id === form.candidato_id)?.nome ?? "";

  const nota = Number(form.nota);
  const podeSalvar =
    !!form.candidato_id &&
    !!form.avaliador.trim() &&
    nota >= 1 &&
    nota <= 10 &&
    !!form.data;

  async function handleSalvar() {
    if (!podeSalvar) return;
    setSalvando(true);
    try {
      await createAvaliacao({
        candidato_id: form.candidato_id,
        candidato_nome: candidatoNome,
        avaliador: form.avaliador.trim(),
        nota,
        comentario: form.comentario.trim() || null,
        data: form.data,
      });
      const lista = await listAvaliacoes();
      onCriada(lista);
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
      titulo="Nova avaliação"
      onFechar={onFechar}
      acoes={
        <>
          <Button variant="secondary" onClick={onFechar} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={salvando || !podeSalvar}>
            {salvando ? "Salvando…" : "Criar"}
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
            <Select value={form.candidato_id} onChange={set("candidato_id")}>
              <option value="">Selecione um candidato</option>
              {candidatos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Avaliador *">
          <Input
            value={form.avaliador}
            onChange={set("avaliador")}
            placeholder="Ex.: João Silva"
          />
        </Field>

        <Field label="Nota (1–10) *">
          <Input
            type="number"
            min={1}
            max={10}
            step={0.5}
            value={form.nota}
            onChange={set("nota")}
          />
        </Field>

        <Field label="Comentário">
          <Textarea
            value={form.comentario}
            onChange={set("comentario")}
            placeholder="Observações sobre o candidato..."
            rows={3}
          />
        </Field>

        <Field label="Data *" hint="Pré-preenchida com a data da entrevista mais recente.">
          <Input type="date" value={form.data} onChange={set("data")} />
        </Field>
      </div>
    </Modal>
  );
}
