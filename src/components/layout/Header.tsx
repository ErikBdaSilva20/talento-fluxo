import { Bell, Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header({ onAbrirSidebar }: { onAbrirSidebar: () => void }) {
  return (
    <header className="tm-header">
      <button className="tm-btn tm-btn-ghost tm-btn-icon" onClick={onAbrirSidebar} style={{ display: "inline-flex" }} aria-label="Abrir menu">
        <Menu size={18} />
      </button>
      <div className="tm-search" style={{ flex: 1, maxWidth: 420 }}>
        <Search size={16} />
        <input className="tm-input" placeholder="Buscar candidatos, vagas, recrutadores..." />
      </div>
      <div className="tm-flex tm-items-center tm-gap-2" style={{ marginLeft: "auto" }}>
        <Button variant="ghost" iconOnly icon={<Bell size={18} />} aria-label="Notificações" />
        <Button icon={<Plus size={16} />}>Novo candidato</Button>
      </div>
    </header>
  );
}
