# Relatório de Mudanças — Sistema de Delegação Aninhada entre Subagentes

**Data:** 2026-08-26  
**Autor:** Creator (agente primário)  
**Objetivo:** Habilitar delegação aninhada (subagente → subagente) no framework de pentest autônomo, permitindo que especialistas subdeleguem subfases entre si para agilizar engagements sem voltar ao coordenador.

---

## 1. Problema Identificado

Os subagentes do framework não conseguiam usar a ferramenta `task` para delegar trabalho a outros subagentes. Quando um subagente tentava chamar `task`, a ferramenta simplesmente não existia no seu toolset. A delegação era **flat** — só o coordenador primário (`pentest`) podia lançar subagentes; subagentes não podiam lançar outros subagentes.

Isso ia contra o design descrito no `AGENTS.md`, que previa cadeias como `recon-passive → osint` e `webapp → exploit`.

## 2. Análise do Binário do opencode

Investigação direta no binário compilado (`~/.opencode/bin/opencode`, ELF 64-bit, ~184 MB) via `strings` revelou **dois mecanismos independentes** que bloqueavam a delegação aninhada:

### Bloqueio 1: Permissão `task` injetada como `deny`

Função `lt(o)` no core do opencode:

```js
function lt(o) {
  let e = o.subagent.permission.some((t) => t.permission === "task");
  let r = o.subagent.permission.some((t) => t.permission === "todowrite");
  return [
    ...o.parentSessionPermission.filter(...),
    ...r ? [] : [{ permission: "todowrite", pattern: "*", action: "deny" }],
    ...e ? [] : [{ permission: "task", pattern: "*", action: "deny" }]
  ];
}
```

**Lógica:** quando um subagente sobe, o opencode verifica se a lista de permissões do agente contém alguma regra mencionando `task`. Se **não** tiver → injeta `task: deny` automaticamente → a tool desaparece do toolset do subagente. Mesma coisa para `todowrite`.

O `general` (built-in) e os 12 subagentes customizados só tinham `*: allow` genérico — nenhuma regra explícita mencionando `task`. Resultado: `task: deny` injetado em todos.

### Bloqueio 2: `subagent_depth` limitado a 1

```js
subagent_depth: D.optional(c).annotate({
  description: "Maximum subagent nesting depth. Defaults to 1,
                which prevents subagents from launching subagents."
})
```

Mensagem de erro ao tentar delegar de dentro de um subagente:
```
Subagent depth limit reached (1). Increase "subagent_depth" to allow nested subagents.
```

O default = 1 significa: primário (nível 0) → subagente (nível 1), e o subagente **não pode** lançar outro.

### Bloqueio 3: `experimental.primary_tools` (falsa pista)

Encontrado também no binário:
```js
primary_tools: D.optional(D.mutable(D.Array(D.String))).annotate({
  description: "Tools that should only be available to primary agents."
})
```

Investigação revelou que o default já é `[]` (array vazio) — é um mecanismo **adicional** que vira regras deny extra, não o gating principal de `task`. Setar `primary_tools: []` foi **no-op**.

## 3. Correções Aplicadas

### Correção 1 — `task: allow` no frontmatter dos 12 subagentes

Adicionado `task: allow` na seção `permission:` do frontmatter de cada subagente customizado:

| Arquivo | Antes | Depois |
|---|---|---|
| `.opencode/agent/recon-passive.md` | sem `task` | `task: allow` |
| `.opencode/agent/recon-active.md` | sem `task` | `task: allow` |
| `.opencode/agent/osint.md` | sem `task` | `task: allow` |
| `.opencode/agent/enum.md` | sem `task` | `task: allow` |
| `.opencode/agent/webapp.md` | sem `task` | `task: allow` |
| `.opencode/agent/cve.md` | sem `task` | `task: allow` |
| `.opencode/agent/exploit.md` | sem `task` | `task: allow` |
| `.opencode/agent/postex.md` | sem `task` | `task: allow` |
| `.opencode/agent/cloud.md` | sem `task` | `task: allow` |
| `.opencode/agent/network.md` | sem `task` | `task: allow` |
| `.opencode/agent/report.md` | sem `task` | `task: allow` |
| `.opencode/agent/screenshots.md` | sem `task` | `task: allow` |

**Efeito:** a função `lt(o)` agora encontra uma menção a `task` → `e = true` → o deny não é injetado → `task` aparece no toolset.

### Correção 2 — `subagent_depth: 10` no config global

`~/.config/opencode/opencode.jsonc`:
```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "subagent_depth": 10
}
```

**Efeito:** permite cadeias de até 10 níveis de profundidade (primário → sub1 → sub2 → ... → sub10).

### Correção 3 — Override do `general` built-in

O `general` (built-in do opencode) não é um arquivo `.md` editável — suas permissões são definidas no core. Para liberar `task` nele, adicionamos override no config:

`~/.config/opencode/opencode.jsonc`:
```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "subagent_depth": 10,
  "agent": {
    "general": {
      "permission": {
        "task": "allow",
        "todowrite": "allow"
      }
    }
  }
}
```

**Efeito:** o opencode faz deep-merge no built-in `general`, adicionando as regras `task: allow` e `todowrite: allow` sem tocar no resto (descrição, prompt, mode).

### Correção 4 — Adaptação do comando `/pentest` e do agente `pentest`

**`.opencode/command/pentest.md`:**
- Antes: "delegue via `task` com **SEMPRE `subagent_type: general`**"
- Depois: "delegue via `task` com **`subagent_type: <especialista>`**" + cadeias aninhadas documentadas

**`.opencode/agent/pentest.md`:**
- Seção "Delegação para subagentes" reescrita
- Adicionada seção "Delegação aninhada (subagente → subagente)" com tabela de cadeias recomendadas:
  - `recon-passive → osint, cloud`
  - `enum → webapp`
  - `webapp → exploit, cve`
  - `cve → exploit`
  - `exploit → postex`
  - `network → exploit`

## 4. Validação

### Teste 1 — `recon-passive` delegando para `general`
- **Status:** ✅ Funcionou
- `task` presente no toolset do recon-passive
- Subagente interno (general, nível 2) executou `webfetch` na Wikipedia + docs oficiais do Roblox
- Output completo retornado verbatim

### Teste 2 — `general` (built-in) delegando para `general`
- **Status:** ✅ Funcionou (após override no config)
- `task` + `todowrite` presentes no toolset do general
- Cadeia: creator → general (nível 1) → general (nível 2)
- Output completo retornado

### Cadeia validada:
```
creator (primário, nível 0)
  └── recon-passive (subagente, nível 1)
        └── general (subagente, nível 2) ← pesquisou Roblox
```

## 5. Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `.opencode/agent/recon-passive.md` | `+task: allow` |
| `.opencode/agent/recon-active.md` | `+task: allow` |
| `.opencode/agent/osint.md` | `+task: allow` |
| `.opencode/agent/enum.md` | `+task: allow` |
| `.opencode/agent/webapp.md` | `+task: allow` |
| `.opencode/agent/cve.md` | `+task: allow` |
| `.opencode/agent/exploit.md` | `+task: allow` |
| `.opencode/agent/postex.md` | `+task: allow` |
| `.opencode/agent/cloud.md` | `+task: allow` |
| `.opencode/agent/network.md` | `+task: allow` |
| `.opencode/agent/report.md` | `+task: allow` |
| `.opencode/agent/screenshots.md` | `+task: allow` |
| `.opencode/agent/pentest.md` | Seção delegação reescrita + cadeias aninhadas |
| `.opencode/command/pentest.md` | `subagent_type` por nome + cadeias aninhadas |
| `RELATORIO_DELEGACAO.md` | Este relatório (novo) |

**Nota:** `~/.config/opencode/opencode.jsonc` (config global, fora do repo) também foi modificado com `subagent_depth: 10` + override do `general`.

## 6. Impacto no Framework de Pentest

- **Antes:** Delegação flat — só o coordenador `pentest` podia lançar subagentes. Cada micro-decisão exigia volta ao coordenador.
- **Depois:** Delegação aninhada — especialistas subdelegam subfases entre si. Ex.: `recon-passive` descobre subdomínios → delega OSINT para `osint` e validação de buckets para `cloud` sem voltar ao coordenador. `webapp` confirma vuln → delega CVE research para `cve` e PoC para `exploit`.
- **Resultado:** Engagements mais rápidos, menos round-trips ao coordenador, mesma consolidação final.
