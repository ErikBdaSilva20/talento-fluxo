import type { Avaliacao } from "@/types";
import { candidatos } from "./candidatos";

const avaliadores = ["Mariana Souza","Ricardo Almeida","Paula Carvalho","Felipe Andrade","Roberta Lima"];
const comentarios = [
  "Demonstrou domínio técnico sólido e boa comunicação durante toda a entrevista.",
  "Alinhamento cultural excelente, perfil colaborativo e pró-ativo.",
  "Boa experiência técnica, porém precisa aprofundar em arquitetura de sistemas.",
  "Excelente fit para o time. Recomendado avançar para a etapa final.",
  "Comunicação clara e exemplos concretos de projetos liderados.",
  "Apresentou dúvidas pertinentes e bom raciocínio estruturado.",
];

function daysAgoIso(d: number) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

export const avaliacoes: Avaliacao[] = candidatos.slice(0, 16).map((c, i) => ({
  id: `av-${i + 1}`,
  candidatoId: c.id,
  candidatoNome: c.nome,
  avaliador: avaliadores[i % avaliadores.length],
  nota: Number((3 + ((i * 0.37) % 2)).toFixed(1)),
  comentario: comentarios[i % comentarios.length],
  data: daysAgoIso(i * 2 + 1),
}));
