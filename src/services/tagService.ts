import { tags } from "@/data/tags";
import type { Tag } from "@/types";

export const tagService = {
  async listar(): Promise<Tag[]> { return Promise.resolve(tags); },
  async criar(_dados: Partial<Tag>): Promise<void> { return Promise.resolve(); },
  async atualizar(_id: string, _dados: Partial<Tag>): Promise<void> { return Promise.resolve(); },
  async remover(_id: string): Promise<void> { return Promise.resolve(); },
};
