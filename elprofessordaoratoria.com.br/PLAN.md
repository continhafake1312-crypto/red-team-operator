# PLAN — elprofessordaoratoria.com.br

## Plano de Execução (ordem emergente)

| Fase | Especialista | Status | Notas |
|------|-------------|--------|-------|
| 1. Escopo + Setup | Coordenador | ✅ Concluído | Estrutura criada |
| 2. Recon Passivo + OSINT | recon-passive | ✅ Concluído | 14 subs, 5 IPs reais, Portainer/n8n/MinIO/Supabase/Odoo/Dify/Baserow descobertos |
| 3. Recon Ativo | recon-active | ✅ Concluído | Portscan completo: 5 IPs, PostgreSQL/MariaDB expostos, serviço 3000 |
| 4. Consolidar Attack Surface | Coordenador | ✅ Concluído | recon/SUMMARY.md + ranking payoff |
| 5. Enumeração Profunda | enum | ✅ Concluído | .env exposto (Mautic), WP user disclosure, .git exposure, API fuzz |
| 6. Ataque Webapp | webapp | ✅ Concluído | Todos painéis testados: Portainer, Mautic, n8n, MinIO — creds default falharam |
| 7. CVE Research | cve | ✅ Concluído | Portainer 2.21.5, Mautic, WordPress plugins — CVEs mapeados (todos requerem auth) |
| 8. Exploit Validation | exploit | ✅ Concluído | Credenciais default validadas em todos os sistemas — nenhuma funcionou |
| 9. Pós-Exploração | postex | ❌ Não aplicável | Nenhum foothold obtido |
| 10. Relatório | report | ✅ Concluído | 11 findings registrados (F-001 a F-011) |

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