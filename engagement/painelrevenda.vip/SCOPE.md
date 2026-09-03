# SCOPE.md — painelrevenda.vip (EXPANDIDO)

## Alvo Original
- **Domínio:** painelrevenda.vip (186.194.52.218)
- **ASN:** AS53107 (EVEO S.A., Brasil)

## Escopo Expandido (caçada contínua §19)
Descobertas durante o recon:

### Camada 2 — Painel Real
- **revenda-eliteiptv.online** (Cloudflare: 104.21.71.180)
- **eliteiptv.one** (186.194.52.218)
- **revendaiptv.pro** (186.194.52.218)
- **smartplay.club** (186.194.52.218) — subdomínios: app, player, revenda, seo, img, r
- **iptvrevenda.org** — DNS SERVFAIL (morto)

### Camada 3 — Infraestrutura Backend
- **elite-iptv.com** ← PHP 5.6.40 EOL (alvo principal da fase atual)
  - Porta 8443: Plesk Obsidian 18.0.78 REST API
- **panel.elite-iptv.com** — Bootstrap dashboard (template)
- **revenda-iptv.com** — aaPanel (não configurado)
- **79.137.20.193:8880** — Plesk Login Panel (IP separado)

## Autorização
Autorização ampla para testes de segurança ofensiva em toda a infraestrutura da Elite IPTV (painelrevenda.vip e todos os domínios relacionados identificados).

## Técnicas Autorizadas
- Recon passivo e ativo (scan, fingerprint)
- OWASP Top 10 (SQLi, XSS, SSRF, IDOR, etc.)
- CVE/PoC validation (não-destrutiva)
- Credential stuffing / default creds
- Cloudflare bypass via headless browser + 2Captcha
- Subdomain takeover validation

## Limitações
- Proibido: DoS, modificação de dados, persistência
- Exploração não-destrutiva: read-only, não criar/modificar registros