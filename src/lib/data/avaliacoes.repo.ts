import { db } from "./client";
import type { Database } from "./types.gen";

export type Avaliacao = Database["public"]["Tables"]["avaliacoes"]["Row"];

export const listAvaliacoes = () => db.table<Avaliacao>("avaliacoes").list();
export const createAvaliacao = (input: Partial<Avaliacao>) =>
  db.table<Avaliacao>("avaliacoes").create(input);
export const updateAvaliacao = (id: string, p: Partial<Avaliacao>) =>
  db.table<Avaliacao>("avaliacoes").update(id, p);
export const deleteAvaliacao = (id: string) => db.table<Avaliacao>("avaliacoes").remove(id);
