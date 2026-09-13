# PLAN.md — cursosdetransito.com.br

## Status do Engagement
- **Início**: 2026-09-13T20:12:00Z
- **Fase atual**: 2 — Recon Passivo + OSINT
- **Modo**: Autônomo

## Fases (ordem adaptativa)
| # | Fase | Status | Especialista | Observação |
|---|------|--------|-------------|------------|
| 1 | Escopo | ✅ | pentest | Estrutura criada |
| 2 | Recon Passivo + OSINT | 🔄 EM PROGRESSO | recon-passive, osint | Delegado |
| 3 | Recon Ativo | ⏳ | recon-active | Aguardando subdomínios |
| 4 | Consolidar Attack Surface | ⏳ | pentest | Após recon |
| 5 | Enumeração Profunda | ⏳ | enum | Após attack surface |
| 6 | Ataque Webapp | ⏳ | webapp | Após enum |
| 7 | CVE Research | ⏳ | cve | Paralelo ao webapp |
| 8 | Exploit | ⏳ | exploit | Se aplicável |
| 9 | Pós-Exploração | ⏳ | postex | Se foothold |
| 10 | Relatório | ⏳ | report | Ao final |

## Backlog de Vetores (caçada contínua §19)
| # | Vetor | Prioridade | Status | Gatilho |
|---|-------|-----------|--------|---------|
| 1 | Subdomínios + cert.sh + wayback | ALTA | 🔄 | — |
| 2 | Cloudflare bypass / IP real | ALTA | ⏳ | Se CF detectado |
| 3 | Default creds (painéis admin) | MÉDIA | ⏳ | Após enum |
| 4 | SQLi em parâmetros GET/POST | ALTA | ⏳ | Após enum |
| 5 | LFI/RFI via parâmetros | MÉDIA | ⏳ | Após enum |
| 6 | SSRF via parâmetros | MÉDIA | ⏳ | Após enum |
| 7 | JWT inseguro / session tokens | MÉDIA | ⏳ | Após enum |
| 8 | S3 buckets abertos | BAIXA | ⏳ | Se assets cloud |
| 9 | CMS fingerprint + CVE | ALTA | ⏳ | Após finger |
| 10 | Upload não-autenticado | ALTA | ⏳ | Após enum |