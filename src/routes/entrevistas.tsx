import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
import { listEntrevistas, updateEntrevista, type Entrevista } from "@/lib/data/entrevistas.repo";
import { listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { AddEntrevistaModal } from "@/components/common/AddEntrevistaModal";
import { Select } from "@/components/common/Input";

const tipoEntrevistaLabel: Record<string, string> = {
  rh: "RH", tecnica: "Técnica", cultural: "Cultural", gestor: "Gestor", final: "Final",
};
const statusEntrevistaLabel: Record<string, string> = {
  agendada: "Agendada", aprovado: "Aprovado", reprovado: "Reprovado", adiado: "Adiado",
};
const statusColor: Record<string, any> = {
  agendada: "info", aprovado: "success", reprovado: "danger", adiado: "warning",
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

function AcaoPopover({ id, onAtualizar }: { id: string; onAtualizar: () => Promise<void> }) {
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  function abrir() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 6, left: rect.left });
    setAberto(true);
  }

  async function acao(status: string) {
    setLoading(status);
    try {
      await updateEntrevista(id, { status });
      await onAtualizar();
      setAberto(false);
    } finally {
      setLoading(null);
    }
  }

  const opcoes = [
    { status: "aprovado", label: "Aprovado", icon: <CheckCircle2 size={14} />, cor: "var(--color-success)" },
    { status: "reprovado", label: "Reprovado", icon: <XCircle size={14} />, cor: "var(--color-destructive)" },
    { status: "adiado", label: "Adiar", icon: <Clock size={14} />, cor: "var(--color-warning)" },
  ];

  return (
    <>
      <button
        ref={btnRef}
        onClick={abrir}
        title="Ações"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: 6, border: "1px solid var(--color-border)",
          background: "var(--color-card)", cursor: "pointer", color: "var(--color-muted-foreground)",
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      {aberto && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setAberto(false)} />
          <div style={{
            position: "fixed", top: pos.top, left: pos.left, zIndex: 50,
            background: "var(--color-card)", border: "1px solid var(--color-border)",
            borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.14)",
            padding: 6, display: "flex", flexDirection: "column", gap: 2, minWidth: 140,
          }}>
            {opcoes.map((o) => (
              <button
                key={o.status}
                disabled={loading !== null}
                onClick={() => acao(o.status)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 7, border: "none",
                  background: loading === o.status ? o.cor + "22" : "transparent",
                  color: o.cor, cursor: "pointer", fontSize: 13, fontWeight: 500,
                  opacity: loading !== null && loading !== o.status ? 0.45 : 1,
                  textAlign: "left",
                }}
              >
                {loading === o.status ? <Clock size={14} style={{ animation: "spin 1s linear infinite" }} /> : o.icon}
                {loading === o.status ? "Salvando…" : o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
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
                <th>Ação</th>
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
                  <td>
                    {e.status === "agendada" ? (
                      <AcaoPopover
                        id={e.id}
                        onAtualizar={async () => setEntrevistas(await listEntrevistas())}
                      />
                    ) : (
                      <span className="tm-muted" style={{ fontSize: 12 }}>—</span>
                    )}
                  </td>
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

      <AddEntrevistaModal
        aberto={modalNova}
        onFechar={() => setModalNova(false)}
        onCriada={setEntrevistas}
        candidatos={candidatos}
      />
    </div>
  );
}
