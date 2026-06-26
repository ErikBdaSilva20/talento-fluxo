-- Trigger de updated_at (reutilizado por todas as tabelas)
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Candidatos (tabela principal do ATS)
create table if not exists candidatos (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            text not null references "user"(id) on delete cascade,
  nome                text not null,
  email               text not null,
  telefone            text,
  cargo_pretendido    text,
  senioridade         text,
  cidade              text,
  estado              text,
  linkedin            text,
  github              text,
  portfolio           text,
  pretensao_salarial  numeric,
  status              text not null default 'novo',
  recrutador_nome     text,
  observacoes         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_candidatos_owner on candidatos(owner_id);
create trigger tg_candidatos_updated
  before update on candidatos
  for each row execute procedure touch_updated_at();

-- Entrevistas (tabela-filha — owner_id obrigatório, §B4.1)
create table if not exists entrevistas (
  id               uuid primary key default gen_random_uuid(),
  owner_id         text not null references "user"(id) on delete cascade,
  candidato_id     uuid not null references candidatos(id) on delete cascade,
  candidato_nome   text not null,
  entrevistador    text not null,
  data             date not null,
  horario          text not null,
  tipo             text not null,
  status           text not null default 'agendada',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_entrevistas_owner on entrevistas(owner_id);
create trigger tg_entrevistas_updated
  before update on entrevistas
  for each row execute procedure touch_updated_at();

-- Avaliações (tabela-filha — owner_id obrigatório, §B4.1)
create table if not exists avaliacoes (
  id               uuid primary key default gen_random_uuid(),
  owner_id         text not null references "user"(id) on delete cascade,
  candidato_id     uuid not null references candidatos(id) on delete cascade,
  candidato_nome   text not null,
  avaliador        text not null,
  nota             numeric not null check (nota >= 0 and nota <= 5),
  comentario       text,
  data             date not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_avaliacoes_owner on avaliacoes(owner_id);
create trigger tg_avaliacoes_updated
  before update on avaliacoes
  for each row execute procedure touch_updated_at();

-- Recrutadores (tabela escrita pelo rep — owner_id obrigatório, §B4.1)
create table if not exists recrutadores (
  id         uuid primary key default gen_random_uuid(),
  owner_id   text not null references "user"(id) on delete cascade,
  nome       text not null,
  cargo      text,
  email      text not null,
  telefone   text,
  status     text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_recrutadores_owner on recrutadores(owner_id);
create trigger tg_recrutadores_updated
  before update on recrutadores
  for each row execute procedure touch_updated_at();

-- Pipeline stages (lookup — sem owner_id, read-only para rep, §B4)
create table if not exists pipeline_stages (
  id     text primary key,
  nome   text not null,
  cor    text,
  ordem  int not null
);
insert into pipeline_stages (id, nome, cor, ordem) values
  ('novo',               'Novo',               '#6366f1', 1),
  ('triagem',            'Triagem',            '#8b5cf6', 2),
  ('primeiro_contato',   'Primeiro Contato',   '#0ea5e9', 3),
  ('entrevista_rh',      'Entrevista RH',      '#f59e0b', 4),
  ('entrevista_tecnica', 'Entrevista Técnica', '#f97316', 5),
  ('proposta',           'Proposta',           '#10b981', 6),
  ('contratado',         'Contratado',         '#22c55e', 7),
  ('arquivado',          'Arquivado',          '#6b7280', 8)
on conflict (id) do nothing;
