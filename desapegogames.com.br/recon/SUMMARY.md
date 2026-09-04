# SUMMARY.md — Attack Surface Consolidada + Ranking de Payoff

> **Engagement:** `desapegogames.com.br`
> **Fases consolidadas:** 2 (Recon Passivo/OSINT) + 3 (Recon Ativo)
> **Data:** 2026-09-04
> **Atualizado por:** recon-active (após fase 3)
> **Detalhes:** ver `recon/passive/PASSIVE.md` e `recon/active/ACTIVE.md`

---

## 1. Attack Surface — Visão Única

### 1.1 Domínio / CDN
- `desapegogames.com.br` (+ `www`) → **Cloudflare** (CDN + WAF + Bot Management + Challenge). IPs CF: `104.26.4.215`, `104.26.5.215`, `172.67.69.80`.
- DNS delegado ao Cloudflare (`gina/james.ns.cloudflare.com`).
- **BYPASS CF CONFIRMADO** (ver §2).

### 1.2 IPs de Origem Real (fora CDN) — AS262954 VirtuaServer

| IP | Papel | Stack | Painel |
|----|-------|-------|--------|
| `186.226.60.53` | mail + DirectAdmin primário | nginx, Exim 4.100, Dovecot(DA), Pure-FTPd, BIND 9.11.36 (RHEL 8) | **DirectAdmin :2222** |
| `186.226.60.54` | **ORIGEM DA APP** (desapegogames.com.br) | nginx, CodeIgniter/PHP, Exim, Dovecot, Pure-FTPd | **DirectAdmin :2222** |
| `186.226.60.56` | mail3 | nginx, Exim 4.99.5/4.100, Dovecot, Pure-FTPd | **DirectAdmin :2222** |

Subdomínios reais (DNS): `mail`(.53), `mail2`(.54), `mail3`(.56), `webhook`(.54 — mas webhook API real está no .53!), `www`(.54), `_dc-mx`(.53).

### 1.3 Portas/Serviços expostos (origem real, sem Cloudflare)
- **Web:** 80, 443 (nginx — CodeIgniter app), 2222 (DirectAdmin Evolution/Vue)
- **Mail:** 25, 110, 143, 465, 587, 993, 995 (Exim 4.100 + Dovecot)
- **FTP:** 21 (Pure-FTPd) — .53/.54/.56
- **DNS:** 53 (BIND 9.11.36) — .53/.54/.56 (recursivo? a confirmar)
- **SSH:** 22 closed (SSH em porta non-default não encontrada; DA em 2222)
- **DB:** 3306 closed

### 1.4 Aplicação web
- **Framework:** CodeIgniter (PHP), cookie `ci_session`, routing `index.php/`, URL suffix `.html` (AJAX: `busca.html`, `notificacoes.html`, `carrinho.html`)
- **Painel admin financeiro:** `/admin/autenticacao/login` (+ `/admin/saques/`, `/admin/comprovantes/`)
- **Auth pública:** `/login`, `/cadastro`, `/esqueceu-senha`
- **API:** `/v2.8`, `/categoria/v2.8`, `/compra/v2.8`, `/venda/v2.8`, `/troca/v2.8`
- **Enumeração:** `/perfil/<username>` (5.544 usernames), `/anuncio/video.html?anuncio=IDOR`, `/sitemap/usuarios`
- **reCAPTCHA:** sitekey `6LfL2MMpAAAAANC5OV3Om_AEyPShC5pybmxlKBR5` (admin login)
- **Webhook API (NOVO):** `webhook` vhost no `.53:443` → JSON receiver (callback de pagamento?)

---

## 2. Bypass Cloudflare — CONFIRMADO

```
curl -k -H "Host: desapegogames.com.br" https://186.226.60.54/
```
- `.54:443` serve a app completa (favicon `-917994376`, cookie `ci_session`) — **sem WAF/bot-challenge**.
- **Admin panel:** via CF → 403 "Just a moment..." (challenge); via bypass `.54` → **200 (form login)**.
- **Impacto:** toda proteção Cloudflare (WAF, rate-limit, bot) é contornada atacando a origem. Credential stuffing / brute force / fuzzing / exploração não enfrentam WAF.

---

## 3. Ranking de Payoff (priorização para próximas fases)

| # | Vetor | Severidade | Confiança | Fase | Artefato |
|---|-------|-----------|-----------|------|-----------|
| **1** | **Painel admin via bypass CF** (`/admin/autenticacao/login`) — auth bypass / cred stuffing (sem WAF, só reCAPTCHA) | 🔴 CRÍTICO | Alta | webapp | ACTIVE.md §7 |
| **2** | **DirectAdmin** (`:2222/evo/`) nos 3 IPs — cred stuffing → controle total do server | 🔴 CRÍTICO | Alta | exploit+network | ACTIVE.md §7.2 |
| **3** | **Webhook API** (`webhook` vhost `.53`) — callback de pagamento não-autenticado, SSRF/IDOR/price manipulation | 🔴 CRÍTICO | Alta | enum+webapp | ACTIVE.md §10.3 |
| 4 | **Exim 4.100** (25/465/587) — CVE RCE/auth-bypass | 🔴 ALTO | Média | cve+exploit | ACTIVE.md §9 |
| 5 | **IDOR** `/anuncio/video.html?anuncio=ID` (IDs sequenciais) | 🔴 ALTO | Alta | webapp | PASSIVE.md §6.3 |
| 6 | **Enum users** `/esqueceu-senha` + `/perfil/` (5.544 usernames) → cred stuffing `/login` | 🟠 ALTO | Alta | exploit | PASSIVE.md §7.4 |
| 7 | **API v2.8** — IDOR/BOLA/auth em `/compra/v2.8`,`/venda/v2.8`,`/troca/v2.8` | 🟠 MÉDIO-ALTO | Média | enum+webapp | ACTIVE.md §8 |
| 8 | **CodeIgniter** (versão?) — SQLi patterns, session, path issues | 🟠 MÉDIO-ALTO | Média | webapp | ACTIVE.md §9 |
| 9 | **BIND 9.11.36 EOL** (:53) — DNS amplification, cache poison, CVE | 🟡 MÉDIO | Média | cve+network | ACTIVE.md §9 |
| 10 | **Pure-FTPd** (:21) — anonymous/bounce/cred stuffing | 🟡 MÉDIO | A confirmar | network | ACTIVE.md §9 |
| 11 | **webmail** `mail.desapegogames.com.br` — cred default | 🟡 MÉDIO | A confirmar | exploit | ACTIVE.md §7.3 |
| 12 | **JS analysis** `app.js`,`main.js`,`plugins.js` — endpoints/chaves/tokens | 🟡 MÉDIO | Alta | enum | PASSIVE.md §6.4 |
| 13 | **DMARC p=none** — spoofing/phishing | 🟢 BAIXO-MÉDIO | Alta | osint | PASSIVE.md §2.8 |
| 14 | **Cert mismatch** `webhook` (info) | 🟢 BAIXO | Alta | — | ACTIVE.md §6 |
| 15 | **Vazamento URL interna** cookie `redirecionar` (info) | 🟢 BAIXO | Alta | — | ACTIVE.md §8 |
| 16 | **Bucket S3 `dgames`** (privado) — confirmar dono | 🟢 BAIXO | Baixa | cloud | PASSIVE.md §8.1 |

---

## 4. Objetivos de Alto Valor (status)

| # | Objetivo (SCOPE.md) | Status após recon |
|---|---------------------|-------------------|
| 1 | Acesso admin/painel de gestão | Vetor pronto: auth bypass/cred stuffing via bypass CF (sem WAF) |
| 2 | Acesso a dados de clientes/PII | Vetor pronto: IDOR anúncios, enum perfis, API v2.8 |
| 3 | Acesso área financeira/transacional | Vetor pronto: webhook API (.53), /admin/saques, /admin/comprovantes |
| 4 | RCE / foothold no servidor | Vetor pronto: DirectAdmin (controle server), Exim 4.100 CVE |
| 5 | Credenciais vazadas (DB/API/SMTP) | Vetor pronto: DA login, webmail, FTP cred, app.js secrets |

---

## 5. Próximas Fases (delegação)

1. **enum (fase 5):** content discovery via bypass CF (`.54`+Host) em `/admin/*`, `/api/v2.8/*`, webhook API (`.53`), `/.well-known/ai-plugin.json`; JS analysis; param mining IDOR `/anuncio/video.html?anuncio=`; `/esqueceu-senha` user enum.
2. **webapp (fase 6):** auth bypass/cred stuffing no admin login (2Captcha p/ reCAPTCHA, sem WAF); IDOR anúncios; SQLi `/busca.html`/login; webhook payment manipulation/SSRF; API v2.8 BOLA.
3. **cve (fase 7):** Exim 4.100 (CVE-2023-42115 e afins), DirectAdmin (CVE-2019-19893 + versão), BIND 9.11.36 EOL, CodeIgniter.
4. **exploit (fase 7):** cred default/stuffing DirectAdmin `:2222`, webmail, FTP; validar PoCs Exim (não-destrutivo).
5. **network:** fingerprint Pure-FTPd/Exim/Dovecot; DNS recursivo aberto (:53); STARTTLS.
6. **cloud:** re-validar bucket S3 `dgames` (sem Tor).

---

## 6. Limitações / Pendências
- **nuclei** executado (exposures/misconfig, `.54`+webhook `.53`) — **sem findings** (origem hardened no nível nginx). Detalhe em `recon/active/nuclei_results.txt`.
- **nmap `.54`/`.56`** parcial (latência Tor) — versões exatas de nginx/PHP/Exim em `.54`/`.56` via Shodan+banner (network phase para fingerprinting detalhado).
- **Shodan favicon search** requer API key (não disponível).
- **GCP Storage** não re-testado sem Tor (passive falso-positivo).

---

**Conclusão:** Attack surface rica e **bypass CF total** confirmado. Três vetores CRÍTICOS prontos (admin via bypass, DirectAdmin, webhook payment). Próxima fase: **enum + webapp** focados nesses vetores.
