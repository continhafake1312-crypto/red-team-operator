# REPORT — pmminas.com

## Metadados
- **Alvo**: https://pmminas.com/
- **Tipo**: Web/API + Externo black-box
- **Início**: 2026-08-20T03:01Z
- **Modo**: autônomo total (§13)
- **OPSEC**: Tor exit 185.220.100.254 (proxychains4), rate limiting, UA rotativo
- **Status**: em andamento

## Sumário executivo
Engagement iniciado. Recon em curso. *(atualizar a cada fase)*

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| — | — | *(nenhum finding ainda)* | — | — |

## Acessos obtidos
*(nenhum)*

## Findings (resumo incremental)

### Info
- **F-INTRO-001** [Info] — Cloudflare + LiteSpeed + PHP 7.4.33 EOL.
  → `evidence/F-INTRO-001.txt`
- **F-001** [Info → vetor crítico] — WordPress + Elementor Pro 4.2.3 +
  LiteSpeed Cache + xmlrpc + wp-json + ActiveCampaign + gateway de pagamento.
  → `evidence/F-001.txt`
- **F-002** [Info] — DNS passivo: 18 subdomínios descobertos
  (subfinder), MX Google Workspace, SPF `_spf.google.com -all` (hard
  fail OK), **DMARC `p=none`** (sem enforcement → spoofing possível).
  DNSSEC unsigned. Email admin: `contato@pmminas.com`. Multitenant:
  `g2lavras.com.br.pmminas.com`. → `evidence/F-002.txt`

## Objetivos de alto valor — progresso
| Objetivo | Status |
|----------|--------|
| Acesso interno (foothold) | ⏸ |
| Acesso administrativo | ⏸ |
| Acesso financeiro | ⏸ |
| PII (usuários/clientes) | ⏸ |

## Cronologia
Ver `timeline.log`.

## Evidências
Ver `evidence/`.