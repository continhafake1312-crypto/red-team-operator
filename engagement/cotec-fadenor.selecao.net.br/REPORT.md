# REPORT — cotec-fadenor.selecao.net.br

## Sumário Executivo
*Engagement iniciado em 2026-08-25. Relatório incremental — será atualizado a cada finding.*

## Cronograma
| Fase | Status | Data |
|------|--------|------|
| Escopo | ✅ Completa | 2026-08-25 |
| Recon Passivo | ✅ Completa | 2026-08-25 |
| Recon Ativo | ✅ Completa | 2026-08-25 |
| Consolidar Attack Surface | ✅ Completa | 2026-08-25 |
| Enumeração | ⏳ Em andamento | 2026-08-25 |
| Ataque Webapp | ⏳ Em andamento | 2026-08-25 |
| Enumeração | ⏳ Pendente | - |
| Ataque Webapp | ⏳ Pendente | - |
| CVE/Exploit | ⏳ Pendente | - |
| Pós-Exploração | ⏳ Pendente | - |
| Relatório | ⏳ Pendente | - |

## Findings

### 🟡 Info — Descobertas do Recon Passivo
| ID | Título | Severidade | Status |
|----|--------|-----------|--------|
| F-001 | 3 CloudFront Distributions Candidatas a Takeover | **Alta** | Pendente verificação ativa |
| F-002 | Apache 2.4.41 Desatualizado no Backend (64.31.24.186) | **Média** | Pendente escanear CVEs |
| F-003 | Parâmetro `?page=` Suscetível a LFI/RFI | **Média** | Pendente testar |
| F-004 | IDOR em `/assets/documentos/{ID}/` | **Média** | Pendente testar |
| F-005 | Cloudflare Bypass via semproxy Subdomínio | **Alta** | Em verificação |
| F-006 | Proxy IPs Expostos (177.53.143.156, 177.71.249.114) | **Média** | Pendente escanear |
| F-007 | VPS fora Cloudflare (anteriores.cotec.fadenor.com.br) | **Alta** | Pendente explorar |
| F-008 | 775 Subdomínios Mapeados | **Info** | Concluído |
| F-009 | OSINT: Impacta Soluções Web LTDA (CNPJ 10.823.473/0001-42) | **Info** | Concluído |

### 🔴 Crítico — Novos Findings do Recon Ativo
| ID | Título | Severidade | Status |
|----|--------|-----------|--------|
| F-010 | MySQL 8.0.32 Exposto Publicamente em 64.31.24.186:3306 | **Crítica** | 🔴 Testando conexão |
| F-011 | MySQL 5.5.60 (EOL) Exposto Publicamente em 177.53.143.156:3306 | **Crítica** | 🔴 Testando conexão |
| F-012 | Backend ProSeleta sem WAF/Cloudflare via ifes25-semproxy | **Alta** | 🔘 Explorando |
| F-013 | Painéis Admin (/admin/, /painel/, /uploads/) detectados | **Alta** | 🔘 Pendente enum |
| F-014 | Cert SSL Expirado em 177.53.143.156 (fotonamadeira.com.br) | **Média** | Pendente |
| F-015 | SMTP Postfix Exposto (64.31.24.186:25) — possível open relay | **Média** | Pendente testar |

---

*Relatório incremental — atualizado automaticamente*