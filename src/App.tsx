import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
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
    <AuthProvider>
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
    </AuthProvider>
  );
}
