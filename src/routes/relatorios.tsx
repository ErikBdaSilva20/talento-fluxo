import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";
import { listEntrevistas, type Entrevista } from "@/lib/data/entrevistas.repo";
import { pipelineStages, statusLabel, senioridadeLabel } from "@/data/pipeline";
import { Skeleton } from "@/components/common/Skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const cores = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899"];
const MESES_BR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const ETAPA_ABREV: Record<string, string> = {
  novo: "Novo", triagem: "Triagem", primeiro_contato: "1º Contato",
  entrevista_rh: "Entrev. RH", entrevista_tecnica: "Entrev. Téc.",
  proposta: "Proposta", contratado: "Contratado", arquivado: "Arquivado",
};

function agruparPorMes(datas: string[]): { mes: string; quantidade: number }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      mes: MESES_BR[d.getMonth()],
      quantidade: datas.filter((s) => {
        const dt = new Date(s);
        return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
      }).length,
    };
  });
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export default function RelatoriosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    Promise.all([listCandidatos(), listEntrevistas()])
      .then(([c, e]) => { setCandidatos(c); setEntrevistas(e); })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const dados = useMemo(() => {
    const contratados = candidatos.filter((c) => c.status === "contratado");
    const distribuicaoEtapa = pipelineStages.map((s) => ({
      etapa: statusLabel[s.id],
      etapaAbrev: ETAPA_ABREV[s.id] ?? statusLabel[s.id],
      quantidade: candidatos.filter((c) => c.status === s.id).length,
    }));
    const contratacoesPorMes = agruparPorMes(contratados.map((c) => c.updated_at));
    const entrevistasPorMes = agruparPorMes(entrevistas.filter((e) => e.status === "aprovado").map((e) => e.data));
    const senioridadeGrp = groupBy(candidatos, (c) => c.senioridade ?? "desconhecido");
    const senioridadeData = Object.entries(senioridadeGrp).map(([nivel, quantidade]) => ({
      nivel: senioridadeLabel[nivel] ?? nivel, quantidade,
    }));
    const cargosGrp = groupBy(candidatos.filter((c) => c.cargo_pretendido), (c) => c.cargo_pretendido!);
    const topCargos = Object.entries(cargosGrp)
      .map(([cargo, quantidade]) => ({ cargo, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
    return { distribuicaoEtapa, contratacoesPorMes, entrevistasPorMes, senioridadeData, topCargos };
  }, [candidatos, entrevistas]);

  if (carregando) {
    return (
      <div className="tm-page">
        <h1 className="tm-page-title">Relatórios</h1>
        <div className="tm-grid-2">
          <Skeleton height={320} />
          <Skeleton height={320} />
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Relatórios</h1>
          <p className="tm-page-subtitle">Acompanhe métricas e tendências do seu funil de talentos.</p>
        </div>
      </div>

      <div className="tm-grid-2" style={{ marginBottom: 16 }}>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Candidatos por etapa</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
            <BarChart data={dados.distribuicaoEtapa} margin={{ bottom: isMobile ? 8 : 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey={isMobile ? "etapaAbrev" : "etapa"}
                tick={{ fontSize: isMobile ? 10 : 11, fill: "var(--color-muted-foreground)" }}
                interval={0}
                angle={isMobile ? -35 : -25}
                textAnchor="end"
                height={isMobile ? 56 : 80}
              />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Bar dataKey="quantidade" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Contratações por mês</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
            <LineChart data={dados.contratacoesPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: isMobile ? 10 : 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={28} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Line type="monotone" dataKey="quantidade" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: isMobile ? 3 : 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tm-grid-2" style={{ marginBottom: 16 }}>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Entrevistas aprovadas por mês</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dados.entrevistasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
              <Bar dataKey="quantidade" fill="var(--color-info)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Senioridade dos candidatos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={dados.senioridadeData} dataKey="quantidade" nameKey="nivel" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {dados.senioridadeData.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tm-card tm-card-pad">
        <h3 className="tm-h2" style={{ marginBottom: 12 }}>Distribuição de cargos pretendidos</h3>
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {dados.topCargos.map((item, i) => {
              const max = dados.topCargos[0]?.quantidade ?? 1;
              const pct = Math.round((item.quantidade / max) * 100);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                    <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{item.cargo}</span>
                    <span className="tm-muted" style={{ flexShrink: 0, marginLeft: 8 }}>{item.quantidade}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "var(--color-muted)" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: "var(--color-primary)", transition: "width .3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.topCargos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis type="category" dataKey="cargo" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} width={130} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
              <Bar dataKey="quantidade" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
