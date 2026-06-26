import { entrevistas } from "@/data/entrevistas";
import type { Entrevista } from "@/types";

export const entrevistaService = {
  async listar(): Promise<Entrevista[]> { return Promise.resolve(entrevistas); },
  async criar(_dados: Partial<Entrevista>): Promise<void> { return Promise.resolve(); },
  async atualizar(_id: string, _dados: Partial<Entrevista>): Promise<void> { return Promise.resolve(); },
  async remover(_id: string): Promise<void> { return Promise.resolve(); },
};
