import { useEffect, useMemo, useState } from "react";
import { Users, CalendarDays, Briefcase, UserCheck, UserPlus } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";
import { listEntrevistas, type Entrevista } from "@/lib/data/entrevistas.repo";
import { pipelineStages, statusLabel, senioridadeLabel } from "@/data/pipeline";
import { StatsCard } from "@/components/common/StatsCard";
import { Timeline } from "@/components/common/Timeline";
import { Skeleton } from "@/components/common/Skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TimelineEvento } from "@/types";

const tipoEntrevistaLabel: Record<string, string> = {
  rh: "RH", tecnica: "Técnica", cultural: "Cultural", gestor: "Gestor", final: "Final",
};

const MESES_BR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function isMesAtual(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function agruparPorMes(datas: string[]): { mes: string; quantidade: number }[] {
  const now = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { mes: MESES_BR[d.getMonth()], ano: d.getFullYear(), mesIdx: d.getMonth() };
  });
  return meses.map(({ mes, ano, mesIdx }) => ({
    mes,
    quantidade: datas.filter((s) => {
      const d = new Date(s);
      return d.getFullYear() === ano && d.getMonth() === mesIdx;
    }).length,
  }));
}

const ETAPA_ABREV: Record<string, string> = {
  novo: "Novo",
  triagem: "Triagem",
  primeiro_contato: "1º Contato",
  entrevista_rh: "Entrev. RH",
  entrevista_tecnica: "Entrev. Téc.",
  proposta: "Proposta",
  contratado: "Contratado",
  arquivado: "Arquivado",
};

export default function DashboardPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    Promise.all([listCandidatos(), listEntrevistas()])
      .then(([c, e]) => {
        setCandidatos(c);
        setEntrevistas(e);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const metricas = useMemo(() => {
    const contratados = candidatos.filter((c) => c.status === "contratado");
    return {
      totalCandidatos: candidatos.length,
      entrevistasAgendadas: entrevistas.filter((e) => e.status === "agendada").length,
      emProcesso: candidatos.filter((c) => !["contratado", "arquivado"].includes(c.status)).length,
      contratacoesMes: contratados.filter((c) => isMesAtual(c.updated_at)).length,
      novosCandidatos: candidatos.filter((c) => c.status === "novo").length,
      distribuicaoEtapa: pipelineStages.map((s) => ({
        etapa: statusLabel[s.id],
        etapaAbrev: ETAPA_ABREV[s.id] ?? statusLabel[s.id],
        quantidade: candidatos.filter((c) => c.status === s.id).length,
      })),
      contratacoesPorMes: agruparPorMes(contratados.map((c) => c.updated_at)),
      entrevistasPorMes: agruparPorMes(entrevistas.map((e) => e.data)),
      senioridade: Object.keys(senioridadeLabel).map((nivel) => ({
        nivel: senioridadeLabel[nivel],
        quantidade: candidatos.filter((c) => c.senioridade === nivel).length,
      })),
      atividadesRecentes: [...entrevistas]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 10)
        .map((e): TimelineEvento => ({
          id: e.id,
          tipo: "entrevista",
          titulo: `Entrevista com ${e.candidato_nome}`,
          descricao: `${tipoEntrevistaLabel[e.tipo] ?? e.tipo} · ${e.entrevistador}`,
          autor: e.entrevistador,
          data: e.created_at,
        })),
    };
  }, [candidatos, entrevistas]);

  if (carregando) {
    return (
      <div className="tm-page">
        <div className="tm-page-header">
          <div>
            <h1 className="tm-page-title">Dashboard</h1>
            <p className="tm-page-subtitle">Carregando dados…</p>
          </div>
        </div>
        <div className="tm-grid-stats" style={{ marginBottom: 24 }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={96} />)}
        </div>
        <div className="tm-grid-2">
          <Skeleton height={300} />
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Dashboard</h1>
          <p className="tm-page-subtitle">Visão geral dos seus processos seletivos.</p>
        </div>
      </div>

      <div className="tm-grid-stats" style={{ marginBottom: 24, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : undefined }}>
        <StatsCard label="Total de candidatos" valor={metricas.totalCandidatos} icone={<Users size={18} />} />
        <StatsCard label="Entrevistas agendadas" valor={metricas.entrevistasAgendadas} icone={<CalendarDays size={18} />} acentoCor="var(--color-info)" />
        <StatsCard label="Em processo" valor={metricas.emProcesso} icone={<Briefcase size={18} />} acentoCor="var(--color-warning)" />
        <StatsCard label="Contratações no mês" valor={metricas.contratacoesMes} icone={<UserCheck size={18} />} acentoCor="var(--color-success)" />
        <StatsCard label="Novos candidatos" valor={metricas.novosCandidatos} icone={<UserPlus size={18} />} acentoCor="var(--color-info)" />
      </div>

      <div className="tm-grid-2" style={{ marginBottom: 24 }}>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Distribuição por etapa</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
            <BarChart data={metricas.distribuicaoEtapa} margin={{ bottom: isMobile ? 8 : 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey={isMobile ? "etapaAbrev" : "etapa"}
                tick={{ fontSize: isMobile ? 10 : 11, fill: "var(--color-muted-foreground)" }}
                interval={0}
                angle={isMobile ? -35 : -20}
                textAnchor="end"
                height={isMobile ? 56 : 70}
              />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Bar dataKey="quantidade" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Contratações por mês</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
            <LineChart data={metricas.contratacoesPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: isMobile ? 10 : 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={28} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Line type="monotone" dataKey="quantidade" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: isMobile ? 3 : 4, fill: "var(--color-primary)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tm-card tm-card-pad">
        <h3 className="tm-h2" style={{ marginBottom: 12 }}>Atividades recentes</h3>
        {metricas.atividadesRecentes.length === 0 ? (
          <p className="tm-muted">Nenhuma atividade registrada.</p>
        ) : (
          <Timeline eventos={metricas.atividadesRecentes} />
        )}
      </div>
    </div>
  );
}
