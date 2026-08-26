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
| F-020 | Alta | JWT None Algorithm — Falhou | Concluído |
| F-021 | Alta | JWT Weak Secret Cracking — Falhou | Concluído |
| F-022 | Média | JWT Algorithm Confusion — Falhou | Concluído |
| F-023 | Crítica | Vhost Access — Bloqueado | Falhou |

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

### F-020: JWT None Algorithm Attack
- **Alvo:** 212.92.104.6:80, 172.241.213.98:80
- **Técnica:** JWT com alg:none em todas variações (none, None, NONE, nOnE, NoNe)
- **Vetores:** Cookie, URL param (?ch=1), Authorization Bearer, assinatura vazia
- **Resultado:** Server rejeita todas variações no endpoint /, retorna challenge page
- **Observação:** Endpoint ?ch=1 aceita qualquer JWT (incluindo alg:none) mas redireciona para survey-smiles.com

### F-021: JWT Weak Secret Cracking
- **Alvo:** JWT HS256 de futemax.luxury
- **Ferramenta:** hashcat -a 0 -m 16500
- **Wordlists:** 7 wordlists (5M+ senhas) + regras best64
- **Resultado:** Nenhuma senha correspondeu. Chave não está em wordlists comuns.
- **Observação:** JWT usa chave HMAC-SHA256 forte, não crackeável offline sem wordlist específica

### F-022: JWT Algorithm Confusion / Claims Manipulation
- **Alvo:** 212.92.104.6:80
- **JWKS:** Nenhum endpoint encontrado (/.well-known, /jwks.json, /api/jwks, etc.)
- **Claims:** iss, role, admin, access modificados — todos rejeitados
- **Resultado:** Sistema usa HS256 puro, sem chave pública exposta. Claims verificados após validação de signature.

### F-023: Vhost Access (JWT Bypass)
- **Alvo:** 8 vhosts .futemax.luxury + api.futemax.lol
- **Resultado:** Nenhum vhost acessível — todos servem Joken challenge
- **Observação:** Rate limiting extremamente agressivo impediu testes mais profundos

---

## Attack Surface
*[A ser preenchido após recon]*

---

## Acessos Obtidos
Nenhum acesso obtido. JWT Joken não bypassado, SSH sem credenciais válidas, WordPress via Cloudflare sem autenticação.

---

## Objetivos de Alto Valor
1. 🔴 **Bypass JWT Joken** → Acesso total origin + 8 vhosts internos (admin, api, stream, shop)
2. 🔴 **SSH na porta 1022** → Acesso shell ao servidor (creds ou CVE)
3. 🔴 **WordPress admin** → Via Cloudflare, wp-login + xmlrpc expostos
4. 🟡 **API backend** → Via bypass JWT ou WP REST API

---

## Cronologia

| Data/Hora (UTC) | Evento |
|-----------------|--------|
| 2026-08-26 | Início do engagement |
| 2026-08-26 04:45 | Exploit SSH: recon concluído, sem creds válidas, CVEs não aplicáveis |
| 2026-08-26 05:30 | JWT Joken: todos ataques testados (none alg, hashcat, confusion, claims) — NENHUM bypassou |

---

## Evidências
*[A ser preenchido]*

---

## Glossário
- **OPSEC:** Operational Security
- **RCE:** Remote Code Execution
- **IDOR:** Insecure Direct Object Reference
- **BOLA:** Broken Object Level Authorization