import type { Candidato, StatusCandidato, Senioridade } from "@/types";

const nomes = [
  "Ana Beatriz Lima","Carlos Eduardo Pereira","Juliana Martins","Felipe Oliveira","Rafaela Costa",
  "Diego Santos","Mariana Ribeiro","Lucas Almeida","Camila Fernandes","Thiago Barbosa",
  "Patrícia Gomes","Gustavo Henrique","Larissa Souza","Renato Cardoso","Beatriz Nogueira",
  "Pedro Henrique Alves","Letícia Moreira","Vinícius Rocha","Tatiane Lopes","Rodrigo Mendes",
  "Sofia Carvalho","Eduardo Pinto","Natália Vieira","Marcos Antônio","Vanessa Dias",
];

const cargos = [
  "Desenvolvedor Front-End","Desenvolvedor Back-End","Engenheiro de Software","Product Designer",
  "Product Manager","Analista de Dados","Engenheiro de Dados","DevOps","Cientista de Dados",
  "QA Engineer","UX Designer","Tech Lead","Engenheiro Mobile","Scrum Master",
];

const cidades = [
  ["São Paulo","SP"],["Rio de Janeiro","RJ"],["Belo Horizonte","MG"],["Curitiba","PR"],
  ["Porto Alegre","RS"],["Florianópolis","SC"],["Recife","PE"],["Fortaleza","CE"],
  ["Brasília","DF"],["Salvador","BA"],
];

const senioridades: Senioridade[] = ["estagiario","junior","pleno","senior","especialista"];
const statuses: StatusCandidato[] = [
  "novo","triagem","primeiro_contato","entrevista_rh","entrevista_tecnica","proposta","contratado","arquivado",
];
const recrutadores = ["Mariana Souza","Ricardo Almeida","Paula Carvalho","Bruno Tavares","Camila Ribeiro"];
const skillsPool = ["React","TypeScript","Node.js","Python","Java","Go","Kotlin","Swift","AWS","Docker","Kubernetes","PostgreSQL","MongoDB","Redis","GraphQL","REST","Next.js","Vue","Angular","Figma"];

function pick<T>(arr: T[], n: number): T[] {
  const copy = [...arr].sort(() => Math.random() - 0.5);
  return copy.slice(0, n);
}

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seedRand(42);
const r = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const ri = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

function fotoUrl(seed: string) {
  return `https://i.pravatar.cc/120?u=${encodeURIComponent(seed)}`;
}

function daysAgoIso(d: number) {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString();
}

export const candidatos: Candidato[] = nomes.map((nome, i) => {
  const [cidade, estado] = r(cidades);
  const status = r(statuses);
  const cargo = r(cargos);
  const senioridade = r(senioridades);
  const skills = pick(skillsPool, ri(4, 8));
  const recrutador = r(recrutadores);
  const id = `c${i + 1}`;
  const primeiro = nome.split(" ")[0].toLowerCase();
  return {
    id,
    foto: fotoUrl(nome),
    nome,
    cargoPretendido: cargo,
    email: `${primeiro}.${nome.split(" ").slice(-1)[0].toLowerCase()}@email.com`,
    telefone: `(11) 9${ri(1000,9999)}-${ri(1000,9999)}`,
    cidade,
    estado,
    linkedin: `linkedin.com/in/${primeiro}-${i}`,
    github: i % 2 === 0 ? `github.com/${primeiro}${i}` : undefined,
    portfolio: i % 3 === 0 ? `${primeiro}.dev` : undefined,
    senioridade,
    pretensaoSalarial: ri(35, 220) * 100,
    status,
    recrutadorResponsavel: recrutador,
    atualizadoEm: daysAgoIso(ri(0, 30)),
    criadoEm: daysAgoIso(ri(30, 365)),
    skills,
    idiomas: [
      { idioma: "Português", nivel: "nativo" },
      { idioma: "Inglês", nivel: r(["intermediario","avancado","fluente"] as const) },
      ...(i % 4 === 0 ? [{ idioma: "Espanhol" as const, nivel: "intermediario" as const }] : []),
    ],
    experiencias: [
      { id: `e${i}-1`, cargo: `${cargo} ${senioridade === "senior" ? "Sênior" : ""}`.trim(), empresa: r(["Nubank","iFood","Mercado Livre","Stone","Loft","Movile","Globo","Itaú","Magalu"]), inicio: "2022-03", fim: null, descricao: "Atuação em projetos de alta complexidade, liderança de iniciativas técnicas e mentoria do time." },
      { id: `e${i}-2`, cargo: "Desenvolvedor", empresa: r(["Locaweb","TOTVS","Resultados Digitais","CI&T","Tivit"]), inicio: "2019-01", fim: "2022-02", descricao: "Desenvolvimento de produtos digitais e manutenção de sistemas legados." },
    ],
    formacoes: [
      { id: `f${i}-1`, curso: r(["Ciência da Computação","Engenharia de Software","Sistemas de Informação","Análise e Desenvolvimento de Sistemas"]), instituicao: r(["USP","UNICAMP","UFRJ","PUC-SP","UFMG","UFPR","Mackenzie"]), tipo: "graduacao", inicio: "2014", fim: "2018" },
      ...(i % 3 === 0 ? [{ id: `f${i}-2`, curso: "MBA em Gestão de Projetos", instituicao: "FGV", tipo: "pos" as const, inicio: "2020", fim: "2022" }] : []),
    ],
    certificacoes: i % 2 === 0
      ? [
          { nome: "AWS Cloud Practitioner", emissor: "Amazon Web Services", data: "2023-05" },
          { nome: "Scrum Foundation", emissor: "Certiprof", data: "2022-08" },
        ]
      : [{ nome: "Google Cloud Associate", emissor: "Google", data: "2023-11" }],
    observacoes: "Candidato com excelente comunicação, demonstrou bom alinhamento cultural durante a triagem inicial. Disponibilidade para início imediato.",
    timeline: [
      { id: `t${i}-1`, tipo: "criacao", titulo: "Candidato cadastrado", autor: recrutador, data: daysAgoIso(ri(60, 180)) },
      { id: `t${i}-2`, tipo: "mudanca_status", titulo: "Movido para Triagem", autor: recrutador, data: daysAgoIso(ri(20, 50)) },
      { id: `t${i}-3`, tipo: "entrevista", titulo: "Entrevista de RH realizada", descricao: "Conversa inicial com Mariana Souza, duração de 45 min.", autor: "Mariana Souza", data: daysAgoIso(ri(10, 20)) },
      { id: `t${i}-4`, tipo: "avaliacao", titulo: "Avaliação técnica registrada", descricao: "Nota 4.5/5 — boa fundamentação técnica.", autor: r(recrutadores), data: daysAgoIso(ri(2, 8)) },
      { id: `t${i}-5`, tipo: "nota", titulo: "Observação adicionada", descricao: "Disponibilidade para início imediato.", autor: recrutador, data: daysAgoIso(ri(0, 2)) },
    ],
    documentos: [
      { id: `d${i}-1`, nome: "Curriculo.pdf", tipo: "PDF", tamanho: "248 KB", adicionadoEm: daysAgoIso(ri(20, 60)) },
      { id: `d${i}-2`, nome: "Portfolio.pdf", tipo: "PDF", tamanho: "1.2 MB", adicionadoEm: daysAgoIso(ri(10, 40)) },
      ...(i % 2 === 0 ? [{ id: `d${i}-3`, nome: "Certificado_AWS.pdf", tipo: "PDF", tamanho: "180 KB", adicionadoEm: daysAgoIso(ri(5, 20)) }] : []),
    ],
    tags: pick(["Remoto","Inglês","Disponível","Indicação","Pleno","Sênior"], ri(1, 3)),
  };
});
