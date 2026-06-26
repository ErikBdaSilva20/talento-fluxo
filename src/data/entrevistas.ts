import type { Entrevista } from "@/types";
import { candidatos } from "./candidatos";

const entrevistadores = ["Mariana Souza","Ricardo Almeida","Paula Carvalho","Bruno Tavares","Felipe Andrade (Tech Lead)","Roberta Lima (Gerente)"];
const tipos = ["rh","tecnica","cultural","gestor","final"] as const;
const statuses = ["agendada","realizada","cancelada","remarcada"] as const;

function dateOffsetIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const entrevistas: Entrevista[] = candidatos.slice(0, 14).map((c, i) => ({
  id: `ent-${i + 1}`,
  candidatoId: c.id,
  candidatoNome: c.nome,
  entrevistador: entrevistadores[i % entrevistadores.length],
  data: dateOffsetIso(i - 5),
  horario: ["09:00","10:30","11:00","14:00","15:30","16:00","17:00"][i % 7],
  tipo: tipos[i % tipos.length],
  status: i < 5 ? "realizada" : i === 5 ? "cancelada" : i === 6 ? "remarcada" : "agendada",
}));

export const tipoEntrevistaLabel: Record<string, string> = {
  rh: "RH",
  tecnica: "Técnica",
  cultural: "Cultural",
  gestor: "Gestor",
  final: "Final",
};

export const statusEntrevistaLabel: Record<string, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  remarcada: "Remarcada",
};
