# ACTIVE.md — Recon Ativo Consolidado (Fase 3)

> Status: consolidado após recon ativo (parcial — ffuf vhosts interrompido, mas dados críticos capturados).

## Portas/serviços por IP (infra própria)

### 54.207.91.194 (mdlco01 / mdlon01 — Moodle) — EC2 sa-east-1
- **Portas abertas:** 80/tcp (http Apache), 443/tcp (ssl/http Apache **PHP 5.5.9-1ubuntu4.17**)
- **Cert SSL:** `*.unyleya.edu.br` (SAN: `*.unyleya.edu.br`, `unyleya.edu.br`) → EC2 compartilhada com marca irmã Unyleya
- **WAF:** nenhum detectado (Apache puro)
- **Moodle confirmado:** `/login/index.php` (303→login), `/admin/` (303), `/admin/environment.xml` (200, 57KB — matriz de compatibilidade), `/composer.json` (200 — phpunit 4.8, behat 1.30.2), `/version.php` (200 vazio), `/install.php` (302)
- **cron.php:** `/admin/cron.php` responde 200 mas body = "Desculpe, o acesso a essa página foi desativado pelo administrador." (cron desabilitado via config — não explorável diretamente, mas confirma instância Moodle ativa)
- **Endpoints 403:** `/local/`, `/question/`, `/report/`, `/cache/`, `/availability/`, `/lib/classes/`
- **Versão Moodle:** não pinada exatamente (environment.xml mostra compatibilidade desde Moodle 1.5; composer.json indica stack antigo). Handoff `cve` para fingerprint preciso via hash de arquivos.

### 54.207.36.58 (antigo / ebook / online) — EC2 sa-east-1
- **Portas:** apenas 443 (HTTPS) respondendo; HTTP/80 não responde (000)
- **Tudo 403** em HTTPS — Apache configurado para negar acesso direto por IP/host
- **403 bypass:** TODAS as tentativas falharam (X-Forwarded-For, X-Original-URL, path tricks `/.`, `/../`, `..;/`, case, Host spoofing para impconcursos/unyleya/localhost)
- **Vetor esgotado** para acesso direto. Marcar pausado — só reabrir se vhost brute encontrar Host válido.

### 138.68.37.29 (chat — Typebot/Next.js) — DigitalOcean (terceirizado core4.com.br)
- **Porta 443:** Next.js (X-Powered-By: Next.js)
- **`/__ENV.js` vaza:** `NEXT_PUBLIC_SMTP_FROM` (chat@core4.com.br), `NEXT_PUBLIC_VIEWER_URL` (chat.core4.com.br), `NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME` (siterosaamazonica), `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`, `NEXT_PUBLIC_GIPHY_API_KEY`
- **Endpoints expostos:** `/signin`, `/register`, `/login`, `/dashboard`, `/typebots`, `/typebots/public`, `/view` (todos 200 — **cadastro/login abertos**), `/api/health` (200 ok)
- **API protegida:** `/api/v1/typebots`, `/api/v1/workspaces`, `/api/auth/*` (404 — auth não exposta publicamente)
- **Handoff webapp:** signup aberto pode dar conta no Typebot (terceirizado) — acesso ao dashboard = possível foothold em infra terceira + acesso a typebots/fluxos/config do cliente.

### 195.246.239.30 / 195.246.239.31 (mail servers)
- (nmap rodou — ver `nmap_mail30_focused.nmap` / `nmap_mail31_focused.nmap` — handoff `network` se portas SMTP/IMAP/webmail abertas)

### 3.164.6.x (blog — WordPress) — CloudFront
- WordPress confirmado: `xmlrpc.php` ativo, `readme.html` exposto, `wp-cron.php` habilitado, `robots.txt` lista `/wp-admin/`
- **wpscan interrompido** (SIGTERM no fingerprint) — re-executar com enumeração focada
- **Admin conhecido:** `deploy` (id=1, via wp-json users — do recon passivo)
- **Handoff webapp:** cred-stuffing em `deploy` no `/wp-login.php` via xmlrpc (ALTO payoff — admin WP = RCE via plugin/theme editor)

## Vhosts ocultos (EC2 próprios)
- ffuf vhost brute em 54.207.91.194 (Host: FUZZ.impconcursos.com.br e FUZZ.unyleya.com.br) **interrompido** antes de completar (sem hits CSV processados). Recomendado re-executar com wordlist menor focada (top 5000) ou via `nuclei -t technologies` + Host header injection.

## WAF / TLS
- WAF: nenhum em hosts próprios (Apache puro, sem Cloudflare/ModSecurity visível)
- TLS: `ssl-cert` revela `*.unyleya.edu.br` no mdlco01 — correlação forte com gestora Unyleya. `ssl-enum-ciphers` rodou (ver `tls_scan.txt`)

## Serviços não-web expostos
- Mail servers 195.246.239.30/31: handoff `network`
- Nenhuma porta de DB (Redis/Mongo/Elastic) encontrada nos EC2 próprios (apenas 80/443)

## Próximos passos (caçada contínua §19)
1. **BLOG WP — cred-stuffing admin `deploy`** (webapp) → ALTO payoff (admin WP = RCE)
2. **CHAT Typebot — signup aberto** (webapp) → MÉDIO-ALTO (foothold em infra terceira + acesso a fluxos/config)
3. **MDLCO01 Moodle + PHP 5.5.9 EOL — CVE research** (cve) → ALTO (RCE candidate)
4. **Vhost brute re-run** em 54.207.91.194 com wordlist focada (top 5000) — pode achar dev/staging/admin/api
5. **Mail servers** — handoff `network` (SMTP/IMAP/webmail)
6. **Vetor esgotado:** antigo/ebook/online (403 hard-blocked, bypass falhou) — pausado
