import type { PipelineStage } from "@/types";

export const pipelineStages: PipelineStage[] = [
  { id: "novo", nome: "Novo", cor: "neutral", ordem: 1 },
  { id: "triagem", nome: "Triagem", cor: "info", ordem: 2 },
  { id: "primeiro_contato", nome: "Primeiro Contato", cor: "info", ordem: 3 },
  { id: "entrevista_rh", nome: "Entrevista RH", cor: "warning", ordem: 4 },
  { id: "entrevista_tecnica", nome: "Entrevista Técnica", cor: "warning", ordem: 5 },
  { id: "proposta", nome: "Proposta", cor: "primary", ordem: 6 },
  { id: "contratado", nome: "Contratado", cor: "success", ordem: 7 },
  { id: "arquivado", nome: "Arquivado", cor: "danger", ordem: 8 },
];

export const statusLabel: Record<string, string> = {
  novo: "Novo",
  triagem: "Triagem",
  primeiro_contato: "Primeiro Contato",
  entrevista_rh: "Entrevista RH",
  entrevista_tecnica: "Entrevista Técnica",
  proposta: "Proposta",
  contratado: "Contratado",
  arquivado: "Arquivado",
};

export const statusVariant: Record<string, string> = {
  novo: "neutral",
  triagem: "info",
  primeiro_contato: "info",
  entrevista_rh: "warning",
  entrevista_tecnica: "warning",
  proposta: "primary",
  contratado: "success",
  arquivado: "danger",
};

export const senioridadeLabel: Record<string, string> = {
  estagiario: "Estagiário",
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  especialista: "Especialista",
};
