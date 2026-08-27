# Enumeração Profunda — fernandapessoa.com.br

**Gerado:** 2026-08-27T15:00Z
**Fase:** Fase 5 — Enumeração Profunda (Content Discovery, JS Analysis, Param Mining, APIs, CMS)

---

## Sumário Executivo

### 🔴 Crítico — Ação Imediata Recomendada
| Host | Descoberta | Severidade |
|------|-----------|------------|
| `mail.fernandapessoa.com.br` | **6 diretórios com directory listing ativo** | 🔴 Alta |
| `envio.fernandapessoa.com.br` | **Directory listing ativo + CGI-BIN exposto** | 🔴 Alta |
| `whm.fernandapessoa.com.br` | **WHM Login exposto (SEM WAF)** + `/unprotected/` acessível | 🔴 Crítica |
| `app.fernandapessoa.com.br` | **Next.js app — dados de admin vazados no RSC** | 🔴 Alta |
| `webmail.fernandapessoa.com.br` | **Roundcube webmail exposto** | 🟡 Média |

### 🟡 Descobertas Significativas
| Host | Descoberta |
|------|-----------|
| `api.youbiz.com.br` | API rails/storage — blobs expostos (imagens, possíveis docs) |
| `mail.fernandapessoa.com.br` | `xmlrpc.php` + `license.txt` (artefatos WordPress órfãos) |
| `fpessoacloud.fernandapessoa.com.br` | Página default cPanel (provavelmente inativo) |
| `portal.fernandapessoa.com.br` | 403 Forbidden (requer autenticação ou IP específico) |

---

## 1. envio.fernandapessoa.com.br (187.45.185.33)

### Directory Listing — Index of /
```
http://envio.fernandapessoa.com.br/
├── cgi-bin/  (dir, 2026-02-10)  →  403 Forbidden no acesso direto
```

**Arquivos expostos:** Nenhum além do `cgi-bin/` (vazio/protegido).
**Testado:** `cgi-bin/.env`, `cgi-bin/.config`, `cgi-bin/.git-rewrite` — todos 403.
**Scans realizados:**
- `feroxbuster` com wordlist `common.txt` + extensões → só CGI-BIN
- `feroxbuster` com `raft-large-files-lowercase.txt` → 0 resultados adicionais
- `ffuf` via IP real (187.45.185.33) com Host header → 403 no index.php

### Conclusão
Servidor Apache com directory listing, mas sem arquivos além de CGI-BIN vazio. Provavelmente sandbox/placeholder. **Potencial para ShellShock** (CVE-2014-6271) se CGI ativo — testar.

---

## 2. mail.fernandapessoa.com.br (187.45.185.33)

### Directory Listings — 6 diretórios expostos
```
https://mail.fernandapessoa.com.br/
├── arquivos/          → Index of (VAZIO — sem arquivos)
├── material01/        → Index of (VAZIO)
├── material02/        → Index of (VAZIO)
├── interativo/        → Index of (VAZIO)
├── interatividade/    → Index of (VAZIO)
├── matriculas/        → Index of (VAZIO)
├── envio.fernandapessoa.com.br/ → Index of (mesma estrutura do envio)
│   └── cgi-bin/       (espelho do envio)
├── license.txt        → 200 OK (WordPress license — 19KB)
├── xmlrpc.php         → 403 Forbidden
├── cgi-bin/           → 403 Forbidden
```

### WordPress Artifacts
- `license.txt` — licença GPL do WordPress
- `xmlrpc.php` — 403 (não é um WP funcional)
- `wp-login.php` → 404
- `wp-admin/` → 404
- `wp-json/` → 404
- `wp-includes/` → 404
- `wp-content/` → 404

**Conclusão:** Artefatos WP órfãos. O WordPress não está funcional neste host. Os 6 diretórios estão vazios — podem ser configurados para upload futuro.

---

## 3. cpanel.fernandapessoa.com.br:2083

### Status
- Firewall nível conexão detectado (bloqueia scans rápidos)
- Interface cPanel Login confirmada
- Scans com `feroxbuster` (common.txt) e `ffuf` (raft-large) — bloqueados
- Nenhum path adicional descoberto

---

## 4. whm.fernandapessoa.com.br

### Descobertas
| Path | Status | Tamanho |
|------|--------|---------|
| `/` | **200 OK** — WHM Login page | 39KB |
| `/unprotected/` | **500** (erro interno) | 797B |
| `/sharedjs/jstz.min.js` | **200** — JavaScript público | 39KB |
| `/cPanel_magic_revision_*/unprotected/cpanel/*` | **200** — assets estáticos | |

### Pontos de Interesse
- **WHM Login sem WAF** ✅ — prioridade máxima para cred-stuffing
- `/unprotected/` retorna 500 — possível config error / info disclosure
- Sem rate limiting aparente

---

## 5. webmail.fernandapessoa.com.br

### Descobertas
| Path | Status |
|------|--------|
| `/` | **200 OK** — Webmail Login (Roundcube) |
| `/cPanel_magic_revision_*` | 500 — assets cPanel |

- Interface de login Roundcube confirmada
- Firewall moderado (alguns scans bloqueados)
- **CVE-2020-12641** (Roundcube XSS) — verificar versão

---

## 6. app.fernandapessoa.com.br — Next.js App (Cloudflare)

### Dados Extraídos do RSC (React Server Components)

**Estrutura do Aplicativo:**
- Plataforma educacional **"Fernanda Pessoa Grupo Educacional (FPGE)"**
- Portal do Aluno com área administrativa
- Login configurado como `split_screen`
- Domínio de redirect: `portal.fernandapessoa.com.br`

**URLs/APIs Externas Identificadas:**
```
https://api.youbiz.com.br/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsiZGF0YSI6IjNhOTY5NGJhLTdjODEtNDdjOS04YmE4LWQzYWFmY2I3OTQyZiIsInB1ciI6ImJsb2JfaWQifX0=--68c5e01e1f9aac554ded9fab7c3d03ef925e42a0/fernanda-pessoa-grupo-educacional-logo-nominal-roxa.png
https://portal.fernandapessoa.com.br
```

### Módulos Administrativos (extraídos das mensagens i18n):
| Módulo | Funcionalidades |
|--------|-----------------|
| **Pedidos** | CRUD, filtros por ID/produto/status/período, métricas, exportação |
| **Cupons** | CRUD, descontos por tipo/valor |
| **Campanhas** | CRUD, descontos |
| **Recebedores** | Gestão de recebedores de pagamento |
| **Créditos** | Planos de crédito, parcelamento |
| **Certificados** | Modelos de certificado/declaração |
| **Afiliados** | Links de afiliação, comissões |
| **Categorias de Venda** | CRUD |
| **Relatórios de Vendas** | PDF export, métricas |
| **Cursos** | CRUD, tipos (simples/agrupador), ano de referência |
| **Aulas** | CRUD, nível de importância (1-5), tipos |
| **Arquivos** | Upload de vídeo/documento/link/youtube/questão |
| **Shorts** | Conteúdos curtos com YouTube |
| **Produtos** | CRUD, vínculo com cursos |
| **Banners** | CRUD |
| **Comunicados** | Níveis: conteúdo/ao vivo/informativo/urgente |
| **Documentos** | Upload/download |
| **Formulários** | Tipos: cadastro/pesquisa |
| **Questões** | CRUD, áreas de conhecimento, disciplinas, tópicos, bancas |
| **Áreas de Conhecimento** | CRUD |
| **Categorias Pedagógicas** | CRUD, cores, slug |
| **Bancas Examinadoras** | CRUD |
| **Concursos** | CRUD |
| **Disciplinas** | CRUD, hierarquia (organização → escola) |
| **Tópicos** | CRUD, vínculo com disciplinas |
| **Simulados** | CRUD, questões, conclusões |
| **Fichas de Exercícios** | CRUD |
| **Pacotes de Simulados** | CRUD |
| **Alunos** | CRUD, acesso como aluno |
| **Usuários** | CRUD, perfis de acesso |
| **Matrículas** | CRUD, métricas, exportação, dashboard |
| **Perfis de Acesso** | admin/student/teacher/corrector/custom |
| **Solicitações de Dados** | LGPD — exportação/exclusão |
| **Plano de Estudos** | Acompanhamento de alunos |
| **Rotina de Alunos** | Progresso por trilha |
| **Auditoria de Vídeo** | Sessões de visualização |
| **Redações** | Categorias, propostas, níveis de correção, correção |
| **Recursos** | Categorias, exames, níveis de correção |
| **Links** | Short links com métricas de clique |

### API Endpoints
- API externa: `api.youbiz.com.br` (Rails Active Storage)
- Blobs armazenados com tokens Signed ID (potencial IDOR se não validado)
- Nenhum endpoint `/api/` direto no app encontrado (bloqueado por Cloudflare)

### Build Manifest (Next.js)
- RSC chunks: `12cls71nrexkr.js`, `3dz2yvnts4sd3.js`, `3nh2a_caqjpgk.js`, `0q--m2cp6v97q.js`, `2ul_ne-zg42xg.js`, `3pmfoeou-axyg.js`
- CSS chunks: `18tt3vdu3p_25.css`, `27xqpaawy-t7g.css`
- Hash de build: `pzt0tD_3Fq-ohSZD7p7hD`

---

## 7. fpessoacloud.fernandapessoa.com.br

- Página: Default cPanel (`/cgi-sys/defaultwebpage.cgi`)
- Scan ffuf com raft-large: **42 resultados, todos 403**
- Conclusão: Servidor cPanel sem site configurado (placeholder)

---

## 8. WPScan Results

### loja.fernandapessoa.com.br (WooCommerce)
- **Primeiro scan:** Bloqueado por WAF (403)
- **Segundo scan (--random-user-agent):** Sem resultados — Cloudflare bloqueou

### matriculas.fernandapessoa.com.br (WP 7.0.1)
- Bloqueado por WAF

### fernandapessoa.com.br (WP 7.1 Principal)
- Bloqueado por Cloudflare mesmo com --random-user-agent e --force

---

## 9. Descobertas Adicionais

### API youbiz.com.br
- **URL:** `https://api.youbiz.com.br`
- **Framework:** Ruby on Rails (Active Storage)
- **Blobs expostos:** Imagens de logo e capas
- **Potencial:** Se os Signed IDs não tiverem validação de escopo, pode haver **IDOR** para download de outros arquivos
- `rails/active_storage/blobs/redirect/` — endpoint padrão Rails

---

## 10. Recomendações de Ataque Imediato

### 🔴 Prioridade Máxima
1. **WHM Cred-stuffing** — `whm.fernandapessoa.com.br` (SEM WAF)
   - Testar creds padrão cPanel: `root`, `admin`, `teste`, `fernanda`
   - Wordlist: common cPanel creds + `root:senha123`, `root:fernandapessoa`
2. **envio CGI-BIN ShellShock test** — `http://envio.fernandapessoa.com.br/cgi-bin/`
3. **mail directory listing monitoring** — arquivos podem aparecer a qualquer momento

### 🟡 Prioridade Alta
4. **Webmail cred-stuffing** — `webmail.fernandapessoa.com.br` (Roundcube)
   - CVE-2020-12641 / CVE-2021-44026 (RCE) se versão vulnerável
5. **Next.js API enumeration** via IP real (187.45.185.33) com Host header
   - `curl -H "Host: app.fernandapessoa.com.br" https://187.45.185.33/api/...`
6. **youbiz.com.br API IDOR test** — Signed IDs nos blobs
   - Testar variações de IDs nos blobs
7. **cPanel cred-stuffing** — Porta 2083 (firewall, mas tentável)

### 🟢 Média
8. **Portal discovery** — `portal.fernandapessoa.com.br` (403, mas investigar bypass)
9. **WPScan via IP real** com `--resolve` para bypass Cloudflare

---

## Artefatos Salvos

| Arquivo | Descrição |
|---------|-----------|
| `envio_feroxbuster.txt` | Scan feroxbuster envio (common.txt) |
| `envio_ferox_raft.txt` | Scan feroxbuster envio (raft-large) |
| `envio_ip_direct.json` | ffuf via IP real (187.45.185.33) |
| `mail_ffuf_raft.json` | ffuf mail (raft-large) |
| `cpanel_feroxbuster.txt` | Scan cPanel (bloqueado) |
| `whm_feroxbuster.txt` | Scan WHM |
| `webmail_feroxbuster.txt` | Scan webmail |
| `mail_dirs/arquivos_listing.html` | Listing /arquivos/ |
| `mail_dirs/material01_listing.html` | Listing /material01/ |
| `mail_dirs/material02_listing.html` | Listing /material02/ |
| `mail_dirs/interativo_listing.html` | Listing /interativo/ |
| `mail_dirs/interatividade_listing.html` | Listing /interatividade/ |
| `mail_dirs/matriculas_listing.html` | Listing /matriculas/ |
| `app/buildManifest.js` | Next.js build (via proxy — Cloudflare challenge) |
| `app/buildManifest_direct.js` | Next.js page source (via direct — RSC data) |
| `app/buildManifest_dev.js` | Next.js dev manifest (via proxy) |
| `app/app_api.json` | ffuf API endpoints (0 results — Cloudflare) |
| `app/nextjs_debug.txt` | Next.js debug endpoint |
| `fpessoacloud/fpessoacloud_index.html` | Página default cPanel |
| `fpessoacloud/fpessoacloud_ffuf.json` | Scan fpessoacloud |
| `wpscan/wpscan_loja2.txt` | WPScan loja (bloqueado) |
| `wpscan/wpscan_loja.txt` | WPScan loja (anterior) |
| `wpscan/wpscan_matriculas.txt` | WPScan matriculas |

---

## Timeline

- [2026-08-27T14:40Z] Iniciada enumeração profunda
- [2026-08-27T14:42Z] app.fernandapessoa.com.br: RSC data extraído (admin modules, API youbiz)
- [2026-08-27T14:47Z] mail.fernandapessoa.com.br: 6 dir listings + WordPress artifacts coletados
- [2026-08-27T14:52Z] fpessoacloud: Página default cPanel confirmada
- [2026-08-27T14:59Z] WPScan: todos bloqueados por Cloudflare
- [2026-08-27T15:00Z] ENUM.md consolidado