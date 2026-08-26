# Relatório de Pentest — futemax.luxury

## Metadados
- **Alvo:** futemax.luxury
- **Data de início:** 2026-08-26
- **Metodologia:** Black-box externo, Web/API
- **OPSEC:** Tor + proxychains4 em todos os scans/requests

---

## Sumário Executivo
*[A ser preenchido após conclusão]*

---

## Tabela de Findings

| ID | Severidade | Título | Status |
|----|-----------|--------|--------|
| F-010 | Info | SSH Recon — OpenSSH 8.9p1 | Concluído |
| F-011 | Info | Terrapin CVE-2023-48795 — Não vulnerável | Concluído |
| F-012 | Info | CVE-2023-38408 — Não aplicável como vetor | Concluído |

---

## Detalhamento de Findings

### F-010: SSH Recon — OpenSSH 8.9p1 Ubuntu
- **Alvo:** 212.92.104.6:1022
- **Banner:** SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.13
- **Host Key:** ssh-ed25519 SHA256:qqxt8BbzugA4+fUuEg+Fa2+wuRpCPzNDWPGEjlEzOkk
- **Auth:** publickey, password
- **Rate limiting:** Agressivo — múltiplas conexões consecutivas bloqueadas

### F-011: Terrapin Attack CVE-2023-48795
- **Verdito:** Não vulnerável — strict key exchange presente no servidor

### F-012: CVE-2023-38408
- **Verdito:** Não aplicável como vetor — CVE permite servidor malicioso atacar cliente, não o inverso

---

## Attack Surface
*[A ser preenchido após recon]*

---

## Acessos Obtidos
Nenhum acesso SSH obtido até o momento.

---

## Objetivos de Alto Valor
*[A ser preenchido]*

---

## Cronologia

| Data/Hora (UTC) | Evento |
|-----------------|--------|
| 2026-08-26 | Início do engagement |
| 2026-08-26 04:45 | Exploit SSH: recon concluído, sem creds válidas, CVEs não aplicáveis |

---

## Evidências
*[A ser preenchido]*

---

## Glossário
- **OPSEC:** Operational Security
- **RCE:** Remote Code Execution
- **IDOR:** Insecure Direct Object Reference
- **BOLA:** Broken Object Level Authorization