export type StatusCandidato =
  | "novo"
  | "triagem"
  | "primeiro_contato"
  | "entrevista_rh"
  | "entrevista_tecnica"
  | "proposta"
  | "contratado"
  | "arquivado";

export type Senioridade = "estagiario" | "junior" | "pleno" | "senior" | "especialista";

export interface Experiencia {
  id: string;
  cargo: string;
  empresa: string;
  inicio: string;
  fim: string | null;
  descricao: string;
}

export interface Formacao {
  id: string;
  curso: string;
  instituicao: string;
  tipo: "graduacao" | "pos" | "tecnico" | "curso";
  inicio: string;
  fim: string | null;
}

export interface Idioma {
  idioma: string;
  nivel: "basico" | "intermediario" | "avancado" | "fluente" | "nativo";
}

export interface Certificacao {
  nome: string;
  emissor: string;
  data: string;
}

export interface TimelineEvento {
  id: string;
  tipo: "criacao" | "mudanca_status" | "entrevista" | "avaliacao" | "nota" | "documento";
  titulo: string;
  descricao?: string;
  autor: string;
  data: string; // ISO
}

export interface Avaliacao {
  id: string;
  candidatoId: string;
  candidatoNome: string;
  avaliador: string;
  nota: number; // 0-5
  comentario: string;
  data: string;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  adicionadoEm: string;
}

export interface Candidato {
  id: string;
  foto: string;
  nome: string;
  cargoPretendido: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  senioridade: Senioridade;
  pretensaoSalarial: number;
  status: StatusCandidato;
  recrutadorResponsavel: string;
  atualizadoEm: string;
  criadoEm: string;
  skills: string[];
  idiomas: Idioma[];
  experiencias: Experiencia[];
  formacoes: Formacao[];
  certificacoes: Certificacao[];
  observacoes: string;
  timeline: TimelineEvento[];
  documentos: Documento[];
  tags: string[];
}

export interface Recrutador {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  status: "ativo" | "inativo";
  foto?: string;
  candidatos: number;
}

export type TipoEntrevista = "rh" | "tecnica" | "cultural" | "gestor" | "final";
export type StatusEntrevista = "agendada" | "realizada" | "cancelada" | "remarcada";

export interface Entrevista {
  id: string;
  candidatoId: string;
  candidatoNome: string;
  entrevistador: string;
  data: string; // ISO date
  horario: string; // HH:mm
  tipo: TipoEntrevista;
  status: StatusEntrevista;
}

export interface Tag {
  id: string;
  nome: string;
  categoria: "skill" | "modalidade" | "idioma" | "nivel" | "disponibilidade" | "geral";
  cor: "primary" | "info" | "success" | "warning" | "danger" | "neutral";
  usos: number;
}

export interface PipelineStage {
  id: StatusCandidato;
  nome: string;
  cor: string;
  ordem: number;
}

export interface DashboardData {
  totalCandidatos: number;
  entrevistasAgendadas: number;
  emProcesso: number;
  contratacoesMes: number;
  novosCandidatos: number;
  distribuicaoEtapa: { etapa: string; quantidade: number }[];
  atividadesRecentes: TimelineEvento[];
  contratacoesPorMes: { mes: string; quantidade: number }[];
  entrevistasPorMes: { mes: string; quantidade: number }[];
  senioridade: { nivel: string; quantidade: number }[];
  topSkills: { skill: string; quantidade: number }[];
}
