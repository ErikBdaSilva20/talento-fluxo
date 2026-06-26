import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Plus, SlidersHorizontal } from "lucide-react";
import { candidatos as allCandidatos } from "@/data/candidatos";
import { statusLabel, statusVariant, senioridadeLabel } from "@/data/pipeline";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatarMoeda, tempoRelativo } from "@/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";

export const Route = createFileRoute("/talentos")({
  head: () => ({
    meta: [
      { title: "Banco de Talentos — Talent Manager" },
      { name: "description", content: "Pesquise, filtre e gerencie todos os candidatos da empresa." },
    ],
  }),
  component: TalentosPage,
});

type SortKey = "nome" | "atualizadoEm" | "pretensaoSalarial";

function TalentosPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [senioridade, setSenioridade] = useState("todos");
  const [cidade, setCidade] = useState("todas");
  const [sort, setSort] = useState<SortKey>("atualizadoEm");
  const [pagina, setPagina] = useState(1);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const porPagina = 8;

  const cidades = useMemo(
    () => Array.from(new Set(allCandidatos.map((c) => c.cidade))).sort(),
    [],
  );

  const filtrados = useMemo(() => {
    let list = [...allCandidatos];
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter((c) =>
        c.nome.toLowerCase().includes(q) ||
        c.cargoPretendido.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
      );
    }
    if (status !== "todos") list = list.filter((c) => c.status === status);
    if (senioridade !== "todos") list = list.filter((c) => c.senioridade === senioridade);
    if (cidade !== "todas") list = list.filter((c) => c.cidade === cidade);

    list.sort((a, b) => {
      if (sort === "nome") return a.nome.localeCompare(b.nome);
      if (sort === "pretensaoSalarial") return b.pretensaoSalarial - a.pretensaoSalarial;
      return b.atualizadoEm.localeCompare(a.atualizadoEm);
    });
    return list;
  }, [busca, status, senioridade, cidade, sort]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const visivel = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);
  const todosSelecionados = visivel.length > 0 && visivel.every((c) => selecionados.includes(c.id));

  const toggleTodos = () => {
    if (todosSelecionados) setSelecionados((sel) => sel.filter((id) => !visivel.find((c) => c.id === id)));
    else setSelecionados((sel) => Array.from(new Set([...sel, ...visivel.map((c) => c.id)])));
  };

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Banco de Talentos</h1>
          <p className="tm-page-subtitle">{filtrados.length} candidato{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}.</p>
        </div>
        <div className="tm-flex tm-gap-2">
          <Button variant="secondary" icon={<SlidersHorizontal size={16} />}>Exportar</Button>
          <Button icon={<Plus size={16} />}>Novo candidato</Button>
        </div>
      </div>

      <div className="tm-card tm-card-pad" style={{ marginBottom: 16 }}>
        <div className="tm-flex tm-gap-3" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
          <SearchBar value={busca} onChange={(v) => { setBusca(v); setPagina(1); }} placeholder="Buscar por nome, cargo ou email..." />
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPagina(1); }} style={{ width: 180 }}>
            <option value="todos">Todos os status</option>
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select value={senioridade} onChange={(e) => { setSenioridade(e.target.value); setPagina(1); }} style={{ width: 160 }}>
            <option value="todos">Toda senioridade</option>
            {Object.entries(senioridadeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select value={cidade} onChange={(e) => { setCidade(e.target.value); setPagina(1); }} style={{ width: 180 }}>
            <option value="todas">Todas as cidades</option>
            {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={{ width: 200 }}>
            <option value="atualizadoEm">Mais recentes</option>
            <option value="nome">Nome (A–Z)</option>
            <option value="pretensaoSalarial">Maior pretensão salarial</option>
          </Select>
        </div>
        {selecionados.length > 0 && (
          <div className="tm-flex tm-items-center tm-gap-3" style={{ marginTop: 12, padding: "8px 12px", background: "var(--color-primary-soft)", borderRadius: 8 }}>
            <strong>{selecionados.length}</strong> selecionados
            <Button size="sm" variant="secondary">Mover etapa</Button>
            <Button size="sm" variant="secondary">Adicionar tag</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelecionados([])}>Limpar</Button>
          </div>
        )}
      </div>

      <div className="tm-table-wrap">
        {visivel.length === 0 ? (
          <EmptyState titulo="Nenhum candidato encontrado" descricao="Ajuste os filtros ou cadastre um novo candidato." />
        ) : (
          <table className="tm-table tm-table-clickable">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" className="tm-checkbox" checked={todosSelecionados} onChange={toggleTodos} onClick={(e) => e.stopPropagation()} />
                </th>
                <th>Candidato</th>
                <th>Cargo pretendido</th>
                <th>Senioridade</th>
                <th>Cidade</th>
                <th>Pretensão</th>
                <th>Status</th>
                <th>Recrutador</th>
                <th style={{ display: "flex", alignItems: "center", gap: 4 }}>Atualizado <ArrowUpDown size={12} /></th>
              </tr>
            </thead>
            <tbody>
              {visivel.map((c) => (
                <tr key={c.id} onClick={() => navigate({ to: "/talentos/$id", params: { id: c.id } })}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox" className="tm-checkbox"
                      checked={selecionados.includes(c.id)}
                      onChange={() => setSelecionados((sel) => sel.includes(c.id) ? sel.filter((x) => x !== c.id) : [...sel, c.id])}
                    />
                  </td>
                  <td>
                    <div className="tm-flex tm-items-center tm-gap-3">
                      <Avatar nome={c.nome} foto={c.foto} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.nome}</div>
                        <div className="tm-muted" style={{ fontSize: 12 }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.cargoPretendido}</td>
                  <td><Badge variant="primary">{senioridadeLabel[c.senioridade]}</Badge></td>
                  <td>{c.cidade} / {c.estado}</td>
                  <td>{formatarMoeda(c.pretensaoSalarial)}</td>
                  <td><Badge variant={statusVariant[c.status] as any} dot>{statusLabel[c.status]}</Badge></td>
                  <td><span className="tm-muted">{c.recrutadorResponsavel}</span></td>
                  <td><span className="tm-muted">{tempoRelativo(c.atualizadoEm)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
      </div>
    </div>
  );
}
