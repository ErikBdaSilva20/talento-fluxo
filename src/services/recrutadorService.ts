import { recrutadores } from "@/data/recrutadores";
import type { Recrutador } from "@/types";

export const recrutadorService = {
  async listar(): Promise<Recrutador[]> { return Promise.resolve(recrutadores); },
  async criar(_dados: Partial<Recrutador>): Promise<void> { return Promise.resolve(); },
  async atualizar(_id: string, _dados: Partial<Recrutador>): Promise<void> { return Promise.resolve(); },
  async remover(_id: string): Promise<void> { return Promise.resolve(); },
};
