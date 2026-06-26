import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AddCandidateModal } from "@/components/common/AddCandidateModal";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [modalNovoCandidato, setModalNovoCandidato] = useState(false);

  return (
    <div className="tm-app">
      <Sidebar aberta={sidebarAberta} setAberta={setSidebarAberta} />
      <div className="tm-main">
        <Header
          onAbrirSidebar={() => setSidebarAberta(true)}
          onNovoCandidato={() => setModalNovoCandidato(true)}
        />
        <main className="tm-content tm-fade-in">{children}</main>
      </div>

      <AddCandidateModal
        aberto={modalNovoCandidato}
        onFechar={() => setModalNovoCandidato(false)}
        onCriado={() => {}}
      />
    </div>
  );
}
