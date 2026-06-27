# DEV LOCAL — talento-fluxo

Guia único para subir o ambiente local de teste, validar o CRUD e confirmar que o código
respeita as regras do `Importantdoc.md`.

---

## Arquitetura local

```
[SPA Vite + React]  →  [Hono mock server]  →  [Postgres 16 (Docker)]
  localhost:5173          localhost:3000          localhost:5432
```

O mock server (`src/server.ts`) imita o comportamento do `tenant-gateway` real:
injeta `owner_id` pela sessão, expõe `/data/:table` e `/auth/*`.

---

## 1. Pré-requisitos

- Docker Desktop rodando
- Node 20+ e pnpm instalados
- `pnpm install` já executado no projeto

---

## 2. Subir o banco (Postgres via Docker)

```bash
docker compose up -d
```

Verificar que está saudável:

```bash
docker compose ps
# masia_local_db deve aparecer com Status "healthy"
```

String de conexão: `postgresql://masia:masia_dev@localhost:5432/tenant_local`

---

## 3. Criar as tabelas (primeira vez ou após reset)

```bash
docker exec -i masia_local_db psql -U masia -d tenant_local < supabase/migrations/0001_init.sql
```

Tabelas criadas:

| Tabela            | Tipo    | owner_id? | Regra                                    |
| ----------------- | ------- | --------- | ---------------------------------------- |
| `user`            | auth    | —         | id TEXT (Better-Auth pattern)            |
| `candidatos`      | negócio | text FK   | owner_id text references "user"(id)      |
| `entrevistas`     | negócio | text FK   | candidato_nome denormalizado (sem join)  |
| `avaliacoes`      | negócio | text FK   | liga em candidato direto, não entrevista |
| `recrutadores`    | negócio | text FK   |                                          |
| `pipeline_stages` | lookup  | —         | sem owner_id, sem timestamps (read-only) |

---

## 4. Criar usuário admin (primeira vez)

```bash
docker exec -i masia_local_db psql -U masia -d tenant_local -c \
  "INSERT INTO \"user\" (name, email, password) VALUES ('Admin', 'admin@local.dev', 'senha123');"
```

---

## 5. Rodar o projeto

Em um terminal só (backend + frontend em paralelo):

```bash
pnpm dev
```

Ou separadamente:

```bash
# Terminal 1 — backend mock
pnpm dev:server

# Terminal 2 — frontend
pnpm dev:frontend
```

URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 6. Conectar o Beekeeper Studio

Nova conexão → PostgreSQL:

| Campo    | Valor          |
| -------- | -------------- |
| Host     | `localhost`    |
| Port     | `5432`         |
| User     | `masia`        |
| Password | `masia_dev`    |
| Database | `tenant_local` |

---

## 7. Verificação manual dos endpoints

### Health

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

### Sessão (auth.me — retorna admin via fallback local)

```bash
curl http://localhost:3000/auth/me
# {"user":{"id":"...","name":"Admin","email":"admin@local.dev"},"role":"admin"}
```

### CRUD candidatos

```bash
# Listar (vazio no início)
curl http://localhost:3000/data/candidatos

# Criar (sem owner_id — o server injeta)
curl -X POST http://localhost:3000/data/candidatos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Lima","email":"ana@test.com","cargo_pretendido":"Dev Frontend","senioridade":"pleno"}'

# Listar novamente (deve aparecer com owner_id preenchido)
curl http://localhost:3000/data/candidatos

# Atualizar
curl -X PATCH http://localhost:3000/data/candidatos/<ID> \
  -H "Content-Type: application/json" \
  -d '{"status":"entrevista"}'

# Deletar
curl -X DELETE http://localhost:3000/data/candidatos/<ID>
```

### Pipeline stages (lookup — sem owner_id)

```bash
curl http://localhost:3000/data/pipeline_stages
# retorna os 6 stages seedados, ordenados por "ordem"
```

---

## 8. Checklist — regras do Importantdoc.md

Rode cada verificação abaixo para confirmar que o código está dentro do contrato.

### Schema (§B4)

```bash
docker exec masia_local_db psql -U masia -d tenant_local -c \
  "\d candidatos"
```

Conferir:

- `owner_id` é `text` (não uuid)
- FK aponta para `"user"(id)`
- Sem `auth.uid()`, sem RLS

```bash
docker exec masia_local_db psql -U masia -d tenant_local -c \
  "SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'candidatos' ORDER BY ordinal_position;"
```

### owner_id nunca vem do front (§B5)

Criar um candidato pelo app e verificar no banco que `owner_id` foi preenchido pelo servidor:

```bash
docker exec masia_local_db psql -U masia -d tenant_local -c \
  "SELECT id, nome, owner_id FROM candidatos LIMIT 5;"
```

`owner_id` deve ser o ID do admin — sem o front ter mandado esse campo.

### list-then-filter, sem get-by-id (§B5)

Confirmar que nenhum endpoint `GET /data/:table/:id` é chamado. Toda busca por registro
específico deve ser feita via `list()` + `.find()` no front.

```bash
# Este endpoint NÃO deve existir (retorna 404 ou erro de rota)
curl http://localhost:3000/data/candidatos/<qualquer-id>
```

### Sem imports não usados (§B3 / B10)

```bash
pnpm build
# Deve passar sem erros de TypeScript
```

### Tabelas lookup sem owner_id (§B4.1)

```bash
docker exec masia_local_db psql -U masia -d tenant_local -c \
  "\d pipeline_stages"
```

`pipeline_stages` não deve ter coluna `owner_id`.

---

## 9. Reset completo do banco

Quando precisar começar do zero:

```bash
docker exec masia_local_db psql -U masia -d tenant_local -c "
DROP TABLE IF EXISTS avaliacoes, entrevistas, recrutadores, pipeline_stages, candidatos, account, session, \"user\" CASCADE;
"

docker exec -i masia_local_db psql -U masia -d tenant_local < supabase/migrations/0001_init.sql

docker exec -i masia_local_db psql -U masia -d tenant_local -c \
  "INSERT INTO \"user\" (name, email, password) VALUES ('Admin', 'admin@local.dev', 'senha123');"
```

---

## 10. Troubleshooting

| Sintoma                                            | Causa                       | Solução                                        |
| -------------------------------------------------- | --------------------------- | ---------------------------------------------- |
| `connection refused` na porta 3000                 | Servidor não subiu          | `pnpm dev:server`                              |
| `connection refused` na porta 5432                 | Docker não rodando          | `docker compose up -d`                         |
| `EADDRINUSE :3000`                                 | Processo anterior pendurado | `npx kill-port 3000`                           |
| INSERT falha com `null value in column "owner_id"` | Tabela sem usuário no banco | Rode o INSERT do admin (passo 4)               |
| `duplicate key value` no usuário                   | Admin já existe             | Ignorar ou fazer login normal                  |
| Frontend mostra lista vazia                        | Banco vazio ou server fora  | Crie dados via curl (passo 7)                  |
| Beekeeper não conecta                              | Container não healthy       | `docker compose ps` e `docker compose restart` |
