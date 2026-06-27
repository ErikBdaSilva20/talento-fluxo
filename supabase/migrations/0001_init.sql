-- user table: id TEXT (Better-Auth usa text ids)
CREATE TABLE IF NOT EXISTS "user" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text unique not null,
  password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- candidatos (colunas batem com types.gen.ts)
CREATE TABLE IF NOT EXISTS candidatos (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references "user"(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  cargo_pretendido text,
  senioridade text,
  cidade text,
  estado text,
  linkedin text,
  github text,
  portfolio text,
  pretensao_salarial numeric,
  status text not null default 'novo',
  recrutador_nome text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- entrevistas (colunas batem com types.gen.ts: candidato_nome denormalizado, sem FK recrutador)
CREATE TABLE IF NOT EXISTS entrevistas (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references "user"(id) on delete cascade,
  candidato_id uuid not null references candidatos(id) on delete cascade,
  candidato_nome text not null,
  entrevistador text not null,
  data text not null,
  horario text not null,
  tipo text not null default 'rh',
  status text not null default 'agendada',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- avaliacoes (colunas batem com types.gen.ts: liga direto em candidato, sem entrevista_id)
CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references "user"(id) on delete cascade,
  candidato_id uuid not null references candidatos(id) on delete cascade,
  candidato_nome text not null,
  avaliador text not null,
  nota numeric not null,
  comentario text,
  data text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- recrutadores (colunas batem com types.gen.ts: cargo, não departamento)
CREATE TABLE IF NOT EXISTS recrutadores (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references "user"(id) on delete cascade,
  nome text not null,
  cargo text,
  email text not null,
  telefone text,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- pipeline_stages (lookup table: sem owner_id, sem timestamps — bate com types.gen.ts)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cor text,
  ordem integer not null default 0
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_candidatos_owner ON candidatos(owner_id);
CREATE INDEX IF NOT EXISTS idx_entrevistas_owner ON entrevistas(owner_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_owner ON avaliacoes(owner_id);
CREATE INDEX IF NOT EXISTS idx_recrutadores_owner ON recrutadores(owner_id);

-- Seed pipeline stages
INSERT INTO pipeline_stages (nome, cor, ordem) VALUES
  ('Triagem',           '#6366f1', 1),
  ('Entrevista RH',     '#f59e0b', 2),
  ('Entrevista Técnica','#3b82f6', 3),
  ('Proposta',          '#10b981', 4),
  ('Contratado',        '#22c55e', 5),
  ('Reprovado',         '#ef4444', 6);
