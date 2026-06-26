import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  return (
    <div className="tm-app">
      <Sidebar aberta={aberta} setAberta={setAberta} />
      <div className="tm-main">
        <Header onAbrirSidebar={() => setAberta(true)} />
        <main className="tm-content tm-fade-in">{children}</main>
      </div>
    </div>
  );
}
