// src/lib/data/types.gen.ts — PROTEGIDO (gerado do schema)
export interface Database {
  public: {
    Tables: {
      candidatos: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          email: string;
          telefone: string | null;
          cargo_pretendido: string | null;
          senioridade: string | null;
          cidade: string | null;
          estado: string | null;
          linkedin: string | null;
          github: string | null;
          portfolio: string | null;
          pretensao_salarial: number | null;
          status: string;
          recrutador_nome: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      entrevistas: {
        Row: {
          id: string;
          owner_id: string;
          candidato_id: string;
          candidato_nome: string;
          entrevistador: string;
          data: string;
          horario: string;
          tipo: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      avaliacoes: {
        Row: {
          id: string;
          owner_id: string;
          candidato_id: string;
          candidato_nome: string;
          avaliador: string;
          nota: number;
          comentario: string | null;
          data: string;
          created_at: string;
          updated_at: string;
        };
      };
      recrutadores: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          cargo: string | null;
          email: string;
          telefone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          nome: string;
          cor: string | null;
          ordem: number;
        };
      };
    };
  };
}
