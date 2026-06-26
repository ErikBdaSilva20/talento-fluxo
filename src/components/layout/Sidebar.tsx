import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, KanbanSquare, CalendarDays, UserCog,
  Star, BarChart3, LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";

const navMain = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/talentos", label: "Banco de Talentos", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/entrevistas", label: "Entrevistas", icon: CalendarDays },
];
const navGestao = [
  { to: "/recrutadores", label: "Recrutadores", icon: UserCog },
  { to: "/avaliacoes", label: "Avaliações", icon: Star },
];
const navAnalise = [
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export function Sidebar({
  aberta,
  setAberta,
}: {
  aberta: boolean;
  setAberta: (v: boolean) => void;
}) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const renderItem = (item: typeof navMain[number]) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.exact}
        className={({ isActive }) => `tm-nav-item${isActive ? " active" : ""}`}
        onClick={() => mobile && setAberta(false)}
      >
        <Icon size={18} className="tm-nav-icon" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {mobile && aberta && <div className="tm-sidebar-overlay" onClick={() => setAberta(false)} />}
      <aside className={`tm-sidebar${aberta ? " open" : ""}`}>
        <div className="tm-sidebar-brand">
          <span className="tm-sidebar-brand-mark">T</span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span>Talent Manager</span>
            <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-sidebar-muted)" }}>MasIA</span>
          </div>
        </div>

        <div className="tm-sidebar-section" style={{ flex: 1, overflowY: "auto" }}>
          <div className="tm-sidebar-section-label">Principal</div>
          {navMain.map(renderItem)}
          <div style={{ height: 8 }} />
          <div className="tm-sidebar-section-label">Gestão</div>
          {navGestao.map(renderItem)}
          <div style={{ height: 8 }} />
          <div className="tm-sidebar-section-label">Análise</div>
          {navAnalise.map(renderItem)}
        </div>

        <div className="tm-sidebar-footer">
          <span className="tm-avatar tm-avatar-sm" style={{ background: "oklch(0.45 0.12 165)", color: "white" }}>MR</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "white", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Marina Rocha</div>
            <div style={{ fontSize: 11, color: "var(--color-sidebar-muted)" }}>Gerente de RH</div>
          </div>
          <button className="tm-btn tm-btn-ghost tm-btn-icon" style={{ color: "var(--color-sidebar-muted)" }} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
