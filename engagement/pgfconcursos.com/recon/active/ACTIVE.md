# ACTIVE.md — Recon Ativo — pgfconcursos.com

> Fase 3 (recon ativo). Timestamp: 2026-08-27T05:20:00Z. OPSEC: Tor + proxychains4 (IP saída 45.66.35.28), rate-limited.

## IP real / CDN
- **IP real:** `45.151.121.124` (Hostinger shared, NS Hostinger). **Sem CDN/Cloudflare** ativo no front (apenas resquício histórico de email-obfuscation). LiteSpeed responde apenas a vhosts conhecidos; IP direto sem Host header → connection refused / 403 default vhost.

## Portas / serviços expostos
Scan completo TCP (rustscan full + nmap connect confirm). **Único host: 45.151.121.124.**

| Porta | Estado | Serviço | Versão | Notas |
|---|---|---|---|---|
| 80/tcp | open | http | LiteSpeed httpd | redireciona p/ 443 |
| 443/tcp | open | ssl/https | LiteSpeed (PHP 7.3.33) | HTTP/2 & HTTP/3 |
| 21 | fechada (nmap) | — | — | rustscan false-positive |
| 3306 | fechada (nmap) | — | — | rustscan false-positive (MySQL não exposto) |
| 65002 | fechada | — | — | rustscan false-positive |

- **UDP top:** não há serviços UDP relevantes expostos (Hostinger bloqueia).
- **Conclusão:** apenas web (80/443). Nenhum serviço não-web (FTP/SSH/SMTP/DB/cPanel) exposto publicamente neste IP.

## WAF / Anti-bot
- **wafw00f:** não detectou WAF (IP direto sem vhost = refused; apex não retorna header WAF).
- **Probe SQLi** (`/search?q='`): retornou 302 → `/` — **sem bloqueio/limitação por WAF**.
- **Anti-bot leve Hostinger:** 403 sem UA de navegador, 200 com UA real. Não é WAF real — apenas check de UA.
- **Cloudflare:** ausente (NS = Hostinger, sem `cf-ray`, `server: cloudflare`).

## TLS
- **Cert:** Let's Encrypt (CN YE2), ECDSA SHA-384, EC P-256.
- Validade: Jul 22 2026 → Out 20 2026. Auto-renovação Hostinger.
- **SANs:** `pgfconcursos.com`, `www.pgfconcursos.com` (apenas estes — sem outros domínios do dono no cert).
- **Protocolos:** TLS 1.2 ativo; **TLS 1.0/1.1 desabilitados** (bom); TLS 1.3 (alt-suc h3).
- Sem self-signed, sem wildcard. Cifras não deprecadas detectadas.

## Vhost fuzz (IP compartilhado)
- `ffuf` com subdomains-top + Host header em `http://45.151.121.124`.
- **Baseline:** apex/www → 301; qualquer Host desconhecido (incl. `randomtenant.com`) → 403 (default vhost do LiteSpeed).
- **Resultado:** nenhum vhost adicional do alvo além de `pgfconcursos.com` e `www` (e `ftp` que também resolve p/ o IP mas retorna 403 como default vhost). Hostinger isola por domínio, não por subdomínio custom no IP compartilhado.

## Tech stack (confirmado)
- **Servidor:** LiteSpeed (Hostinger hPanel).
- **Linguagem:** PHP **7.3.33** (header `x-powered-by` exposto — info disclosure menor). **EOL desde dez/2021.**
- **App:** PHP próprio (cookie cru `PHPSESSID`). Sem WordPress/Laravel/Moodle/CodeIgniter detectado.
- **Front:** jQuery, Modernizr, SweetAlert, Google Analytics.
- **Pagamento:** PagSeguro.
- **Autor meta tag:** `Joel H. Metz` (desenvolvedor? — pessoa nova p/ OSINT).
- **HTTP/3** suportado (`alt-svc h3`).

## Ranking de payoff — serviços expostos
| Prioridade | Vetor | Notas |
|---|---|---|
| ALTO | App PHP 7.3.33 EOL + sem WAF | CVEs PHP; sem filtro de ataque |
| ALTO | Endpoints admin/checkout/cupom (de JS) | auth bypass, IDOR, price tampering |
| MÉDIO | Anti-bot só UA → fácil de contornar | enum agressiva viável |
| BAIXO | Apenas 2 portas expostas | sem superfície não-web |

## Próximos passos (→ Fase 5 enum)
- Content discovery agressivo nos paths admin (`/admin`,`/painel`,`/portal`,`/gestao`,`/sistema`,`/pesquisa`,`/api`).
- Forçar `/phpmyadmin`, `/.env`, `/.git`, `/backup`, `/config.php`, `/composer.json`.
- JS analysis profunda (endpoints, chaves, tokens).
- Param mining em `/search`, `/login`, `/cadastro`, `/recuperar-senha`, `/checkout`.
- Re-testar `robots.txt`, `sitemap.xml` com UA real.
