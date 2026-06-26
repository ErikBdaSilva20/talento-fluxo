import type { DashboardData } from "@/types";
import { candidatos } from "./candidatos";
import { pipelineStages, statusLabel } from "./pipeline";

const distribuicao = pipelineStages.map((s) => ({
  etapa: statusLabel[s.id],
  quantidade: candidatos.filter((c) => c.status === s.id).length,
}));

const skillCount = new Map<string, number>();
candidatos.forEach((c) => c.skills.forEach((s) => skillCount.set(s, (skillCount.get(s) || 0) + 1)));
const topSkills = Array.from(skillCount.entries())
  .map(([skill, quantidade]) => ({ skill, quantidade }))
  .sort((a, b) => b.quantidade - a.quantidade)
  .slice(0, 8);

const senioridade = ["estagiario", "junior", "pleno", "senior", "especialista"].map((nivel) => ({
  nivel,
  quantidade: candidatos.filter((c) => c.senioridade === nivel).length,
}));

const atividadesRecentes = candidatos
  .flatMap((c) => c.timeline.map((t) => ({ ...t, titulo: `${c.nome} — ${t.titulo}` })))
  .sort((a, b) => b.data.localeCompare(a.data))
  .slice(0, 12);

export const dashboard: DashboardData = {
  totalCandidatos: candidatos.length,
  entrevistasAgendadas: 8,
  emProcesso: candidatos.filter((c) => !["contratado", "arquivado", "novo"].includes(c.status)).length,
  contratacoesMes: candidatos.filter((c) => c.status === "contratado").length,
  novosCandidatos: candidatos.filter((c) => c.status === "novo").length,
  distribuicaoEtapa: distribuicao,
  atividadesRecentes,
  contratacoesPorMes: [
    { mes: "Jan", quantidade: 3 },
    { mes: "Fev", quantidade: 4 },
    { mes: "Mar", quantidade: 6 },
    { mes: "Abr", quantidade: 5 },
    { mes: "Mai", quantidade: 8 },
    { mes: "Jun", quantidade: 7 },
  ],
  entrevistasPorMes: [
    { mes: "Jan", quantidade: 12 },
    { mes: "Fev", quantidade: 18 },
    { mes: "Mar", quantidade: 22 },
    { mes: "Abr", quantidade: 27 },
    { mes: "Mai", quantidade: 31 },
    { mes: "Jun", quantidade: 24 },
  ],
  senioridade,
  topSkills,
};
