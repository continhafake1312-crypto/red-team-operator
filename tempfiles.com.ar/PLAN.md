# PLAN.md — Engagement tempfiles.com.ar

## Fases do Engagement (ordem obrigatória §5)

| Fase | Status | Especialista | Entregável | Início | Fim |
|------|--------|--------------|------------|--------|-----|
| 1. Escopo | ✅ Concluído | Coordenador | SCOPE.md | 2026-08-22T18:31:00Z | 2026-08-22T18:31:00Z |
| 2. Recon Passivo + OSINT | ✅ Concluído | `recon-passive` | `recon/passive/PASSIVE.md` | 2026-08-22T18:31:00Z | 2026-08-22T18:45:00Z |
| 3. Recon Ativo | 🔄 Em andamento | `recon-active` | `recon/active/ACTIVE.md` | 2026-08-22T18:45:00Z | — |
| 4. Consolidar Attack Surface | ⏳ Pendente | Coordenador | `recon/SUMMARY.md` | — | — |
| 5. Enumeração Profunda | ⏳ Pendente | `enum` | `enum/` | — | — |
| 6. Ataque WebApp | ⏳ Pendente | `webapp` | `evidence/F-XXX.txt` | — | — |
| 7. CVE Research | ⏳ Pendente | `cve` | `cve/` | — | — |
| 8. Exploit Validation | ⏳ Pendente | `exploit` | `exploit/` | — | — |
| 9. Pós-Exploração | ⏳ Pendente | `postex` | `loot/` | — | — |
| 10. Relatório Final | ⏳ Pendente | `report` | `REPORT.md` | — | — |

## Backlog de Vetores (Pivot Hunting §19)
> Vetores pausados com motivo e gatilho de retorno. Atualizar a cada finding.

| Vetor | Status | Motivo da Pausa | Gatilho de Retorno |
|-------|--------|-----------------|-------------------|
| File upload/download endpoint discovery on tempfiles.com.ar | 🔄 Em ativo (Fase 3) | Aguardando recon ativo mapear endpoints reais | Encontrar endpoint funcional |
| PHP 5.3.3 RCE exploitation | ⏳ Aguardando | Precisa de endpoint acessível + versão confirmada | Confirmação de vetor de entrada |
| ArgenPool Miner (ns1) wallet/pool injection | ⏳ Aguardando | Precisa enumeração JS/API do miner | Fase 5 (enum) ou Fase 6 (webapp) |
| Cloud bucket `tempfiles` misconfig test | ⏳ Aguardando | Precisa testar permissões write/list | Fase 7 (cve/exploit) |
| NS2 IP discrepancy investigation | ⏳ Pausado | Baixo payoff direto | Se pivotar para infra DNS |

## Findings Confirmados
> Preenchido conforme findings surgem. Referência: `evidence/F-XXX.txt`

| ID | Severidade | Título | Host/Endpoint | Status |
|----|------------|--------|---------------|--------|
| F-001 | Alta | PHP 5.3.3 EOL + Apache 2.2.15 EOL — múltiplos CVEs não patchados | tempfiles.com.ar (198.245.60.66) | Confirmado |
| F-002 | Alta | AXFR zone transfer permitido em ambos NS autoritativos | ns1.argenpoll.com.ar, ns2.argenpoll.com.ar | Confirmado |
| F-003 | Média | Ausência de MX/SPF/DMARC — email spoofing possível | tempfiles.com.ar | Confirmado |
| F-004 | Alta | ArgenPool Miner em ns1.tempfiles.com.ar — aplicação de mining pool exposta | ns1.tempfiles.com.ar (181.45.232.2) | Confirmado |
| F-005 | Média | SSL cert hostname mismatch (CN=miner.argenpoll.com.ar ≠ ns1.tempfiles.com.ar) | ns1.tempfiles.com.ar | Confirmado |
| F-006 | Média | NS discrepancy: ns2 IP difere entre NS autoritativos | ns2.tempfiles.com.ar | Confirmado |
| F-007 | Info | Bucket `tempfiles` existe em AWS S3, GCP, Azure (sem acesso público) | Cloud providers | Confirmado |
| F-008 | Info | Subdomínio histórico hpcd.tempfiles.com.ar com 100+ certs Let's Encrypt (2016-2018) para domínios não relacionados | hpcd.tempfiles.com.ar | Confirmado |
| F-009 | Baixa | jQuery 1.11.0 — vulnerabilidades XSS conhecidas (CVE-2015-9251, CVE-2019-11358) | tempfiles.com.ar | Confirmado |

## Credenciais / Acessos Obtidos
> Preenchido conforme creds/acessos são validados.

| Tipo | Host/Serviço | Credencial | Validade | Privilégio |
|------|--------------|------------|----------|------------|
| — | — | — | — | — |

## Próxima Ação Imediata
Delegar Fase 3 (Recon Ativo) ao subagente `recon-active` com foco em: port scan dos 3 IPs de origem, vhost enum, content discovery para achar endpoints reais de upload/download, SSL/TLS testing.