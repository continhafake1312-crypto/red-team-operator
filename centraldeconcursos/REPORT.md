# REPORT.md — centraldeconcursos.com.br

> Relatório incremental. Atualizado a cada fase/finding pelo coordenador.

## Metadados
- **Alvo:** centraldeconcursos.com.br
- **URL base:** https://centraldeconcursos.com.br/
- **Tipo:** Web/API + externo black-box
- **Negócio (presumido):** Plataforma de concursos/cursos (Brasil)
- **OPSEC:** Tor + proxychains4; 2Captcha para Cloudflare
- **Início:** 2026-08-27T03:23Z UTC

## Sumário executivo (atualizado 2026-08-27T05:35Z — pós recon)
Recon passivo + ativo concluídos. Attack surface mapeada: 54 subdomínios (44 vivos). Alvo = plataforma Seducar white-label (Nuxt.js + Express/Render) via Cloudflare, com Exchange 2019 on-prem exposto (OWA `/owa/`, versão 15.2.1748.26, 3 SUs de segurança atrasado). Cross-tenant com degraucultural.com.br (outro cliente Seducar). 7 emails confirmados, 6 buckets cloud existentes (privados), DMARC permissivo (spoofable).

**Top achado (CRÍTICO):** Exchange OWA 2019 exposto com 3 SUs de segurança atrasado (Jun/Jul/Ago 2026) — candidates a CVE + cred-stuffing.

**Próximas fases em andamento:** enum (Fase 5), cve (Fase 7 — Exchange), cloud (buckets) em paralelo. Depois webapp (Fase 6).

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| F-001 | Crítica (candidato) | Exchange OWA 2019 exposto + 3 SUs atrasado | mail/pda/pop/webmail → /owa/ | confirmado em recon; CVE/cred validação pendente |
| F-002 | Média | /health info disclosure no API Render | api.centraldeconcursos.com.br | confirmado em recon |
| F-003 | Baixa | buildManifest/buildId rotas vazadas (Seducar apps) | crm/dashboard/staging/etc | confirmado em recon |
| F-004 | Baixa | staging vaza nuxt.config (appDomain cross-tenant) | staging.* | confirmado em recon |
| F-005 | Baixa | CSP vaza Vindi sandbox em prod | apex/staging | confirmado em recon |
| F-006 | Info | DMARC p=none (spoofable) | centraldeconcursos.com.br | confirmado em recon |

## Attack surface consolidada
ver `recon/SUMMARY.md` — ranking de payoff completo (CRÍTICO/ALTO/MÉDIO/BAIXO)

## Acessos obtidos
(nenhum ainda)

## Objetivos de alto valor
1. Acesso interno/foothold — não atingido (vetor: Exchange CVE/cred-stuffing)
2. Acesso administrativo — não atingido (vetor: CRM Seducar auth bypass)
3. Acesso financeiro — não atingido (vetor: carrinho/Vindi)
4. Acesso a dados/PII — não atingido (vetor: API multi-tenant IDOR)

## Cronologia
ver `timeline.log`
