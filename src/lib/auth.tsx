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
