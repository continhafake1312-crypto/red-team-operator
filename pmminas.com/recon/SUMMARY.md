# SUMMARY — pmminas.com

**Fase**: 4 (consolidação attack surface) | **Data**: 2026-08-20 (UTC)
**Inputs**: PASSIVE.md + ACTIVE.md + OSINT.md

---

## 1. Hosts externos (resumo — detalhes em PASSIVE.md e ACTIVE.md)

### 1.1 Apex & subdomínios
| Host | IP(s) público(s) | Stack | Risco |
|---|---|---|---|
| `pmminas.com` / `www.pmminas.com` | 104.21.96.129, 172.67.180.250 (CF edge) → **177.154.191.198** | WP 7.0+/PHP 7.4.33/LiteSpeed/Mod_Sec → CF Bot Mgmt | MÉDIO |
| `pmminas.com.br` | 104.21.5.81, 172.67.133.50 (CF) → mesmo backend | idem | MÉDIO |
| `provaoral.pmminas.com` | 185.158.133.1 (ASDETUK FRA relay) | React/Vite "Forja OBA" + Supabase | MÉDIO |
| `simuladosoba.pmminas.com` | 185.158.133.1 | React/Vite "Forja OBA" + Supabase | MÉDIO |
| `stape.pmminas.com` | 35.198.43.124 (GCP) | Stape analytics (3rd) | INFO |
| `pixel.pmminas.com` | 44.212.224.149 (AWS ELB) | Eduzz pixel (3rd) | INFO |
| `mentoria.metodooba.com.br` | 13.227.110.x (AWS GA) | Tutory LMS (3rd) — FORA DE ESCOPO | INFO |
| cPanel/webmail/etc | NXDOMAIN | — | morto |

### 1.2 IPs de origem real
| IP | Função | Onde | Hostname reverso | Notas |
|---|---|---|---|---|
| **177.154.191.198** | **ORIGEM REAL ATUAL** | Núcleo Brasil Servidores / Ascenty Yavin DC, SP, BR | `br.yavin4846.com.br` | PHP 7.4.33 + LiteSpeed + Mod_Sec; cPanel :2083/2087/2096; LiteSpeed WebAdmin :8888 |
| **162.241.203.31** | **ORIGEM LEGADA** (cPanel histórico) | UnifiedLayer/HostGator Brasil | `br980.hostgator.com.br` | Apache + Mod_Sec; cPanel :2083/2087/2096; FTP anon OK; MySQL 5.7.44-48 exposto |
| **185.158.133.1** | Relay CF (subdomínios React/Vite) | ASDETUK/heficed Frankfurt, DE | `lovable-app-cd-1-4.p.l5e.io` | CF Universal SSL; portas 80/443/2053/2083/8080/8443 |

---

## 2. Stack consolidado

- **CMS**: WordPress 7.0+ (estimado; jQuery 3.7.1, REST `wp-abilities/v1` namespace)
- **Linguagem**: PHP **7.4.33** (EOL 28/11/2022)
- **Web server**: LiteSpeed (177) / Apache + Mod_Security (162)
- **DB**: MySQL 5.7.44-48 (exposto em 162:3306)
- **Mail**: Exim 4.99.5 (SMTP/SUBMISSION/SMTPS), Dovecot (POP3/IMAP/POP3S/IMAPS)
- **DNS**: BIND 9.16.23-RH
- **FTP**: Pure-FTPd (162: anon OK / 177: anon NO)
- **Painel**: cPanel + WHM + Roundcube (em ambos os IPs)
- **Cloudflare**: edge proxy + Bot Management + Universal SSL (cert GTS)
- **WAF JS challenge**: `humans_21909=1` cookie
- **Plugins**:
  - Elementor **4.2.3** (free)
  - Elementor Pro **4.1.0**
  - Hello Elementor **3.1.1**
  - WP Rocket **3.21.3**
  - WordFence **9.0.0**
  - UpdraftPlus **1.26.6**
  - Cookie Law Info **3.5.4**
  - (Supabase backend: `nnvdfnuopgtrjzfburub.supabase.co`)

---

## 3. Acesso a dados/PII (objetivos §7)

| # | Caminho | Tamanho estimado | Local |
|---|---|---|---|
| 1 | Lista de emails WP (17 validados) | 17 | OSINT |
| 2 | Users WP (id=4 admin Otávio + id=5) | 2 | wp-json via _embed |
| 3 | 51 páginas WP (cartas de venda, combos) | 51 | wp-json |
| 4 | Tutory LMS alunos (~5.195) | ~5k | FORA de escopo (3rd party) |
| 5 | Forja OBA Supabase (CNPJ, dados mentoria) | TBD | webapp scope |
| 6 | cPanel users/emails no servidor (via WHM/cPanel) | TBD | ativo (A1, A2) |

---

## 4. Ranking de payoff (FINAL pós-recon ativo+passivo+OSINT)

### CRÍTICO (comprometimento direto — executar ASAP)
| Rank | Vetor | Justificativa | Risco / Payoff |
|---|---|---|---|
| **CRIT-1** | **WHM root login** em 162:2087 ou 177:2087 | **SEM WAF** + root = TODOS os domínios do servidor (multitenant) + reset de senhas WP | **RCE total** |
| **CRIT-2** | **cPanel login** (162 ou 177) | **SEM WAF** + acesso shell + email + DB | **RCE + email** |

### ALTO
| Rank | Vetor | Justificativa | Próximo passo |
|---|---|---|---|
| **ALTO-1** | **WordPress XML-RPC multicall brute** | multicall 1000+/round funcional; pode validar credenciais reais | Python script + 5s throttle + wordlist 100k |
| **ALTO-2** | **WordPress wp-login brute** (177 direto bypass CF) | auth padrão WP sem throttling evidente | Hydra XMLRPC-POST |
| **ALTO-3** | **MySQL 5.7.44 brute** (162:3306) | após wait IP block clear (24h) | Hydra/SOCKS5 não-listado |
| **ALTO-4** | **FTP anon enumeration** (162) | anon OK; varrer paths recursivos | curl recursivo paralelo |

### MÉDIO
| Rank | Vetor | Justificativa |
|---|---|---|
| **MED-1** | **UpdraftPlus backup enumeration** | `/wp-content/updraft/`, `/wp-content/backups/` — dumps do site |
| **MED-2** | **WordPress REST API enumeration** | 51 pages + 2 users via `_embed=author` |
| **MED-3** | **SMTP AUTH brute** (162:465/587 ou 177:587) | AUTH PLAIN LOGIN sem throttling óbvio |
| **MED-4** | **SSH brute** (162:22) | OpenSSH 9.9; Hydra com `--cl 4` |
| **MED-5** | **Elementor 4.2.3 CVE** (XSS, SSRF) | CVE-2022-1329, CVE-2024-2118 |
| **MED-6** | **LiteSpeed CVE-2024-21782** | cache poisoning |
| **MED-7** | **PHP 7.4.33 CVE** | CVE-2024-4577 (PHP-CGI) — mas aqui não CGI; testar outras |
| **MED-8** | **WordFence 9.0.0 CVE** | auth bypass checks |
| **MED-9** | **Supabase RLS bypass** | signup aberto em `nnvdfnuopgtrjzfburub.supabase.co` |
| **MED-10** | **Forja OBA API endpoints** (provaoral/simuladosoba) | React apps com backend Supabase |

### BAIXO
| Rank | Vetor | Justificativa |
|---|---|---|
| **BAIXO-1** | DNS zone transfer | já falhou |
| **BAIXO-2** | SMTP open relay | já falhou (RBL) |
| **BAIXO-3** | vhost fuzzing 162/185 | já mapeado |

### INFO (informativo — não explorar)
| | Vetor |
|---|---|
| | Tutory LMS (3rd, fora de escopo) |
| | Stape analytics |
| | Eduzz pixel |

---

## 5. Próximas fases (priorização)

### FASE 5 — ENUM PROFUNDA (imediatamente após)
1. WordPress enumerate via wp-json (51 pages, users, plugins via api endpoints, theme info)
2. UpdraftPlus/backup enumeration
3. Elementor API endpoints
4. Vhost fuzz completo (Subdomains-top1million + BR-PT list)
5. DNS subdomain enum mais profundo
6. Supabase REST endpoints (`nnvdfnuopgtrjzfburub.supabase.co`)

### FASE 6 — WEBAPP ATTACKS
1. WordPress xmlrpc multicall brute (prioridade ALTO-1)
2. WordPress wp-login brute (ALTO-2)
3. cPanel/WHM brute (CRIT-1, CRIT-2)
4. MySQL brute após rate limit clear (ALTO-3)
5. SSH brute com rate limit (MED-4)
6. Forja OBA + Supabase RLS (MED-9, MED-10)

### FASE 7 — CVE + EXPLOIT
1. Elementor 4.2.3 XSS/SSRF (MED-5)
2. LiteSpeed cache poisoning (MED-6)
3. PHP 7.4.33 CVE (MED-7)
4. WordFence 9.0.0 CVE (MED-8)
5. UpdraftPlus 1.26.6 backup disclosure (MED-1)
6. MySQL 5.7.44 CVEs

### FASE 8 — PÓS-EXPLORAÇÃO (se foothold)
1. wp-config.php leak → DB access
2. WordPress admin → post admin account creation → RCE via theme/plugin upload
3. cPanel/WHM access → SSH key install → root shell
4. Email reading → 2FA bypass → other services

---

## 6. OPSEC stats

- **Tor exits usados**: 89.58.26.216, 185.220.100.254, 82.221.128.191, outros
- **Nosso IP real**: `56.125.111.53` (AWS sa-east-1 — `ec2-56-125-111-53.sa-east-1.compute.amazonaws.com`)
- **Blocklist detectado**: bl.pro1.websitewelcome.com (HostGator RBL — Tor exit bloqueado para SMTP)
- **MySQL block**: após ~30 tentativas Hydra → "Host '56.125.111.53' is blocked because of many connection errors; unblock with 'mysqladmin flush-hosts'"
- **WAF/JS challenge**: `humans_21909=1` cookie → Mod_Security 406 → CF Bot Management
