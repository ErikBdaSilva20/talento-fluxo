import { db } from "./client";
import type { Database } from "./types.gen";

export type Recrutador = Database["public"]["Tables"]["recrutadores"]["Row"];

export const listRecrutadores = () => db.table<Recrutador>("recrutadores").list();
export const createRecrutador = (input: Partial<Recrutador>) =>
  db.table<Recrutador>("recrutadores").create(input);
export const updateRecrutador = (id: string, p: Partial<Recrutador>) =>
  db.table<Recrutador>("recrutadores").update(id, p);
export const deleteRecrutador = (id: string) => db.table<Recrutador>("recrutadores").remove(id);
