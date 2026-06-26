import { createFileRoute } from "@tanstack/react-router";
import { Users, CalendarDays, Briefcase, UserCheck, UserPlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { dashboard } from "@/data/dashboard";
import { StatsCard } from "@/components/ui/StatsCard";
import { Timeline } from "@/components/ui/Timeline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Talent Manager" },
      { name: "description", content: "Visão geral de candidatos, entrevistas e contratações." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const d = dashboard;
  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Dashboard</h1>
          <p className="tm-page-subtitle">Visão geral dos seus processos seletivos.</p>
        </div>
      </div>

      <div className="tm-grid-stats" style={{ marginBottom: 24 }}>
        <StatsCard label="Total de candidatos" valor={d.totalCandidatos} icone={<Users size={18} />} delta={{ valor: "+12% vs. mês anterior", positivo: true }} />
        <StatsCard label="Entrevistas agendadas" valor={d.entrevistasAgendadas} icone={<CalendarDays size={18} />} acentoCor="var(--color-info)" delta={{ valor: "3 esta semana", positivo: true }} />
        <StatsCard label="Em processo" valor={d.emProcesso} icone={<Briefcase size={18} />} acentoCor="var(--color-warning)" />
        <StatsCard label="Contratações no mês" valor={d.contratacoesMes} icone={<UserCheck size={18} />} acentoCor="var(--color-success)" delta={{ valor: "+2 vs. mês anterior", positivo: true }} />
        <StatsCard label="Novos candidatos" valor={d.novosCandidatos} icone={<UserPlus size={18} />} acentoCor="var(--color-info)" />
      </div>

      <div className="tm-grid-2" style={{ marginBottom: 24 }}>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Distribuição por etapa</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.distribuicaoEtapa}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="etapa" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
              <Bar dataKey="quantidade" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Contratações por mês</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={d.contratacoesPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
              <Line type="monotone" dataKey="quantidade" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-primary)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tm-card tm-card-pad">
        <h3 className="tm-h2" style={{ marginBottom: 12 }}>Atividades recentes</h3>
        <Timeline eventos={d.atividadesRecentes} />
      </div>
    </div>
  );
}
