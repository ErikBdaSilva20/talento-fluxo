import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { getCookie, setCookie } from "hono/cookie";
import { Pool } from "pg";

const app = new Hono();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://masia:masia_dev@localhost:5432/tenant_local",
});

// Sessões em memória: token → user_id
const sessions = new Map<string, string>();

// Tabelas com owner_id (demais são lookups sem owner)
const TABLES_WITH_OWNER = new Set(["candidatos", "entrevistas", "avaliacoes", "recrutadores"]);

// CORS — deve ser origin específica para cookies funcionarem
app.use("*", async (c, next) => {
  const origin = c.req.header("origin") || "http://localhost:5173";
  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type,X-Tenant-Id");
  if (c.req.method === "OPTIONS") return c.text("OK");
  await next();
});

// Resolve owner_id da sessão ou, em dev, pega o primeiro usuário do banco
async function resolveOwner(c: Parameters<typeof getCookie>[0]): Promise<string | null> {
  const token = getCookie(c, "session");
  if (token) {
    const userId = sessions.get(token);
    if (userId) return userId;
  }
  // Fallback local dev: usa o primeiro usuário do banco
  const result = await pool.query(`SELECT id FROM "user" LIMIT 1`);
  return result.rows[0]?.id ?? null;
}

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// ── Auth ─────────────────────────────────────────────────────────────────────

app.post("/auth/sign-up/email", async (c) => {
  const { name, email, password } = await c.req.json();
  try {
    const result = await pool.query(
      `INSERT INTO "user" (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email`,
      [name, email, password],
    );
    const user = result.rows[0];
    const token = crypto.randomUUID();
    sessions.set(token, user.id);
    setCookie(c, "session", token, { httpOnly: true, sameSite: "Lax", maxAge: 60 * 60 * 24 * 7 });
    return c.json({ user });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/auth/sign-in/email", async (c) => {
  const { email, password } = await c.req.json();
  try {
    const result = await pool.query(`SELECT * FROM "user" WHERE email = $1`, [email]);
    if (!result.rows.length) return c.json({ error: "Usuário não encontrado" }, 401);
    const user = result.rows[0];
    if (user.password !== password) return c.json({ error: "Senha incorreta" }, 401);
    const token = crypto.randomUUID();
    sessions.set(token, user.id);
    setCookie(c, "session", token, { httpOnly: true, sameSite: "Lax", maxAge: 60 * 60 * 24 * 7 });
    return c.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/auth/me", async (c) => {
  try {
    const userId = await resolveOwner(c);
    if (!userId) return c.json(null);
    const result = await pool.query(`SELECT id, name, email FROM "user" WHERE id = $1`, [userId]);
    if (!result.rows.length) return c.json(null);
    const user = result.rows[0];
    return c.json({ user, role: "admin" });
  } catch {
    return c.json(null);
  }
});

app.post("/auth/sign-out", (c) => {
  const token = getCookie(c, "session");
  if (token) sessions.delete(token);
  setCookie(c, "session", "", { maxAge: 0 });
  return c.text("OK");
});

// ── CRUD genérico ─────────────────────────────────────────────────────────────

app.get("/data/:table", async (c) => {
  const table = c.req.param("table");
  try {
    const hasCreatedAt = TABLES_WITH_OWNER.has(table);
    const order = hasCreatedAt ? "ORDER BY created_at DESC" : "ORDER BY ordem ASC";
    const result = await pool.query(`SELECT * FROM ${table} ${order}`);
    return c.json(result.rows);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post("/data/:table", async (c) => {
  const table = c.req.param("table");
  const body = await c.req.json();

  // Injeta owner_id automaticamente (o front nunca manda — gateway faz isso em prod)
  if (TABLES_WITH_OWNER.has(table)) {
    const ownerId = await resolveOwner(c);
    if (!ownerId) return c.json({ error: "Unauthorized" }, 401);
    body.owner_id = ownerId;
  }

  try {
    const columns = Object.keys(body);
    const values = Object.values(body);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const result = await pool.query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return c.json(result.rows[0]);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.patch("/data/:table/:id", async (c) => {
  const table = c.req.param("table");
  const id = c.req.param("id");
  const body = await c.req.json();

  // Remove campos que o front não deve poder sobrescrever
  delete body.owner_id;
  delete body.id;

  try {
    const columns = Object.keys(body);
    const values = Object.values(body);
    const hasUpdatedAt = TABLES_WITH_OWNER.has(table);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");
    const updatedAtClause = hasUpdatedAt ? `, updated_at = NOW()` : "";

    const result = await pool.query(
      `UPDATE ${table} SET ${setClause}${updatedAtClause} WHERE id = $${columns.length + 1} RETURNING *`,
      [...values, id],
    );
    if (!result.rows.length) return c.json({ error: "Not found" }, 404);
    return c.json(result.rows[0]);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete("/data/:table/:id", async (c) => {
  const table = c.req.param("table");
  const id = c.req.param("id");
  try {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return c.text("OK");
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

const port = 3000;
serve({ fetch: app.fetch, port });
