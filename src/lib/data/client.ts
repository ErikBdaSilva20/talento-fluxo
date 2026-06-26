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
