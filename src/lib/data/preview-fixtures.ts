// src/lib/data/preview-fixtures.ts — PROTEGIDO
import {
  candidatosMock,
  entrevistasMock,
  avaliacoesMock,
  recrutadoresMock,
} from "../../mock/fixtures";

const fixtures: Record<string, unknown[]> = {
  candidatos: candidatosMock,
  entrevistas: entrevistasMock,
  avaliacoes: avaliacoesMock,
  recrutadores: recrutadoresMock,
  pipeline_stages: [
    { id: "novo", nome: "Novo", cor: "#6366f1", ordem: 1 },
    { id: "triagem", nome: "Triagem", cor: "#8b5cf6", ordem: 2 },
    { id: "primeiro_contato", nome: "Primeiro Contato", cor: "#0ea5e9", ordem: 3 },
    { id: "entrevista_rh", nome: "Entrevista RH", cor: "#f59e0b", ordem: 4 },
    { id: "entrevista_tecnica", nome: "Entrevista Técnica", cor: "#f97316", ordem: 5 },
    { id: "proposta", nome: "Proposta", cor: "#10b981", ordem: 6 },
    { id: "contratado", nome: "Contratado", cor: "#22c55e", ordem: 7 },
    { id: "arquivado", nome: "Arquivado", cor: "#6b7280", ordem: 8 },
  ],
};

// Simula mutações em memória (create/update/delete) para o modo preview
const state: Record<string, unknown[]> = JSON.parse(JSON.stringify(fixtures));

export function getFixture(method: string, path: string): unknown {
  const match = path.match(/^\/data\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) return null;
  const [, table, id] = match;

  if (method === "GET") return state[table] ?? [];

  if (method === "POST") {
    const newItem = { id: crypto.randomUUID(), owner_id: "u1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    state[table] = [...(state[table] ?? []), newItem];
    return newItem;
  }

  if (method === "PATCH" && id) {
    const items = (state[table] ?? []) as Record<string, unknown>[];
    const idx = items.findIndex((r) => r["id"] === id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], updated_at: new Date().toISOString() };
      state[table] = items;
      return items[idx];
    }
    return {};
  }

  if (method === "DELETE" && id) {
    state[table] = ((state[table] ?? []) as Record<string, unknown>[]).filter((r) => r["id"] !== id);
    return undefined;
  }

  return null;
}
