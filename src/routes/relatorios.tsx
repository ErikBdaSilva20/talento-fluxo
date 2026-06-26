import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { dashboard } from "@/data/dashboard";
import { senioridadeLabel } from "@/data/pipeline";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Talent Manager" },
      { name: "description", content: "Análise visual dos processos seletivos." },
    ],
  }),
  component: RelatoriosPage,
});

const cores = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899"];

function RelatoriosPage() {
  const d = dashboard;
  const senData = d.senioridade.map((s) => ({ ...s, nivel: senioridadeLabel[s.nivel] }));
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
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={d.distribuicaoEtapa}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="etapa" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} interval={0} angle={-25} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
              <Bar dataKey="quantidade" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Contratações por mês</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={d.contratacoesPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
              <Line type="monotone" dataKey="quantidade" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tm-grid-2" style={{ marginBottom: 16 }}>
        <div className="tm-card tm-card-pad">
          <h3 className="tm-h2" style={{ marginBottom: 12 }}>Entrevistas realizadas</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={d.entrevistasPorMes}>
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
              <Pie data={senData} dataKey="quantidade" nameKey="nivel" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {senData.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tm-card tm-card-pad">
        <h3 className="tm-h2" style={{ marginBottom: 12 }}>Skills mais frequentes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={d.topSkills} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <YAxis type="category" dataKey="skill" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} width={90} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
            <Bar dataKey="quantidade" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
