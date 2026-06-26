import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { entrevistas, tipoEntrevistaLabel, statusEntrevistaLabel } from "@/data/entrevistas";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { formatarData } from "@/utils/format";

export const Route = createFileRoute("/entrevistas")({
  head: () => ({
    meta: [
      { title: "Entrevistas — Talent Manager" },
      { name: "description", content: "Gerencie e visualize todas as entrevistas agendadas." },
    ],
  }),
  component: EntrevistasPage,
});

const statusColor: Record<string, any> = {
  agendada: "info",
  realizada: "success",
  cancelada: "danger",
  remarcada: "warning",
};

function EntrevistasPage() {
  const [refDate, setRefDate] = useState(new Date());
  const dias = useMemo(() => buildMonth(refDate), [refDate]);
  const entrevistasPorDia = useMemo(() => {
    const map = new Map<string, number>();
    entrevistas.forEach((e) => map.set(e.data, (map.get(e.data) || 0) + 1));
    return map;
  }, []);

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Entrevistas</h1>
          <p className="tm-page-subtitle">{entrevistas.length} entrevistas registradas.</p>
        </div>
        <Button icon={<Plus size={16} />}>Nova entrevista</Button>
      </div>

      <div className="tm-grid" style={{ gridTemplateColumns: "1fr 320px", gap: 16 }}>
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
              {entrevistas.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.candidatoNome}</strong></td>
                  <td>{e.entrevistador}</td>
                  <td>{formatarData(e.data + "T00:00:00")}</td>
                  <td><span className="tm-flex tm-items-center tm-gap-2"><Clock size={12} />{e.horario}</span></td>
                  <td><Badge variant="outline">{tipoEntrevistaLabel[e.tipo]}</Badge></td>
                  <td><Badge variant={statusColor[e.status]} dot>{statusEntrevistaLabel[e.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tm-card tm-card-pad" style={{ alignSelf: "flex-start" }}>
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
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1/1",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 6,
                    fontSize: 12,
                    color: d.currentMonth ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                    background: isToday ? "var(--color-primary)" : count ? "var(--color-primary-soft)" : "transparent",
                    fontWeight: count || isToday ? 600 : 400,
                    position: "relative",
                    cursor: "pointer",
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
        </div>
      </div>
    </div>
  );
}

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
