# recon/SUMMARY.md — Attack Surface + Ranking de Payoff

**Alvo:** dsoconcursos.com.br
**Última atualização:** 2026-08-27 (re-validação ativa pós-remediação)
**Pentest original:** 21/07/2026 (CVSS 10.0 — comprometimento total)
**Relatórios fonte:** `prior-report/reports/fase1-recon-report.md`, `01-VULNERABILIDADES.md`
**Re-validação:** `recon/active/ACTIVE.md`

---

## Estado da remediação (resumo)

- **Entry point original (VULN-01 MCP):** ⚠ mitigado externamente pelo Cloudflare WAF (403 em JSON-RPC). Backend não testável via Tor.
- **Cadeia de aplicação (n8n/NPM/Kong no IP real 177.39.18.138):** ✗ remediada — todas as portas fechadas no IP direto; n8n migrado para Cloudflare.
- **Email/SSH/cPanel no 177.39.18.137:** ✗ remediados (portas fechadas).
- **Docker Registry & Cloudreve (201.54.0.48):** ⚠ agora 403 no nível Caddy.
- **Nextcloud (drive) 34.0.0.12:** ✓ inalterado, ainda exposto.
- **WordPress via IP direto (C04):** ⚠ bypass Cloudflare mantido p/ conteúdo (stack inalterada); wp-login/xmlrpc agora 403.
- **Webmail Roundcube (M03):** ✓ inalterado, login exposto.
- **PostgreSQL produção 201.23.74.56:5433 (VULN-05):** ✗ **NÃO REMEDIADO — CRÍTICO — porta aberta à internet.**

---

## Ranking de Payoff (atualizado 27/08/2026)

| Rank | Alvo / Vetor | Severidade | Viabilidade | Owner |
|------|-------------|-----------|-------------|-------|
| 1 | PostgreSQL 201.23.74.56:5433 (VULN-05) — creds VULN-04/02 | CRÍTICA | Alta (porta confirmada aberta; creds a validar) | exploit |
| 2 | Validação de rotação de creds (GitLab CI, S3, LITELLM_MASTER_KEY, PG) | CRÍTICA | Alta (se não rotadas → acesso total) | exploit / osint |
| 3 | WordPress via IP direto (C04) — plugins inalterados | Alta | Média (stack 21/07 mantida; CVEs a reconfirmar) | cve / webapp |
| 4 | Nextcloud 34.0.0.12 (drive.dsoconcursos.com.br) | Média | Média (login exposto; CVEs 34.x) | cve / webapp |
| 5 | LiteLLM (Swagger UI público; master key vazada em VULN-02) | Média | Média (serviço vivo; key a validar) | webapp / exploit |
| 6 | Webmail Roundcube (webmail) — password spraying direcionado | Média | Média (creds OSINT) | webapp |
| 7 | S3 buckets (VULN-03/06/07) — acesso com creds VULN-02 | Média | Média (creds a validar) | cloud / exploit |
| 8 | MCP (VULN-01) — tentar via IP não-Tor | Baixa | Baixa (CF WAF bloqueia) | webapp (opcional) |

---

## Próximas fases

1. **exploit:** testar credenciais documentadas (`prior-report/reports/03-CREDENCIAIS-COMPLETAS.md`) contra PostgreSQL 5433 e S3 (read-only).
2. **cve:** reconfirmar CVEs para Nextcloud 34.0.0.12, WordPress/Site Kit 1.178.0/Elementor 4.0.5, LiteLLM.
3. **webapp:** enumerar Nextcloud, WordPress REST, Webmail; password spraying com threshold.
4. (opcional) Re-validação MCP e hosts CF com IP de saída não-Tor.
