# REPORT.md — Engagement tempfiles.com.ar

## Resumo Executivo
Engagement iniciado em 2026-08-22T18:31:00Z. Alvo: **tempfiles.com.ar** (serviço de compartilhamento de arquivos). **Fase 2 (Recon Passivo + OSINT) concluída**. Fase 3 (Recon Ativo) em andamento.

Principais descobertas:
- **tempfiles.com.ar** roda **PHP 5.3.3 (EOL 2014)** + **Apache 2.2.15 (EOL 2017)** — múltiplos CVEs críticos não patchados
- **ns1.tempfiles.com.ar** hospeda **ArgenPool Miner** (pool de mineração de criptomoedas) — aplicação completamente diferente
- **AXFR zone transfer permitido** em ambos nameservers autoritativos
- **Bucket `tempfiles` existe** em AWS S3, GCP, Azure (sem acesso público)
- **Registrante**: PIRELLI SIMON LEONARDO (CUIT: 20312399246) — dono também de argenpoll.com.ar

## Findings por Severidade
| Crítica | Alta | Média | Baixa | Info |
|---------|------|-------|-------|------|
| 0 | 4 | 3 | 1 | 1 |

### Findings de Alta Severidade
| ID | Título | Host | Evidência |
|----|--------|------|-----------|
| F-001 | PHP 5.3.3 EOL + Apache 2.2.15 EOL — múltiplos CVEs | tempfiles.com.ar | `recon/passive/PASSIVE.md` §4.1, §5 |
| F-002 | AXFR zone transfer permitido | ns1.argenpoll.com.ar, ns2.argenpoll.com.ar | `recon/passive/PASSIVE.md` §2.1, §2.2 |
| F-004 | ArgenPool Miner exposto em ns1 | ns1.tempfiles.com.ar | `recon/passive/PASSIVE.md` §4.3 |
| F-005 | SSL cert hostname mismatch | ns1.tempfiles.com.ar | `recon/passive/PASSIVE.md` §10.2 |

### Findings de Média Severidade
| ID | Título | Host | Evidência |
|----|--------|------|-----------|
| F-003 | Ausência de MX/SPF/DMARC | tempfiles.com.ar | `recon/passive/PASSIVE.md` §2.1 |
| F-006 | NS discrepancy (ns2 IP mismatch) | ns2.tempfiles.com.ar | `recon/passive/PASSIVE.md` §2.3 |
| F-007 | Cloud buckets existem (AWS/GCP/Azure) | tempfiles | `recon/passive/PASSIVE.md` §7 |

### Findings de Baixa Severidade
| ID | Título | Host | Evidência |
|----|--------|------|-----------|
| F-009 | jQuery 1.11.0 XSS vulnerabilities | tempfiles.com.ar | `recon/passive/PASSIVE.md` §5 |

### Findings Informativos
| ID | Título | Host | Evidência |
|----|--------|------|-----------|
| F-008 | Subdomínio histórico hpcd com certs para domínios não relacionados | hpcd.tempfiles.com.ar | `recon/passive/PASSIVE.md` §3.3 |

## Objetivos de Alto Valor Atingidos
- [ ] Acesso interno (foothold/RCE)
- [ ] Acesso administrativo
- [ ] Acesso financeiro
- [ ] Acesso a dados/PII

## Timeline Resumido
- **2026-08-22T18:31:00Z** — Início do engagement, SCOPE.md criado
- **2026-08-22T18:31:00Z** — PLAN.md criado, Fase 2 delegada a `recon-passive`
- **2026-08-22T18:45:00Z** — Fase 2 concluída: 8 subdomínios, 3 hosts vivos, 3 IPs de origem, PHP 5.3.3 EOL, ArgenPool Miner, AXFR, cloud buckets
- **2026-08-22T18:45:00Z** — Fase 3 delegada a `recon-active`

## Evidências
| ID | Severidade | Título | Arquivo |
|----|------------|--------|---------|
| F-001 | Alta | PHP 5.3.3 EOL + Apache 2.2.15 EOL | `recon/passive/PASSIVE.md` |
| F-002 | Alta | AXFR zone transfer | `recon/passive/PASSIVE.md` |
| F-003 | Média | No MX/SPF/DMARC | `recon/passive/PASSIVE.md` |
| F-004 | Alta | ArgenPool Miner | `recon/passive/PASSIVE.md` |
| F-005 | Média | SSL hostname mismatch | `recon/passive/PASSIVE.md` |
| F-006 | Média | NS discrepancy | `recon/passive/PASSIVE.md` |
| F-007 | Info | Cloud buckets exist | `recon/passive/PASSIVE.md` |
| F-008 | Info | Historical hpcd subdomain | `recon/passive/PASSIVE.md` |
| F-009 | Baixa | jQuery 1.11.0 XSS | `recon/passive/PASSIVE.md` |

---
*Relatório incremental — atualizado a cada fase/finding.*