# PLAN — elprofessordaoratoria.com.br

## Plano de Execução (ordem emergente)

| Fase | Especialista | Status | Notas |
|------|-------------|--------|-------|
| 1. Escopo + Setup | Coordenador | ✅ Concluído | Estrutura criada |
| 2. Recon Passivo + OSINT | recon-passive | ✅ Concluído | 14 subs, 5 IPs reais, Portainer/n8n/MinIO/Supabase/Odoo/Dify/Baserow descobertos |
| 3. Recon Ativo | recon-active | ⏳ Pendente | Portscan/fingerprint/vhosts/WAF — delegado |
| 4. Consolidar Attack Surface | Coordenador | ⏳ Pendente | recon/SUMMARY.md + ranking payoff |
| 5. Enumeração Profunda | enum | ⏳ Pendente | Content discovery/JS/API/CMS |
| 6. Ataque Webapp | webapp | ⏳ Pendente | OWASP Top 10 |
| 7. CVE Research | cve | ⏳ Pendente | Mapear CVEs por versão |
| 8. Exploit Validation | exploit | ⏳ Pendente | Validar PoCs/creds |
| 9. Pós-Exploração | postex | ⏳ Pendente | Se foothold |
| 10. Relatório | report | ⏳ Pendente | REPORT.md final |

## Ranking de Payoff (atualizado via recon passivo — 2026-08-20)

| # | Vetor | Payoff | Status | Notas |
|---|-------|--------|--------|-------|
| 1 | **Portainer** (portainer.elprofessordaoratoria.com.br) | **CRÍTICO** | Pendente | Docker UI exposto — default creds → container escape → RCE |
| 2 | **n8n** (infra novadimensaodigital) | **CRÍTICO** | Pendente | RCEs conhecidos (CVE-2023-...), creds default |
| 3 | **MinIO** (infra novadimensaodigital) | **ALTO** | Pendente | S3 interno exposto — access key default? |
| 4 | **Supabase** (infra novadimensaodigital) | **ALTO** | Pendente | Backend Firebase-like — default creds? |
| 5 | **Odoo** (infra novadimensaodigital) | **ALTO** | Pendente | ERP exposto — CVEs conhecidos |
| 6 | **Mautic** (mautic.elprofessordaoratoria.com.br) | **ALTO** | Pendente | Marketing automation — creds default, CVE research |
| 7 | **Dify / Baserow** (infra novadimensaodigital) | **ALTO** | Pendente | AI platform + no-code DB — CVEs? |
| 8 | **API GCP** (api.elprofessordaoratoria.com.br) | **MÉDIO** | Pendente | 400 Bad Request — fuzzing endpoints |
| 9 | **FTP** (ftp.elprofessordaoratoria.com.br) | **MÉDIO** | Pendente | Anônimo? Brute force |
| 10 | **WordPress** (main site) | **MÉDIO** | Pendente | Elementor/Yoast CVEs, wp-admin enum |
| 11 | **Subdomain takeover** | **BAIXO** | Pendente | Candidates fracos |
| 12 | **DMARC p=none** | **BAIXO** | Pendente | Spoofing possível |

## Backlog de Vetores (pausados com gatilho)

| Vetor | Pausado | Motivo | Gatilho de Retorno |
|-------|---------|--------|---------------------|
| SQLi / NoSQLi | Pré-recon | Aguardando enum de endpoints | Após enum/webapp |
| IDOR / BOLA | Pré-recon | Aguardando enum de APIs | Após enum/webapp |
| SSRF | Pré-recon | Aguardando parâmetros de URL | Após enum/webapp |
| XSS | Pré-recon | Aguardando inputs | Após enum/webapp |

## Decisões de Pivot

Nenhuma ainda.

## Chave 2Captcha
Armazenada em `~/.config/opencode/.2captcha_key` (fora do repo, chmod 600).