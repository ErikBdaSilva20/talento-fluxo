import { useEffect, useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { listEntrevistas, createEntrevista, type Entrevista } from "@/lib/data/entrevistas.repo";
import { listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { Modal } from "@/components/common/Modal";
import { Field, Input, Select } from "@/components/common/Input";

const tipoEntrevistaLabel: Record<string, string> = {
  rh: "RH", tecnica: "Técnica", cultural: "Cultural", gestor: "Gestor", final: "Final",
};
const statusEntrevistaLabel: Record<string, string> = {
  agendada: "Agendada", realizada: "Realizada", cancelada: "Cancelada", remarcada: "Remarcada",
};
const statusColor: Record<string, any> = {
  agendada: "info", realizada: "success", cancelada: "danger", remarcada: "warning",
};

function addMonths(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function buildMonth(ref: Date) {
  const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  const days: { date: Date; currentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ date: d, currentMonth: d.getMonth() === ref.getMonth() });
  }
  return days;
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function EntrevistasPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refDate, setRefDate] = useState(new Date());
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [modalNova, setModalNova] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ candidato_id: "", candidato_nome: "", entrevistador: "", data: "", horario: "", tipo: "rh" });

  const dias = useMemo(() => buildMonth(refDate), [refDate]);

  useEffect(() => {
    Promise.all([listEntrevistas(), listCandidatos()])
      .then(([e, c]) => { setEntrevistas(e); setCandidatos(c); })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const responsaveis = useMemo(
    () => Array.from(new Set(entrevistas.map((e) => e.entrevistador))).sort(),
    [entrevistas],
  );

  const filtradas = useMemo(() => {
    let list = [...entrevistas];
    if (filtroStatus !== "todos") list = list.filter((e) => e.status === filtroStatus);
    if (filtroResponsavel !== "todos") list = list.filter((e) => e.entrevistador === filtroResponsavel);
    return list.sort((a, b) => a.data.localeCompare(b.data));
  }, [entrevistas, filtroStatus, filtroResponsavel]);

  const entrevistasPorDia = useMemo(() => {
    const map = new Map<string, number>();
    entrevistas.forEach((e) => map.set(e.data, (map.get(e.data) || 0) + 1));
    return map;
  }, [entrevistas]);

  const entrevistasDoDia = useMemo(
    () => diaSelecionado ? entrevistas.filter((e) => e.data === diaSelecionado) : [],
    [diaSelecionado, entrevistas],
  );

  const setForm_ = (campo: string) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = ev.target.value;
    if (campo === "candidato_id") {
      const c = candidatos.find((c) => c.id === val);
      setForm((f) => ({ ...f, candidato_id: val, candidato_nome: c?.nome ?? "" }));
    } else {
      setForm((f) => ({ ...f, [campo]: val }));
    }
  };

  async function handleSalvarNova() {
    if (!form.candidato_id || !form.entrevistador || !form.data || !form.horario) return;
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
      setEntrevistas(lista);
      setForm({ candidato_id: "", candidato_nome: "", entrevistador: "", data: "", horario: "", tipo: "rh" });
      setModalNova(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="tm-page">
        <h1 className="tm-page-title">Entrevistas</h1>
        <div className="tm-flex tm-flex-col tm-gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={48} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Entrevistas</h1>
          <p className="tm-page-subtitle">{filtradas.length} entrevista{filtradas.length !== 1 ? "s" : ""} registrada{filtradas.length !== 1 ? "s" : ""}.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModalNova(true)}>Nova entrevista</Button>
      </div>

      <div className="tm-card tm-card-pad" style={{ marginBottom: 16 }}>
        <div className="tm-flex tm-gap-3" style={{ flexWrap: "wrap" }}>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ width: 180 }}>
            <option value="todos">Todos os status</option>
            {Object.entries(statusEntrevistaLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)} style={{ width: 200 }}>
            <option value="todos">Todos os responsáveis</option>
            {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
      </div>

      <div className="tm-grid-interview">
        <div className="tm-table-wrap">
          <table className="tm-table">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Entrevistador</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Tipo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.candidato_nome}</strong></td>
                  <td>{e.entrevistador}</td>
                  <td>{formatarData(e.data + "T00:00:00")}</td>
                  <td><span className="tm-flex tm-items-center tm-gap-2"><Clock size={12} />{e.horario}</span></td>
                  <td><Badge variant="outline">{tipoEntrevistaLabel[e.tipo] ?? e.tipo}</Badge></td>
                  <td><Badge variant={statusColor[e.status]} dot>{statusEntrevistaLabel[e.status] ?? e.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tm-card tm-card-pad">
          <div className="tm-flex tm-items-center tm-justify-between" style={{ marginBottom: 12 }}>
            <Button variant="ghost" iconOnly icon={<ChevronLeft size={16} />} onClick={() => setRefDate(addMonths(refDate, -1))} />
            <strong style={{ textTransform: "capitalize" }}>
              {refDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </strong>
            <Button variant="ghost" iconOnly icon={<ChevronRight size={16} />} onClick={() => setRefDate(addMonths(refDate, 1))} />
          </div>
          <div className="tm-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 12 }}>
            {["D","S","T","Q","Q","S","S"].map((d, i) => (
              <div key={i} className="tm-muted" style={{ textAlign: "center", fontWeight: 600, padding: "4px 0" }}>{d}</div>
            ))}
            {dias.map((d, i) => {
              const isoStr = d.date.toISOString().slice(0, 10);
              const count = entrevistasPorDia.get(isoStr) || 0;
              const isToday = isoStr === new Date().toISOString().slice(0, 10);
              const isSel = diaSelecionado === isoStr;
              return (
                <div
                  key={i}
                  onClick={() => count > 0 && setDiaSelecionado(isSel ? null : isoStr)}
                  style={{
                    aspectRatio: "1/1", display: "grid", placeItems: "center", borderRadius: 6, fontSize: 12,
                    color: d.currentMonth ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                    background: isToday ? "var(--color-primary)" : isSel ? "var(--color-primary-soft)" : count ? "var(--color-primary-soft)" : "transparent",
                    fontWeight: count || isToday ? 600 : 400, position: "relative",
                    cursor: count > 0 ? "pointer" : "default",
                    outline: isSel ? "2px solid var(--color-primary)" : undefined,
                  }}
                >
                  <span style={{ color: isToday ? "white" : undefined }}>{d.date.getDate()}</span>
                  {count > 0 && !isToday && (
                    <span style={{ position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: 999, background: "var(--color-primary)" }} />
                  )}
                </div>
              );
            })}
          </div>
          {diaSelecionado && entrevistasDoDia.length > 0 && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
              <div className="tm-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                {new Date(diaSelecionado + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              {entrevistasDoDia.map((e) => (
                <div key={e.id} style={{ marginBottom: 6, fontSize: 13 }}>
                  <strong>{e.candidato_nome}</strong>
                  <span className="tm-muted"> · {e.horario} · {tipoEntrevistaLabel[e.tipo] ?? e.tipo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        aberto={modalNova}
        titulo="Nova entrevista"
        onFechar={() => setModalNova(false)}
        acoes={
          <>
            <Button variant="secondary" onClick={() => setModalNova(false)} disabled={salvando}>Cancelar</Button>
            <Button onClick={handleSalvarNova} disabled={salvando || !form.candidato_id || !form.entrevistador || !form.data || !form.horario}>
              {salvando ? "Salvando…" : "Agendar"}
            </Button>
          </>
        }
      >
        <div className="tm-flex tm-flex-col tm-gap-3">
          <Field label="Candidato *">
            <Select value={form.candidato_id} onChange={setForm_("candidato_id")}>
              <option value="">Selecione um candidato</option>
              {candidatos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </Field>
          <Field label="Entrevistador *"><Input value={form.entrevistador} onChange={setForm_("entrevistador")} placeholder="Nome do entrevistador" /></Field>
          <Field label="Data *"><Input type="date" value={form.data} onChange={setForm_("data")} /></Field>
          <Field label="Horário *"><Input type="time" value={form.horario} onChange={setForm_("horario")} /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={setForm_("tipo")}>
              {Object.entries(tipoEntrevistaLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
