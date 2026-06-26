import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "../components/layout/AppShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-background)", padding: "1rem" }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 className="tm-h1" style={{ fontSize: "4rem", lineHeight: 1 }}>404</h1>
        <h2 className="tm-h2" style={{ marginTop: 12 }}>Página não encontrada</h2>
        <p className="tm-muted" style={{ marginTop: 8 }}>
          A página que você procura não existe ou foi movida.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link to="/" className="tm-btn tm-btn-primary">Ir para o início</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-background)", padding: "1rem" }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 className="tm-h2">Não foi possível carregar a página</h1>
        <p className="tm-muted" style={{ marginTop: 8 }}>
          Algo deu errado por aqui. Tente atualizar ou volte ao início.
        </p>
        <div className="tm-flex tm-gap-2" style={{ marginTop: 20, justifyContent: "center" }}>
          <button
            className="tm-btn tm-btn-primary"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </button>
          <a className="tm-btn tm-btn-secondary" href="/">Início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Talent Manager — MasIA" },
      { name: "description", content: "Sistema interno de gestão de candidatos e processos seletivos." },
      { name: "author", content: "MasIA" },
      { property: "og:title", content: "Talent Manager — MasIA" },
      { property: "og:description", content: "Sistema interno de gestão de candidatos e processos seletivos." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
