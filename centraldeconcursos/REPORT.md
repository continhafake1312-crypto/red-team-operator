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

**Top achado (CRÍTICO):** Exchange OWA 2019 exposto com **4 SUs de segurança atrasado** (Fev/Jun/Jul/Ago 2026 — corrigido pelo cve research: Feb26SU KB5074993 também faltante). Chains históricas (ProxyShell/ProxyNotShell/ProxyLogon/CVE-2024-21410) TODAS patched em CU15 May25HU. CVEs aplicáveis (não patchados): **CVE-2026-55008** (CVSS 9.6, pre-auth XSS scope CHANGED) é o destaque crítico, + CVE-2026-45504/55005/62913 (8.8 post-auth EoP/RCE), CVE-2026-62911 (8.0 capture-replay), CVE-2026-47631/45500/21527 (pre-auth XSS/spoofing). Pré-requisito comum: cred-stuffing OWA (7 emails confirmados). Detalhes em `exploit/cve_research.md`.

**Cloud (concluído):** 0 findings contra o alvo — buckets "cdc/concursos" eram falsos-positivos (GCP geo-bloqueia Tor) ou de terceiros (GCP `concursos` = loteria). Alvo não usa cloud storage.

**Próximas fases em andamento:** enum (Fase 5), cve (Fase 7 — Exchange), cloud (buckets) em paralelo. Depois webapp (Fase 6).

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| F-001 | Crítica (candidato) | Exchange OWA 2019 exposto + 4 SUs atrasado — CVE-2026-55008 (pre-auth XSS 9.6) + 8 CVEs aplicáveis | mail/pda/pop/webmail → /owa/ | confirmado em recon; CVE/cred validação pendente |
| F-002 | Média | /health info disclosure no API Render | api.centraldeconcursos.com.br | confirmado em recon |
| F-003 | Baixa | buildManifest/buildId rotas vazadas (Seducar apps) | crm/dashboard/staging/etc | confirmado em recon |
| F-004 | Baixa | staging vaza nuxt.config (appDomain cross-tenant) | staging.* | confirmado em recon |
| F-005 | Baixa | CSP vaza Vindi sandbox em prod | apex/staging | confirmado em recon |
| F-006 | Info | DMARC p=none (spoofable) | centraldeconcursos.com.br | confirmado em recon |

### Cloud findings (especialista cloud — 2026-08-27T14:55Z)

| ID | Severidade | Título | Recurso | Status |
|----|-----------|--------|---------|--------|
| C-001 | Info (fora de escopo) | GCP bucket `concursos` publicamente listável (180 JSONs de loteria, 230 MB) | storage.googleapis.com/concursos | confirmado — **terceiro (loteria), NÃO do alvo** |

**Notas cloud:**
- Re-validação Tor-vs-direta revelou que a maioria dos "buckets existentes" da fase passiva era **falso-positivo** (GCP geo-bloqueia Tor → 403 genérico → na verdade 404). Apenas 4 buckets GCP realmente existem (cdc, cdc-prod, cdc-dev privados; concursos público-mas-de-terceiro).
- Nenhum bucket `centraldeconcursos*` existe em qualquer provider (GCP/Azure/S3). O alvo **não referencia cloud storage** em site/wayback.
- 6 buckets S3 genéricos (concursos, cdc-backup, cdc-prod, cdc-dev, cdc-media, cdc-assets) existem & são privados — ownership não atribuível ao alvo.
- Azure: contas `cdc`/`concursos` existem mas 24 containers comuns = 404. Privado/locked-down.
- IAM: 0 chaves/credenciais/signed-URL cloud vazadas no corpus wayback (1.958 JS + 50.418 URLs).
- **Conclusão cloud: 0 findings contra o alvo.** Detalhes em `recon/passive/cloud_buckets_object_level.txt` + `evidence/C-001.txt`.

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
