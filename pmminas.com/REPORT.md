# REPORT — pmminas.com

## Metadados
- **Alvo**: https://pmminas.com/
- **Negócio**: "Método OBA — O Básico Aprova" — mentoria/infoproduto para
  concursos PMMG/PPMG/PMESP (PMMINAS NEGÓCIOS DIGITAIS LTDA, CNPJ
  36.899.651/0001-02, Lavras/MG). Fundador: Otávio Luiz de Souza.
- **Tipo**: Web/API + Externo black-box
- **Início**: 2026-08-20T03:01Z
- **Modo**: autônomo total (§13)
- **OPSEC**: Tor (proxychains4), rate limiting, UA rotativo
- **Status**: em andamento — fase 5/6 (enum + webapp + network + cve em paralelo)

## Sumário executivo
Alvo é um infoproduto educacional (mentoria PMMG) com site WordPress
(**PHP 7.4.33 EOL** + Elementor) atrás de Cloudflare, apps React
("Forja OBA") com **2 backends Supabase de signup aberto**, e LMS de alunos
(~5.195) em 3rd party (Tutory). Recon ativo descobriu: **cPanel v134.0.20 +
WHM + Webmail do site principal expostos na internet** via custom port
proxying do CF (185.158.133.1:2083/2087/2096), e um **servidor legado
HostGator (162.241.203.31) vivo sem WAF** com **MySQL 5.7.44 EOL exposto na
3306**, FTP, SMTP em porta 26, cPanel v132.0.7 + WHM. 20 emails OSINT
(2 confirmados) prontos para cred-stuffing.

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| F-012 | **Crítica** | MySQL 5.7.44-48 EOL exposto (3306, sem WAF, multitenant) | 162.241.203.31 | confirmado |
| F-009 | **Alta** | cPanel v134.0.20 + WHM + Webmail do site principal expostos (CF custom ports) | 185.158.133.1:2083/2087/2096 | confirmado |
| F-013 | **Alta** | Servidor legado exposto: FTP/SSH/SMTP:26/POP3/IMAP/BIND sem WAF | 162.241.203.31 | confirmado |
| F-006 | Média | Supabase signup aberto + autoconfirm (2 backends, RLS a validar) | simuladosoba/provaoral | preliminar |
| F-004 | Média | DMARC p=none (email spoofing) | pmminas.com | confirmado |
| F-011 | Média | cPanel v132.0.7 + WHM vivos no legado (sem WAF) | 162.241.203.31:2082/2083/2087 | confirmado |
| F-007 | Baixa/Média | WP: xmlrpc ativo + user enum + wp-json exposto | pmminas.com | preliminar |
| F-003 | Info | 185.158.133.1 = edge CF fora da lista pública (custom ports) | 185.158.133.1 | confirmado |
| F-010 | Info | Edge CF não-listado (anycast custom ports) | 185.158.133.1 | confirmado |
| F-008 | Info | PII concentrada em LMS 3rd party (Tutory) — fora de escopo | mentoria.metodooba.com.br | observado |
| F-INTRO-001 | Info | PHP 7.4.33 EOL + LiteSpeed + hosting BR | pmminas.com | confirmado |
| F-001 | Info | Stack WP+Elementor+LS Cache+ActiveCampaign | pmminas.com | confirmado |
| F-002 | Info | DNS passivo (18 subs, SPF OK, DNSSEC off) | pmminas.com | confirmado |

## Acessos obtidos
*(nenhum — cred-stuffing/brute force em curso na fase webapp/network)*

## Objetivos de alto valor — progresso
| Objetivo | Status |
|----------|--------|
| Acesso interno (foothold) | ⏸ MySQL 3306 + cPanel/WHM = alvos primários |
| Acesso administrativo | ⏸ cPanel/WHM 185 (WHM = root da origem) |
| Acesso financeiro | ⏸ Eduzz/Tutory fora de escopo; checkout WP a mapear |
| PII (usuários/clientes) | ⏸ Supabase RLS a validar; MySQL multitenant |

## Attack surface
Ver `recon/SUMMARY.md` (mapa completo + ranking de payoff).

## Cronologia
Ver `timeline.log`.

## Evidências
`evidence/F-001.txt` … `F-013.txt`, `F-INTRO-001.txt`