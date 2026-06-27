import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Plus } from "lucide-react";
import { listCandidatos, type Candidato } from "@/lib/data/candidatos.repo";
import { statusLabel, statusVariant, senioridadeLabel } from "@/data/pipeline";
import { SearchBar } from "@/components/common/SearchBar";
import { Select } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { AddCandidateModal } from "@/components/common/AddCandidateModal";
import { CandidateDetailsModal } from "@/components/common/CandidateDetailsModal";

type SortKey = "nome" | "updated_at" | "pretensao_salarial";

function formatarMoeda(v: number | null) {
  if (!v) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Hoje";
  if (d === 1) return "Ontem";
  if (d < 30) return `${d} dias atrás`;
  const m = Math.floor(d / 30);
  return `${m} ${m === 1 ? "mês" : "meses"} atrás`;
}

export default function TalentosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [senioridade, setSenioridade] = useState("todos");
  const [cidade, setCidade] = useState("todas");
  const [sort, setSort] = useState<SortKey>("updated_at");
  const [pagina, setPagina] = useState(1);
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null);
  const porPagina = 8;

  useEffect(() => {
    listCandidatos()
      .then(setCandidatos)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const cidades = useMemo(
    () => Array.from(new Set(candidatos.map((c) => c.cidade).filter(Boolean) as string[])).sort(),
    [candidatos],
  );

  const filtrados = useMemo(() => {
    let list = [...candidatos];
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          (c.cargo_pretendido ?? "").toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      );
    }
    if (status !== "todos") list = list.filter((c) => c.status === status);
    if (senioridade !== "todos") list = list.filter((c) => c.senioridade === senioridade);
    if (cidade !== "todas") list = list.filter((c) => c.cidade === cidade);

    list.sort((a, b) => {
      if (sort === "nome") return a.nome.localeCompare(b.nome);
      if (sort === "pretensao_salarial") return (b.pretensao_salarial ?? 0) - (a.pretensao_salarial ?? 0);
      return b.updated_at.localeCompare(a.updated_at);
    });
    return list;
  }, [candidatos, busca, status, senioridade, cidade, sort]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const visivel = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  if (carregando) {
    return (
      <div className="tm-page">
        <div className="tm-page-header">
          <h1 className="tm-page-title">Banco de Talentos</h1>
        </div>
        <div className="tm-flex tm-flex-col tm-gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={48} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page">
      <div className="tm-page-header">
        <div>
          <h1 className="tm-page-title">Banco de Talentos</h1>
          <p className="tm-page-subtitle">
            {filtrados.length} candidato{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModalAdicionar(true)}>Novo candidato</Button>
      </div>

      <div className="tm-card tm-card-pad" style={{ marginBottom: 16 }}>
        <div className="tm-flex tm-gap-3" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
          <SearchBar
            value={busca}
            onChange={(v) => { setBusca(v); setPagina(1); }}
            placeholder="Buscar por nome, cargo ou email..."
          />
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
            <option value="updated_at">Mais recentes</option>
            <option value="nome">Nome (A–Z)</option>
            <option value="pretensao_salarial">Maior pretensão salarial</option>
          </Select>
        </div>
      </div>

      <div className="tm-table-wrap">
        {visivel.length === 0 ? (
          <EmptyState titulo="Nenhum candidato encontrado" descricao="Ajuste os filtros ou cadastre um novo candidato." />
        ) : (
          <table className="tm-table tm-table-clickable">
            <thead>
              <tr>
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
                <tr key={c.id} onClick={() => setCandidatoSelecionado(c)}>
                  <td>
                    <div className="tm-flex tm-items-center tm-gap-3">
                      <Avatar nome={c.nome} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.nome}</div>
                        <div className="tm-muted" style={{ fontSize: 12 }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.cargo_pretendido ?? "—"}</td>
                  <td>
                    {c.senioridade
                      ? <Badge variant="primary">{senioridadeLabel[c.senioridade] ?? c.senioridade}</Badge>
                      : <span className="tm-muted">—</span>}
                  </td>
                  <td>{c.cidade ? `${c.cidade}${c.estado ? ` / ${c.estado}` : ""}` : "—"}</td>
                  <td>{formatarMoeda(c.pretensao_salarial)}</td>
                  <td><Badge variant={statusVariant[c.status] as any} dot>{statusLabel[c.status] ?? c.status}</Badge></td>
                  <td><span className="tm-muted">{c.recrutador_nome ?? "—"}</span></td>
                  <td><span className="tm-muted">{tempoRelativo(c.updated_at)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
      </div>

      <AddCandidateModal
        aberto={modalAdicionar}
        onFechar={() => setModalAdicionar(false)}
        onCriado={setCandidatos}
      />

      <CandidateDetailsModal
        candidato={candidatoSelecionado}
        onFechar={() => setCandidatoSelecionado(null)}
      />
    </div>
  );
}
