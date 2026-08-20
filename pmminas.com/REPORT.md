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
- **Status**: em andamento — fase 3 (recon ativo)

## Sumário executivo
Alvo é um infoproduto educacional (mentoria PMMG) com site WordPress
(PHP 7.4.33 **EOL** + Elementor) atrás de Cloudflare, apps React
("Forja OBA") com backend **Supabase de signup aberto**, e LMS de alunos
(~5.195) em 3rd party (Tutory). Recon passivo identificou IP de origem
não-CF (185.158.133.1), IPs cPanel históricos, 20 emails (2 confirmados)
e 5 cred-stuffing candidates. Recon ativo em curso.

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| F-006 | Média | Supabase signup aberto + autoconfirm (RLS a validar) | simuladosoba.pmminas.com | preliminar |
| F-004 | Média | DMARC p=none (email spoofing) | pmminas.com | confirmado |
| F-007 | Baixa/Média | WP: xmlrpc ativo + user enum + wp-json exposto | pmminas.com | preliminar |
| F-003 | Info | IP origem não-CF (relay FRA 185.158.133.1) | provaoral/simuladosoba | confirmado |
| F-005 | Info | IPs cPanel históricos (vhost scan pendente) | 162.241.203.31 / 177.154.191.198 | preliminar |
| F-008 | Info | PII concentrada em LMS 3rd party (Tutory) — fora de escopo | mentoria.metodooba.com.br | observado |
| F-INTRO-001 | Info | PHP 7.4.33 EOL + LiteSpeed + hosting BR | pmminas.com | confirmado |
| F-001 | Info | Stack WP+Elementor+LS Cache+ActiveCampaign | pmminas.com | confirmado |
| F-002 | Info | DNS passivo (18 subs, SPF OK, DNSSEC off) | pmminas.com | confirmado |

## Acessos obtidos
*(nenhum)*

## Objetivos de alto valor — progresso
| Objetivo | Status |
|----------|--------|
| Acesso interno (foothold) | ⏸ recon ativo em curso (185.158.133.1) |
| Acesso administrativo | ⏸ cred-stuffing candidates prontos (5) |
| Acesso financeiro | ⏸ Eduzz/Tutory checkout mapeados (fora escopo) |
| PII (usuários/clientes) | ⏸ Supabase RLS a validar; Tutory fora de escopo |

## Attack surface (resumo — ver recon/SUMMARY.md quando pronto)
- **Apex/www** (CF): WordPress + Elementor + xmlrpc + wp-json
- **provaoral/simuladosoba** (185.158.133.1 via CF relay): Forja OBA (React) + Supabase
- **stape/pixel** (3rd party analytics): fora de escopo
- **162.241.203.31 / 177.154.191.198**: cPanel histórico (vhost scan)
- **Tutory/Eduzz**: 3rd party, fora de escopo

## Cronologia
Ver `timeline.log`.

## Evidências
`evidence/F-001.txt` … `evidence/F-008.txt`, `evidence/F-INTRO-001.txt`