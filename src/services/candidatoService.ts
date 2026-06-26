/**
 * Camada de serviço (mock).
 * Preparada para no futuro ser substituída por chamadas HTTP (fetch/axios).
 * A assinatura assíncrona simula a integração real.
 */
import { candidatos } from "@/data/candidatos";
import type { Candidato } from "@/types";

export const candidatoService = {
  async listar(): Promise<Candidato[]> {
    return Promise.resolve(candidatos);
  },
  async obter(id: string): Promise<Candidato | undefined> {
    return Promise.resolve(candidatos.find((c) => c.id === id));
  },
  async criar(_dados: Partial<Candidato>): Promise<void> {
    // mock — futura integração CRUD
    return Promise.resolve();
  },
  async atualizar(_id: string, _dados: Partial<Candidato>): Promise<void> {
    return Promise.resolve();
  },
  async remover(_id: string): Promise<void> {
    return Promise.resolve();
  },
};
