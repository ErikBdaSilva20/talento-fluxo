# Guia de Implementação — Talento Fluxo (Masia Hub)

Este documento define os épicos de implementação do template **Talento Fluxo**, seguindo rigorosamente o contrato técnico de `Importantdoc.md` do início ao fim. Cada decisão tem como fonte-da-verdade esse contrato.

> **Leia antes de executar qualquer épico:**
>
> - `Importantdoc.md` — contrato técnico completo (stack, schema, gateway, manifest).
> - `CODEBASE_CONTEXT.md` — estado atual do código e divergências mapeadas.

---

## Qualificação — Parte A de Importantdoc.md

Registro de que o domínio **Talento Fluxo (ATS)** foi avaliado contra os filtros da Parte A antes de construir:

| Critério                                               | Status       | Observação                                                                                       |
| ------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------ |
| **Licença** (§A2)                                      | ✅ N/A       | UI gerada via Lovable (propriedade interna); sem OSS terceiro sendo portado. Nenhuma restrição.  |
| **Fit com fundação** (§A3)                             | ✅ Cabe hoje | Domínio é dados + telas: candidatos, pipeline, entrevistas, avaliações. CRUD puro, sem realtime. |
| **Realtime / colaboração ao vivo**                     | ❌ Ausente   | Não há cursores, presença ou co-edição. Sem extensão de fundação necessária.                     |
| **WhatsApp / chat / voz**                              | ❌ Ausente   | Fora do escopo.                                                                                  |
| **Jobs agendados / filas**                             | ❌ Ausente   | Fora do escopo.                                                                                  |
| **Webhooks / pagamentos**                              | ❌ Ausente   | Fora do escopo.                                                                                  |
| **Processamento de arquivo / mídia**                   | ❌ Ausente   | Fora do escopo.                                                                                  |
| **Página pública sem login** (§A3 / §B6)               | ❌ Ausente   | Todas as telas exigem autenticação. Nenhuma extensão de gateway necessária.                      |
| **Joins resolvíveis plano / 2 queries** (§A checklist) | ✅ Sim       | `recrutador_nome` guardado flat no candidato; avaliações filtradas por `candidato_id` no front.  |

**Conclusão:** o domínio cabe no CRUD multi-tenant servido pelo gateway hoje. Pode ser construído sem estender a fundação.

---

### 0.1 Remover pacotes SSR e libs Lovable do `package.json` ✅ _(Mexido sozinho)_

**Problema:** o projeto usa `@tanstack/react-start` (SSR), `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/router-plugin`, `@lovable.dev/vite-tanstack-config` e `nitro`. SSR é **explicitamente proibido** (`Importantdoc.md` §B3).

**Remover das `dependencies`:**

```
@tanstack/react-router
@tanstack/react-start
@tanstack/router-plugin
@tanstack/react-query
```

**Remover das `devDependencies`:**

```
@lovable.dev/vite-tanstack-config
nitro
```

**Fixar versão do Vite** (§B3 exige **Vite 6**):

```
"vite": "^6.5.0"
```

### 0.2 Instalar dependências do contrato ✅ _(Mexido sozinho)_

```bash
pnpm add react-router-dom@7
```

Manter todas as demais dependências já presentes (Radix UI, Tailwind v4, Recharts, React Hook Form, Zod, Lucide, date-fns, etc.) — são compatíveis com o contrato.

### 0.3 Reescrever `vite.config.ts`

**Arquivo:** `vite.config.ts` (na raiz)

Substituir o conteúdo atual (que usa `@lovable.dev/vite-tanstack-config`) pelo padrão canônico do scaffold wiki:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});
```

> Este arquivo está em `protect` do manifest. Após criado, não editar.

### 0.4 Reescrever `index.html`

**Arquivo:** `index.html` (na raiz)

Mover todas as meta tags e links de fontes que estavam em `__root.tsx` para o `index.html` estático — padrão SPA Vite (§B3):

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Talento Fluxo — MasIA</title>
    <meta name="description" content="Sistema de gestão de candidatos e processos seletivos." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 0.5 Reescrever `src/main.tsx`

**Arquivo:** `src/main.tsx` (PROTEGIDO — não editar após criado)

Substituir o entrypoint TanStack por entrypoint SPA puro:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### 0.6 Criar `src/App.tsx` com `BrowserRouter` + `Routes`

**Arquivo:** `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import DashboardPage from "./routes/index";
import TalentosPage from "./routes/talentos";
import PipelinePage from "./routes/pipeline";
import EntrevistasPage from "./routes/entrevistas";
import RecrutadoresPage from "./routes/recrutadores";
import AvaliacoesPage from "./routes/avaliacoes";
import RelatoriosPage from "./routes/relatorios";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/talentos" element={<TalentosPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/entrevistas" element={<EntrevistasPage />} />
          <Route path="/recrutadores" element={<RecrutadoresPage />} />
          <Route path="/avaliacoes" element={<AvaliacoesPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
```

### 0.7 Converter cada rota TanStack em componente puro

**Problema:** cada `src/routes/*.tsx` usa `createFileRoute(...)({ component: X })`. Após migração, cada arquivo exporta o componente diretamente (default export), sem wrapper TanStack.

**Padrão antes (TanStack):**

```tsx
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/talentos')({ component: TalentosPage });
function TalentosPage() { ... }
```

**Padrão depois (react-router-dom):**

```tsx
export default function TalentosPage() { ... }
```

**Arquivos a converter (remover `createFileRoute` de todos):**

- `src/routes/index.tsx`
- `src/routes/talentos.tsx`
- `src/routes/pipeline.tsx`
- `src/routes/entrevistas.tsx`
- `src/routes/recrutadores.tsx`
- `src/routes/avaliacoes.tsx`
- `src/routes/relatorios.tsx`

Também remover o `head()` de cada rota (era padrão TanStack; no SPA puro o título está no `index.html`).

**Adaptar `AppShell.tsx`:** substituir `<Outlet />` do TanStack por `<Outlet />` do react-router-dom (ou `{ children }` via prop, já que o `App.tsx` injeta o conteúdo dentro do `AppShell`). Ver Épico 1.3.

### 0.8 Deletar arquivos SSR e serviços desnecessários

Os arquivos a seguir são resquícios do TanStack Start (SSR) ou da camada de mock e devem ser removidos:

| Arquivo                              | Motivo                                                     |
| ------------------------------------ | ---------------------------------------------------------- |
| `src/routes/__root.tsx`              | Padrão SSR TanStack — substituído por `App.tsx`            |
| `src/routeTree.gen.ts`               | Gerado pelo TanStack Router — não existe na nova stack     |
| `src/router.tsx`                     | Configuração do TanStack Router — não existe na nova stack |
| `src/server.ts`                      | SSR — proibido (§B3)                                       |
| `src/start.ts`                       | SSR — proibido (§B3)                                       |
| `src/routes/tags.tsx`                | Fora do escopo (§1.2)                                      |
| `src/routes/configuracoes.tsx`       | Fora do escopo (§1.2)                                      |
| `src/routes/talentos.$id.tsx`        | Substituído por `CandidateDetailsModal` (Épico 3.3)        |
| `src/lib/lovable-error-reporting.ts` | Específico Lovable — remover                               |
| `src/lib/error-capture.ts`           | Específico Lovable — remover                               |
| `src/lib/error-page.ts`              | Específico Lovable — remover                               |
| `src/services/candidatoService.ts`   | Mock com `obter(id)` — get-by-id **proibido** (§B5)        |
| `src/services/entrevistaService.ts`  | Mock — substituído pelo repo                               |
| `src/services/recrutadorService.ts`  | Mock — substituído pelo repo                               |
| `src/services/tagService.ts`         | Tag fora do escopo — remover                               |
| `src/data/tags.ts`                   | Tag fora do escopo — remover                               |

> Os arquivos em `src/data/` (candidatos, pipeline, entrevistas, avaliacoes, recrutadores, dashboard) **permanecem** temporariamente para que as telas continuem renderizando durante a migração. São removidos ao final do épico correspondente, depois que o repo substituir o mock.

### 0.9 Criar Schema do Banco (`supabase/migrations/0001_business_schema.sql`)

**Regras obrigatórias** (`Importantdoc.md` §B4):

- `owner_id text not null references "user"(id) on delete cascade` em **toda** tabela escrita pelo rep — inclusive tabelas-filhas (§B4.1).
- Sem RLS, sem `auth.uid()`, sem tabela `profiles`.
- `snake_case` minúsculo; nomes proibidos: `user, session, account, verification, organization, member, invitation`.
- `id uuid primary key default gen_random_uuid()` + `created_at`/`updated_at timestamptz` em toda tabela.
- `updated_at` automático via trigger `touch_updated_at` (§B4).

```sql
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
```

> **Atenção §B4.1:** `candidatos.recrutador_nome` guarda o nome plano (sem FK para recrutadores) — padrão plano do modo genérico do gateway (sem joins). Ajuste de recrutador em candidato é feito atualizando o campo `recrutador_nome` diretamente.

### 0.10 Criar `src/lib/data/client.ts` e `src/lib/data/types.gen.ts`

**`src/lib/data/client.ts`** — PROTEGIDO; copiar do scaffold canônico (`Importantdoc.md` §B5). Deve:

- Ler config de `window.__MASI_GW__` → `?gw=` → `import.meta.env.VITE_GATEWAY_URL` (nessa precedência).
- Ler tenant de `window.__MASI_TENANT__` → `?t=`.
- Branch PREVIEW quando `window.__MASI_PREVIEW__` existe (usa fixtures do Sandpack).
- Mandar `credentials: 'include'` + header `X-Tenant-Id`.
- Expor `db` e `auth` conforme §B5.

```ts
// src/lib/data/client.ts — PROTEGIDO
declare const window: Window & {
  __MASI_GW__?: string;
  __MASI_TENANT__?: string;
  __MASI_PREVIEW__?: boolean;
};

const params = new URLSearchParams(typeof location !== "undefined" ? location.search : "");

const GW = window.__MASI_GW__ ?? params.get("gw") ?? import.meta.env.VITE_GATEWAY_URL ?? "";

const TENANT = window.__MASI_TENANT__ ?? params.get("t") ?? "";

const IS_PREVIEW = !!window.__MASI_PREVIEW__;

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (IS_PREVIEW) {
    const { getFixture } = await import("./preview-fixtures");
    return getFixture(method, path) as T;
  }
  const res = await fetch(`${GW}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": TENANT,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  if (method === "DELETE") return undefined as T;
  return res.json();
}

export const db = {
  table<R = unknown>(name: string) {
    return {
      list: () => api<R[]>("GET", `/data/${name}`),
      create: (input: Partial<R>) => api<R>("POST", `/data/${name}`, input),
      update: (id: string, patch: Partial<R>) => api<R>("PATCH", `/data/${name}/${id}`, patch),
      remove: (id: string) => api<void>("DELETE", `/data/${name}/${id}`),
    };
  },
};

export const auth = {
  signIn: (email: string, password: string) =>
    api<{ user: unknown; token: string }>("POST", "/auth/sign-in/email", { email, password }),
  signUp: (name: string, email: string, password: string) =>
    api<{ user: unknown }>("POST", "/auth/sign-up/email", { name, email, password }),
  signOut: () => api<void>("POST", "/auth/sign-out"),
  me: () =>
    api<{
      user: { id: string; name: string; email: string };
      role: "admin" | "manager" | "rep";
    } | null>("GET", "/auth/me"),
};
```

**`src/lib/data/types.gen.ts`** — PROTEGIDO; reflete exatamente o schema de `0001_business_schema.sql`:

```ts
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
```

### 0.11 Criar Repositórios (`src/lib/data/*.repo.ts`)

Seguindo o padrão de §B5 do contrato. Cada repo usa `db.table()` — **sem get-by-id**, **sem `owner_id` no front**.

**`src/lib/data/candidatos.repo.ts`:**

```ts
import { db } from "./client";
import type { Database } from "./types.gen";

export type Candidato = Database["public"]["Tables"]["candidatos"]["Row"];

export const listCandidatos = () => db.table<Candidato>("candidatos").list();
export const createCandidato = (input: Partial<Candidato>) =>
  db.table<Candidato>("candidatos").create(input);
export const updateCandidato = (id: string, p: Partial<Candidato>) =>
  db.table<Candidato>("candidatos").update(id, p);
export const deleteCandidato = (id: string) => db.table<Candidato>("candidatos").remove(id);
```

**`src/lib/data/entrevistas.repo.ts`:**

```ts
import { db } from "./client";
import type { Database } from "./types.gen";

export type Entrevista = Database["public"]["Tables"]["entrevistas"]["Row"];

export const listEntrevistas = () => db.table<Entrevista>("entrevistas").list();
export const createEntrevista = (input: Partial<Entrevista>) =>
  db.table<Entrevista>("entrevistas").create(input);
export const updateEntrevista = (id: string, p: Partial<Entrevista>) =>
  db.table<Entrevista>("entrevistas").update(id, p);
export const deleteEntrevista = (id: string) => db.table<Entrevista>("entrevistas").remove(id);
```

**`src/lib/data/avaliacoes.repo.ts`:**

```ts
import { db } from "./client";
import type { Database } from "./types.gen";

export type Avaliacao = Database["public"]["Tables"]["avaliacoes"]["Row"];

export const listAvaliacoes = () => db.table<Avaliacao>("avaliacoes").list();
export const createAvaliacao = (input: Partial<Avaliacao>) =>
  db.table<Avaliacao>("avaliacoes").create(input);
export const updateAvaliacao = (id: string, p: Partial<Avaliacao>) =>
  db.table<Avaliacao>("avaliacoes").update(id, p);
export const deleteAvaliacao = (id: string) => db.table<Avaliacao>("avaliacoes").remove(id);
```

**`src/lib/data/recrutadores.repo.ts`:**

```ts
import { db } from "./client";
import type { Database } from "./types.gen";

export type Recrutador = Database["public"]["Tables"]["recrutadores"]["Row"];

export const listRecrutadores = () => db.table<Recrutador>("recrutadores").list();
export const createRecrutador = (input: Partial<Recrutador>) =>
  db.table<Recrutador>("recrutadores").create(input);
export const updateRecrutador = (id: string, p: Partial<Recrutador>) =>
  db.table<Recrutador>("recrutadores").update(id, p);
export const deleteRecrutador = (id: string) => db.table<Recrutador>("recrutadores").remove(id);
```

### 0.12 Criar `src/lib/auth.tsx`

**Arquivo:** `src/lib/auth.tsx`

Expõe `useAuth()` (lê sessão e papel) e `RequireAuth` (guard de rota). Usa `auth.me()` de `client.ts`. O `role` é usado **apenas para UI** (esconder botões) — a segurança real fica no gateway (§B8).

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "./data/client";

type Role = "admin" | "manager" | "rep";
type User = { id: string; name: string; email: string };
type AuthState = { user: User; role: Role } | null;

const AuthContext = createContext<AuthState>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(null);

  useEffect(() => {
    auth
      .me()
      .then(setState)
      .catch(() => setState(null));
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuth();
  if (!session) {
    return (
      <div
        className="tm-page"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <p className="tm-muted">Carregando sessão…</p>
      </div>
    );
  }
  return <>{children}</>;
}
```

> Adicionar `<AuthProvider>` em `src/App.tsx` envolvendo o `BrowserRouter`.

### 0.13 Criar `src/lib/data/preview-fixtures.ts`

**Arquivo:** `src/lib/data/preview-fixtures.ts` (PROTEGIDO — contrato com o editor Sandpack)

Fornece dados fixos para o branch PREVIEW do `client.ts`. Deve ter ao menos 2–3 registros por tabela para que as telas renderam no editor Sandpack sem depender do gateway.

```ts
// src/lib/data/preview-fixtures.ts — PROTEGIDO
import type { Database } from "./types.gen";

type Candidato = Database["public"]["Tables"]["candidatos"]["Row"];
type Entrevista = Database["public"]["Tables"]["entrevistas"]["Row"];
type Avaliacao = Database["public"]["Tables"]["avaliacoes"]["Row"];
type Recrutador = Database["public"]["Tables"]["recrutadores"]["Row"];

const fixtures: Record<string, unknown[]> = {
  candidatos: [
    {
      id: "c1",
      owner_id: "u1",
      nome: "Ana Lima",
      email: "ana@demo.dev",
      status: "triagem",
      cargo_pretendido: "Dev Frontend",
      senioridade: "pleno",
      cidade: "São Paulo",
      estado: "SP",
      telefone: null,
      linkedin: null,
      github: null,
      portfolio: null,
      pretensao_salarial: 8000,
      recrutador_nome: "Carlos",
      observacoes: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    } as Candidato,
    {
      id: "c2",
      owner_id: "u1",
      nome: "Bruno Melo",
      email: "bruno@demo.dev",
      status: "novo",
      cargo_pretendido: "Dev Backend",
      senioridade: "junior",
      cidade: "Recife",
      estado: "PE",
      telefone: null,
      linkedin: null,
      github: null,
      portfolio: null,
      pretensao_salarial: 5000,
      recrutador_nome: null,
      observacoes: null,
      created_at: "2026-01-02T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    } as Candidato,
    {
      id: "c3",
      owner_id: "u1",
      nome: "Carla Nunes",
      email: "carla@demo.dev",
      status: "proposta",
      cargo_pretendido: "Product Manager",
      senioridade: "senior",
      cidade: "BH",
      estado: "MG",
      telefone: null,
      linkedin: null,
      github: null,
      portfolio: null,
      pretensao_salarial: 12000,
      recrutador_nome: "Ana",
      observacoes: null,
      created_at: "2026-01-03T00:00:00Z",
      updated_at: "2026-01-03T00:00:00Z",
    } as Candidato,
  ] satisfies Candidato[],
  entrevistas: [
    {
      id: "e1",
      owner_id: "u1",
      candidato_id: "c1",
      candidato_nome: "Ana Lima",
      entrevistador: "Carlos",
      data: "2026-06-30",
      horario: "10:00",
      tipo: "tecnica",
      status: "agendada",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    } as Entrevista,
    {
      id: "e2",
      owner_id: "u1",
      candidato_id: "c3",
      candidato_nome: "Carla Nunes",
      entrevistador: "Ana",
      data: "2026-07-01",
      horario: "14:00",
      tipo: "rh",
      status: "realizada",
      created_at: "2026-01-02T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    } as Entrevista,
  ] satisfies Entrevista[],
  avaliacoes: [
    {
      id: "av1",
      owner_id: "u1",
      candidato_id: "c1",
      candidato_nome: "Ana Lima",
      avaliador: "Carlos",
      nota: 4.5,
      comentario: "Ótima comunicação técnica.",
      data: "2026-06-28",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    } as Avaliacao,
  ] satisfies Avaliacao[],
  recrutadores: [
    {
      id: "r1",
      owner_id: "u1",
      nome: "Carlos Souza",
      cargo: "Recrutador Sênior",
      email: "carlos@demo.dev",
      telefone: null,
      status: "ativo",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    } as Recrutador,
    {
      id: "r2",
      owner_id: "u1",
      nome: "Ana Ferreira",
      cargo: "Recrutadora Pleno",
      email: "ana.r@demo.dev",
      telefone: null,
      status: "ativo",
      created_at: "2026-01-02T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    } as Recrutador,
  ] satisfies Recrutador[],
  pipeline_stages: [
    { id: "novo", nome: "Novo", cor: "#6366f1", ordem: 1 },
    { id: "triagem", nome: "Triagem", cor: "#8b5cf6", ordem: 2 },
    { id: "proposta", nome: "Proposta", cor: "#10b981", ordem: 6 },
  ],
};

export function getFixture(method: string, path: string): unknown {
  const match = path.match(/^\/data\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return null;
  const table = match[1];
  if (method === "GET") return fixtures[table] ?? [];
  return fixtures[table]?.[0] ?? {};
}
```

### 0.14 Criar `src/components/registry.tsx`

**Arquivo:** `src/components/registry.tsx` (PROTEGIDO — índice de componentes para o editor Sandpack)

```tsx
// src/components/registry.tsx — PROTEGIDO
export { Button } from "./common/Button";
export { Modal } from "./common/Modal";
export { Badge } from "./common/Badge";
export { Avatar } from "./common/Avatar";
export { Input, Select, Textarea, Field } from "./common/Input";
export { SearchBar } from "./common/SearchBar";
export { Pagination } from "./common/Pagination";
export { StatsCard } from "./common/StatsCard";
export { Timeline } from "./common/Timeline";
export { EmptyState } from "./common/EmptyState";
export { Skeleton } from "./common/Skeleton";
export { CandidateCard } from "./common/CandidateCard";
```

### 0.15 Criar `masi.template.json`

**Arquivo:** `masi.template.json` (na raiz do projeto)

Conforme §B7 do contrato:

```json
{
  "id": "talento-fluxo",
  "name": "Gestor de Talentos e R&S",
  "description": "ATS multi-tenant para gestão de candidatos, pipeline Kanban, entrevistas e avaliações.",
  "version": "1.0.0",
  "engine": "vite-react-gateway",
  "schemaVersion": 1,
  "migrations": ["0001_business_schema.sql"],
  "auth": { "provider": "better-auth", "roles": ["admin", "manager", "rep"] },
  "screens": [
    { "id": "dashboard", "route": "/", "title": "Dashboard", "file": "src/routes/index" },
    {
      "id": "talentos",
      "route": "/talentos",
      "title": "Banco de Talentos",
      "file": "src/routes/talentos"
    },
    { "id": "pipeline", "route": "/pipeline", "title": "Pipeline", "file": "src/routes/pipeline" },
    {
      "id": "entrevistas",
      "route": "/entrevistas",
      "title": "Entrevistas",
      "file": "src/routes/entrevistas"
    },
    {
      "id": "recrutadores",
      "route": "/recrutadores",
      "title": "Recrutadores",
      "file": "src/routes/recrutadores"
    },
    {
      "id": "avaliacoes",
      "route": "/avaliacoes",
      "title": "Avaliações",
      "file": "src/routes/avaliacoes"
    },
    {
      "id": "relatorios",
      "route": "/relatorios",
      "title": "Relatórios",
      "file": "src/routes/relatorios"
    }
  ],
  "editable": {
    "allow": [
      "src/routes/**",
      "src/components/common/**",
      "src/components/layout/**",
      "src/lib/data/*.repo.ts",
      "src/lib/auth.tsx",
      "src/utils/format.ts",
      "src/styles.css"
    ],
    "protect": [
      "src/lib/data/client.ts",
      "src/lib/data/types.gen.ts",
      "src/lib/data/preview-fixtures.ts",
      "src/components/ui/**",
      "src/components/registry.tsx",
      "src/lib/utils.ts",
      "src/main.tsx",
      "src/App.tsx",
      "vite.config.ts",
      "components.json",
      "supabase/migrations/**"
    ]
  },
  "composio": { "toolkits": [] },
  "envContract": ["VITE_GATEWAY_URL"]
}
```

### 0.16 Criar `THIRD_PARTY.md`

**Arquivo:** `THIRD_PARTY.md` (na raiz)

Conforme §B10 e checklist final de §B — creditar a origem da UI:

```markdown
# THIRD_PARTY — Talento Fluxo

## UI base

- **Origem:** UI gerada via [Lovable](https://lovable.dev) como ponto de partida de telas e componentes.
- **Licença:** Código gerado pertence ao projeto (sem restrição OSS de terceiros).
- **Escopo do reaproveitamento:** estrutura de componentes (`src/components/`), estilos (`src/styles.css`), telas (`src/routes/`).

## Bibliotecas de terceiros incluídas

Todas listadas em `package.json`. Principais:

| Biblioteca      | Licença |
| --------------- | ------- |
| React           | MIT     |
| Vite            | MIT     |
| Radix UI        | MIT     |
| Tailwind CSS    | MIT     |
| Recharts        | MIT     |
| Lucide React    | ISC     |
| React Hook Form | MIT     |
| Zod             | MIT     |
| date-fns        | MIT     |
| @dnd-kit/\*     | MIT     |
```

---

## Épico 1: Estrutura Global e Navegação

### 1.1 Header

**Arquivo:** `src/components/layout/Header.tsx`

- **Remover** `<div className="tm-search">…</div>` (input de busca global).
- **Remover** o botão `<Bell />` (notificações).
- **Preparar** o botão "Novo candidato" para receber `onClick` via prop (`onNovoCandidato?: () => void`) — o handler será conectado ao `AddCandidateModal` no Épico 3.1.

### 1.2 Sidebar e rotas inativas

**Arquivo:** `src/components/layout/Sidebar.tsx`

- Remover botões `<ChevronsLeft>` / `<ChevronsRight>` (expansão/colapso).
- Remover os itens de navegação `/configuracoes` e `/tags` do array de menu.
- Substituir `<Link to="…">` do TanStack por `<NavLink to="…">` do react-router-dom (para active state).

### 1.3 AppShell

**Arquivo:** `src/components/layout/AppShell.tsx`

- Remover o `<Outlet />` do TanStack Router.
- Substituir por `{ children }` via props — o `App.tsx` injeta o conteúdo dentro do `AppShell`:
  ```tsx
  export function AppShell({ children }: { children: React.ReactNode }) { … }
  ```
- Remover `QueryClientProvider` (não é mais necessário após remoção do `@tanstack/react-query`).
- Adicionar `<AuthProvider>` do `src/lib/auth.tsx` envolvendo o conteúdo (ou fazê-lo em `App.tsx`).

---

## Épico 2: Dashboard (`/`)

**Objetivo:** substituir o `src/data/dashboard.ts` (mock estático) por dados calculados dinamicamente a partir dos repos do gateway.

### 2.1 Integrar dados reais

**Arquivo:** `src/routes/index.tsx`

Substituir `import { dashboard } from '@/data/dashboard'` por chamadas reais:

```tsx
const [candidatos, setCandidatos] = useState<Candidato[]>([]);
const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
const [carregando, setCarregando] = useState(true);

useEffect(() => {
  Promise.all([listCandidatos(), listEntrevistas()])
    .then(([c, e]) => {
      setCandidatos(c);
      setEntrevistas(e);
    })
    .finally(() => setCarregando(false));
}, []);
```

### 2.2 Métricas client-side

Todas as métricas são calculadas via `useMemo` sobre os arrays locais — **sem endpoint de query no gateway** (§B5: list-then-filter):

| Métrica                | Cálculo                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `totalCandidatos`      | `candidatos.length`                                                                          |
| `entrevistasAgendadas` | `entrevistas.filter(e => e.status === 'agendada').length`                                    |
| `emProcesso`           | `candidatos.filter(c => !['contratado','arquivado'].includes(c.status)).length`              |
| `contratacoesMes`      | `candidatos.filter(c => c.status === 'contratado' && isSameMonth(c.updated_at, now)).length` |
| `novosCandidatos`      | `candidatos.filter(c => c.status === 'novo').length`                                         |
| `distribuicaoEtapa`    | `groupBy(candidatos, 'status')` → array `{ etapa, quantidade }`                              |
| `contratacoesPorMes`   | agrupar candidatos contratados por `updated_at` mês                                          |
| `entrevistasPorMes`    | agrupar entrevistas por `data` mês                                                           |
| `atividadesRecentes`   | últimas 10 entrevistas ordenadas por `created_at` desc                                       |

Exibir `<Skeleton />` durante `carregando`.

Ao final, deletar `src/data/dashboard.ts`.

---

## Épico 3: Gestão de Talentos (`/talentos`)

### 3.1 Componente `AddCandidateModal`

**Arquivo:** `src/components/common/AddCandidateModal.tsx`

- Formulário com campos: Nome\*, E-mail\*, Telefone, Cargo Pretendido, Senioridade.
- Submit chama `createCandidato({ nome, email, telefone, cargo_pretendido, senioridade })`.
- **Não enviar `owner_id`** — o gateway o seta pela sessão (§B5).
- Após `createCandidato` resolver, refetch da lista local: `listCandidatos().then(setCandidatos)`.
- Botão "Criar" usa `<Button variant="primary">`.

### 3.2 Integrar `listCandidatos()` na view `/talentos`

**Arquivo:** `src/routes/talentos.tsx`

- Substituir `import { candidatos } from '@/data/candidatos'` por:
  ```tsx
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  useEffect(() => {
    listCandidatos().then(setCandidatos);
  }, []);
  ```
- Remover botão "Exportar".
- Toda filtragem (status, senioridade, cidade, busca, ordenação) via `useMemo` sobre o array completo — **sem filtro de query no gateway** (§B5).
- Conectar botão "Novo candidato" ao `AddCandidateModal`.
- Manter paginação de 8 itens via `useMemo` sobre o array filtrado.
- Clicar em uma linha da tabela abre `CandidateDetailsModal` (Épico 3.3) — **não navega** para `/talentos/:id`.
- Ao final, deletar `src/data/candidatos.ts`.

### 3.3 `CandidateDetailsModal`

**Arquivo:** `src/components/common/CandidateDetailsModal.tsx`

- Recebe `candidato: Candidato | null` e `onFechar: () => void`.
- Exibe: dados resumidos do candidato.
- Aba "Avaliações": `listAvaliacoes().then(all => all.filter(a => a.candidato_id === candidato.id))` — **list-then-filter** (§B5, sem get-by-id, sem filtro de query no gateway).
- Exibe `<Skeleton />` durante carregamento das avaliações.

### 3.4 Deletar `src/routes/talentos.$id.tsx`

Após `CandidateDetailsModal` implementado, a rota dedicada não é necessária. Remover o arquivo e garantir que não haja referência a ela em `App.tsx`.

---

## Épico 4: Pipeline Kanban (`/pipeline`)

### 4.1 Instalar `@dnd-kit` ✅ _(Mexido sozinho)_

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable
```

Adicionar `@dnd-kit/core` e `@dnd-kit/sortable` ao `THIRD_PARTY.md` (licença MIT).

### 4.2 Drag and Drop com persistência no gateway

**Arquivo:** `src/routes/pipeline.tsx`

- Substituir mock por:
  ```tsx
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  useEffect(() => {
    listCandidatos().then(setCandidatos);
  }, []);
  ```
- Implementar `<DndContext sensors={[mouse, touch]} onDragEnd={handleDragEnd}>` com `MouseSensor` e `TouchSensor` (suporte mobile).
- Colunas: as 8 do `pipeline_stages`. O `pipeline_stages` pode ser mantido como constante client-side (os dados do lookup não mudam; o `db.table('pipeline_stages').list()` pode ser chamado ou a constante local pode ser usada).
- No `onDragEnd`:
  ```ts
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const novoStatus = over.id as string;
    // Atualização otimista — evita flash visual
    setCandidatos((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, status: novoStatus } : c)),
    );
    await updateCandidato(active.id as string, { status: novoStatus });
  }
  ```
- Ligar botão "Adicionar candidato" ao `AddCandidateModal` (Épico 3.1).
- Exibir `<Skeleton />` durante carregamento inicial.
- Ao final, deletar `src/data/pipeline.ts`.

---

## Épico 5: Entrevistas (`/entrevistas`)

### 5.1 Integrar `listEntrevistas()`

**Arquivo:** `src/routes/entrevistas.tsx`

Substituir mock por:

```tsx
const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
useEffect(() => {
  listEntrevistas().then(setEntrevistas);
}, []);
```

Ao final, deletar `src/data/entrevistas.ts`.

### 5.2 Modal "Nova entrevista"

Botão "Nova entrevista" abre modal com campos: Candidato (select sobre `listCandidatos()`), Entrevistador, Data, Horário, Tipo.

- Submit chama `createEntrevista({ candidato_id, candidato_nome, entrevistador, data, horario, tipo })`.
- **Não enviar `owner_id`.**
- Após criar, refetch: `listEntrevistas().then(setEntrevistas)`.
- Candidato select: `listCandidatos()` carregado ao abrir o modal, exibido como `<Select>`.

### 5.3 Filtros client-side

Adicionar `<Select>` no topo: Período (hoje/semana/mês), Status, Responsável. Toda filtragem via `useMemo` sobre o array completo — **sem query no gateway** (§B5).

### 5.4 Calendário clicável

- Cada célula do dia recebe `onClick={() => handleDiaClick(data)}`.
- `handleDiaClick` abre modal com as entrevistas do dia: `entrevistas.filter(e => e.data === diaISO)` — list-then-filter no front.

---

## Épico 6: Recrutadores e Avaliações

### 6.1 Integrar `listRecrutadores()`

**Arquivo:** `src/routes/recrutadores.tsx`

Substituir mock por:

```tsx
const [recrutadores, setRecrutadores] = useState<Recrutador[]>([]);
useEffect(() => {
  listRecrutadores().then(setRecrutadores);
}, []);
```

Modal "Novo recrutador" já existe na UI; conectar o submit a `createRecrutador(dados)`.  
Botão editar: abre modal pré-preenchido; submit chama `updateRecrutador(id, dados)`.

Ao final, deletar `src/data/recrutadores.ts`.

### 6.2 Confirmação de exclusão de recrutadores

Ao clicar `<Trash2>`, abrir `<Modal>` de confirmação com botão `<Button variant="danger">Confirmar exclusão</Button>`.  
Só após confirmação chamar `deleteRecrutador(id)` e refetch.

### 6.3 Integrar `listAvaliacoes()`

**Arquivo:** `src/routes/avaliacoes.tsx`

Substituir mock por:

```tsx
const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
useEffect(() => {
  listAvaliacoes().then(setAvaliacoes);
}, []);
```

Calcular média geral e total via `useMemo` sobre o array.

Ao final, deletar `src/data/avaliacoes.ts`.

### 6.4 Truncamento de comentários longos

Comentários com mais de 120 caracteres: exibir truncado por padrão com botão "Ler mais". Ao clicar, expandir via `useState<Set<string>>` com o `id` da avaliação. Ao clicar novamente, colapsar.

---

## Épico 7: Relatórios (`/relatorios`)

**Objetivo:** substituir `src/data/` pelos repos reais.

### 7.1 Integrar dados reais

**Arquivo:** `src/routes/relatorios.tsx`

Substituir mocks por:

```tsx
const [candidatos, setCandidatos] = useState<Candidato[]>([]);
const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
useEffect(() => {
  Promise.all([listCandidatos(), listEntrevistas()]).then(([c, e]) => {
    setCandidatos(c);
    setEntrevistas(e);
  });
}, []);
```

Todas as séries dos 5 gráficos calculadas via `useMemo` sobre os arrays locais:

| Gráfico                           | Cálculo                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| Candidatos por etapa (Bar)        | `groupBy(candidatos, 'status')`                                                          |
| Contratações por mês (Line)       | `groupBy(contratados, mes de updated_at)`                                                |
| Entrevistas por mês (Bar)         | `groupBy(entrevistas, mes de data)`                                                      |
| Distribuição de senioridade (Pie) | `groupBy(candidatos, 'senioridade')`                                                     |
| Top skills (Bar horizontal)       | campo `skills` não existe no schema plano → omitir ou usar `cargo_pretendido` como proxy |

> **Skills:** o schema plano não tem array de skills. Substituir "Top 10 skills" por "Distribuição de cargos pretendidos" (`groupBy(candidatos, 'cargo_pretendido')`) — sem necessidade de alterar o schema.

Exibir `<Skeleton />` durante carregamento.

---

## Épico 8: Build e Publicação

### 8.1 Validação do build (§B10)

```bash
pnpm install
pnpm run build   # tsc && vite build
```

Pré-requisitos obrigatórios antes de publicar:

- `pnpm run build` passa sem erros TypeScript.
- Zero imports não usados (`noUnusedLocals` no `tsconfig` — imports não usados **quebram o build** §B3).
- `pnpm-lock.yaml` commitado.

### 8.2 Checklist pré-publish (`Importantdoc.md` §B10 + checklists finais)

**Checklist de seleção:**

- [x] Licença: UI interna — sem restrição OSS.
- [x] Domínio é dados + telas (CRUD puro, sem realtime/WhatsApp/jobs/webhooks/pagamento/mídia).
- [x] Nenhuma página pública sem login — sem extensão de gateway necessária.
- [x] Joins resolvíveis plano / 2 queries no front.

**Checklist do template:**

- [ ] SPA Vite 6 + React 19, sem Next/SSR, sem backend próprio.
- [ ] `pnpm-lock.yaml` commitado; `pnpm run build` passa; zero imports não usados.
- [ ] Zero `@supabase`, zero fetch direto ao banco, zero auth próprio. Acesso só via `db`/`auth`.
- [ ] Schema: `owner_id text references "user"(id) on delete cascade` em **toda** tabela escrita pelo rep (inclusive filhas `entrevistas`, `avaliacoes`, `recrutadores`). Trigger `touch_updated_at` em todas.
- [ ] `types.gen.ts` bate com o schema.
- [ ] `masi.template.json`: engine `vite-react-gateway`, envContract `["VITE_GATEWAY_URL"]`, allow/protect corretos.
- [ ] Telas fazem **list-then-filter** (sem get-by-id, sem filtro de query no gateway).
- [ ] `owner_id` nunca enviado do front.
- [ ] Papéis admin/manager/rep configurados no manifest; 1º user = admin (automático pelo gateway).
- [ ] `THIRD_PARTY.md` credita a origem Lovable e lista bibliotecas de terceiros.

### 8.3 Publish e catálogo (§B10)

```bash
# Build compartilhado → R2 templates/talento-fluxo/v<ts> + KV TPL:talento-fluxo
pnpm templates:publish talento-fluxo https://masi-tenant-gateway.fly.dev
# ⚠️ SEMPRE passe o gateway https público. Sem ele, default é localhost e TODOS os clones quebram.

# Demo em demo-talento-fluxo.masia.cloud
pnpm demo:publish talento-fluxo
```

**Registrar no catálogo (control-plane):** criar migration em `masi-ai-orquestration/supabase/migrations/` espelhando o padrão de `20260620160001_clone_template_forms_nps.sql`:

- INSERT em `clone_templates` (slug `talento-fluxo`, name, description, category `rh`, status `published`, latest_version, demo_url).
- INSERT em `clone_template_versions` (template_id, version, manifest jsonb, changelog).
- Ambos com cláusula `ON CONFLICT DO NOTHING` (idempotentes).

**Redeploy do serviço Fly:** após adicionar/alterar o template, redeploy da API e do worker no Fly (`Dockerfile` faz `COPY clone-templates`). Sem isso: provisiona/edita dá `ENOENT` (§B10).

**Teste E2E:** clone real via o app → provisiona Neon → login admin semeado → todas as telas funcionam com dados reais → drag-and-drop no pipeline persiste → entrevista criada aparece no calendário.

---

## Ordem de execução recomendada

```
Épico 0 (completo) → Épico 1 → Épico 2 → Épico 3 → Épico 4 → Épico 5 → Épico 6 → Épico 7 → Épico 8
```

O Épico 0 é pré-requisito de todos os demais pois a fundação (react-router-dom, client.ts, repos, auth.tsx) precisa estar no lugar antes de qualquer integração com o gateway.
