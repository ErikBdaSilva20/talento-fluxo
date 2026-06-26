import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, KanbanSquare, CalendarDays, UserCog,
  Star, Tag, BarChart3, Settings, LogOut, ChevronsLeft, ChevronsRight,
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
  { to: "/tags", label: "Tags", icon: Tag },
];
const navAnalise = [
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({
  aberta,
  setAberta,
}: {
  aberta: boolean;
  setAberta: (v: boolean) => void;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const renderItem = (item: typeof navMain[number]) => {
    const Icon = item.icon;
    const active = isActive(item.to, item.exact);
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`tm-nav-item ${active ? "active" : ""}`}
        onClick={() => mobile && setAberta(false)}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={18} className="tm-nav-icon" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {mobile && aberta && <div className="tm-sidebar-overlay" onClick={() => setAberta(false)} />}
      <aside className={`tm-sidebar ${collapsed && !mobile ? "collapsed" : ""} ${aberta ? "open" : ""}`}>
        <div className="tm-sidebar-brand">
          <span className="tm-sidebar-brand-mark">T</span>
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span>Talent Manager</span>
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-sidebar-muted)" }}>MasIA</span>
            </div>
          )}
        </div>

        <div className="tm-sidebar-section" style={{ flex: 1, overflowY: "auto" }}>
          {!collapsed && <div className="tm-sidebar-section-label">Principal</div>}
          {navMain.map(renderItem)}
          <div style={{ height: 8 }} />
          {!collapsed && <div className="tm-sidebar-section-label">Gestão</div>}
          {navGestao.map(renderItem)}
          <div style={{ height: 8 }} />
          {!collapsed && <div className="tm-sidebar-section-label">Análise</div>}
          {navAnalise.map(renderItem)}
        </div>

        <div className="tm-sidebar-footer">
          <span className="tm-avatar tm-avatar-sm" style={{ background: "oklch(0.45 0.12 165)", color: "white" }}>MR</span>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "white", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Marina Rocha</div>
              <div style={{ fontSize: 11, color: "var(--color-sidebar-muted)" }}>Gerente de RH</div>
            </div>
          )}
          {!mobile && (
            <button
              className="tm-btn tm-btn-ghost tm-btn-icon"
              style={{ color: "var(--color-sidebar-muted)" }}
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expandir" : "Recolher"}
            >
              {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </button>
          )}
          {!collapsed && !mobile && (
            <button className="tm-btn tm-btn-ghost tm-btn-icon" style={{ color: "var(--color-sidebar-muted)" }} title="Sair">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
