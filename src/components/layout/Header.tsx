import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/common/Button";

interface HeaderProps {
  onAbrirSidebar: () => void;
  onNovoCandidato?: () => void;
}

export function Header({ onAbrirSidebar, onNovoCandidato }: HeaderProps) {
  return (
    <header className="tm-header">
      <button
        className="tm-btn tm-btn-ghost tm-btn-icon"
        onClick={onAbrirSidebar}
        style={{ display: "inline-flex" }}
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>
      <div style={{ flex: 1 }} />
      <Button icon={<Plus size={16} />} onClick={onNovoCandidato}>
        Novo candidato
      </Button>
    </header>
  );
}
