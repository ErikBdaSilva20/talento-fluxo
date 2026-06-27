# Pendências — errors.md

Origem: `errors.md`. Utilitários já criados em `src/lib/utils.ts`:
`formatTelefone`, `isEmailValido`, `hojeUTC3`, `agoraHorarioUTC3`.

---

## 1. CRIAR — `src/components/common/StatusBtn.tsx`

Componente reutilizável com 3 botões inline: **Aprovado** (success), **Reprovado** (destructive), **Adiar** (warning, opcional).

```tsx
interface StatusBtnProps {
  onAprovar: () => Promise<void>;
  onReprovar: () => Promise<void>;
  onAdiar?: () => Promise<void>;
}
```

- Cada botão tem ícone (`CheckCircle2`, `XCircle`, `Clock` do lucide) + texto
- Estado de loading por botão (`"aprovado" | "reprovado" | "adiado" | null`)
- Usar CSS vars: `--color-success`, `--color-destructive`, `--color-warning` com texto branco
- Botões com `padding: 4px 10px`, `border-radius: 6px`, `font-size: 12px`

---

## 2. EDITAR — `src/components/common/AddCandidateModal.tsx`

- Campo **telefone**: ao digitar, chamar `formatTelefone(valor)` de `@/lib/utils` e setar o resultado
- Campo **email**: validar com `isEmailValido(email)` antes de permitir salvar; mostrar erro inline se inválido
- Botão "Criar" deve ficar desabilitado se email inválido

---

## 3. EDITAR — `src/routes/recrutadores.tsx`

- Campo **telefone** no modal: ao digitar, chamar `formatTelefone(valor)` de `@/lib/utils`
- Campo **email**: validar com `isEmailValido` antes de salvar; mostrar erro inline

---

## 4. EDITAR — `src/routes/talentos.tsx`

Remover completamente:
- Estado `selecionados`, `todosSelecionados`, função `toggleTodos`
- Coluna `<th>` de checkbox (primeira coluna da tabela)
- `<td>` com checkbox em cada linha
- O bloco `{selecionados.length > 0 && (...)}` com "Mover etapa / Adicionar tag / Limpar"
- O `onClick` na `<tr>` que abre `CandidateDetailsModal` DEVE ser mantido

---

## 5. EDITAR — `src/routes/entrevistas.tsx`

### 5a. Novos status labels
```ts
const statusEntrevistaLabel = {
  agendada: "Agendada",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  adiado: "Adiado",
};
const statusColor = {
  agendada: "info",
  aprovado: "success",
  reprovado: "danger",   // usar variant que exista
  adiado: "warning",
};
```

### 5b. Validação de data/hora (UTC-3)
No modal "Nova entrevista":
- Importar `hojeUTC3`, `agoraHorarioUTC3` de `@/lib/utils`
- Campo data: `min={hojeUTC3()}`
- Campo horário: `min={form.data === hojeUTC3() ? agoraHorarioUTC3() : undefined}`
- Nota abaixo dos campos de data/hora: `⚠ Horários em UTC-3 (Brasília)`
- No `handleSalvarNova`, validar antes de salvar:
  ```ts
  if (form.data < hojeUTC3()) { setErro("Data no passado."); return; }
  if (form.data === hojeUTC3() && form.horario < agoraHorarioUTC3()) { setErro("Horário já passou."); return; }
  ```

### 5c. StatusBtn na tabela
- Importar `updateEntrevista` de `@/lib/data/entrevistas.repo`
- Importar `StatusBtn` de `@/components/common/StatusBtn`
- Adicionar coluna "Ação" na tabela
- Para entrevistas com status `"agendada"`: mostrar `<StatusBtn>` com:
  - `onAprovar` → `updateEntrevista(e.id, { status: "aprovado" })` → refresh lista
  - `onReprovar` → `updateEntrevista(e.id, { status: "reprovado" })` → refresh lista
  - `onAdiar` → `updateEntrevista(e.id, { status: "adiado" })` → refresh lista
- Para outras (aprovado/reprovado/adiado): mostrar só o Badge de status

---

## 6. EDITAR — `src/routes/pipeline.tsx`

- Importar `StatusBtn` de `@/components/common/StatusBtn`
- No `DraggableCard`, adicionar seção no final do card (abaixo do conteúdo existente):
  ```tsx
  <div onPointerDown={(e) => e.stopPropagation()} style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
    <StatusBtn
      onAprovar={async () => { await updateCandidato(candidato.id, { status: "contratado" }); onStatusChange(); }}
      onReprovar={async () => { await updateCandidato(candidato.id, { status: "arquivado" }); onStatusChange(); }}
    />
  </div>
  ```
- `onPointerDown stopPropagation` é obrigatório para não ativar o drag
- `onStatusChange` é um callback passado do pai para re-buscar a lista (`listCandidatos → setCandidatos`)
- Atualizar `DraggableCard` props para receber `onStatusChange: () => void`

---

## 7. EDITAR — `src/routes/relatorios.tsx`

Gráfico **"Entrevistas realizadas"**:
- Atualmente: `agruparPorMes(entrevistas.map(e => e.data))`
- Mudar para: `agruparPorMes(entrevistas.filter(e => e.status === "aprovado").map(e => e.data))`
- Atualizar subtítulo/tooltip se necessário
