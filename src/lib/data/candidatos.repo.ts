import { db } from "./client";
import type { Database } from "./types.gen";

export type Candidato = Database["public"]["Tables"]["candidatos"]["Row"];

export const listCandidatos = () => db.table<Candidato>("candidatos").list();
export const createCandidato = (input: Partial<Candidato>) =>
  db.table<Candidato>("candidatos").create(input);
export const updateCandidato = (id: string, p: Partial<Candidato>) =>
  db.table<Candidato>("candidatos").update(id, p);
export const deleteCandidato = (id: string) => db.table<Candidato>("candidatos").remove(id);
