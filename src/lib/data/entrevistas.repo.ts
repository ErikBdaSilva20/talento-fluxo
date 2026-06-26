import { db } from "./client";
import type { Database } from "./types.gen";

export type Entrevista = Database["public"]["Tables"]["entrevistas"]["Row"];

export const listEntrevistas = () => db.table<Entrevista>("entrevistas").list();
export const createEntrevista = (input: Partial<Entrevista>) =>
  db.table<Entrevista>("entrevistas").create(input);
export const updateEntrevista = (id: string, p: Partial<Entrevista>) =>
  db.table<Entrevista>("entrevistas").update(id, p);
export const deleteEntrevista = (id: string) => db.table<Entrevista>("entrevistas").remove(id);
