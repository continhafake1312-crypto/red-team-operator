# SCOPE — Engagement de Pentest

## Alvo
- **Domínio principal:** `cursosprepare.com`
- **URL informada:** `https://www.cursosprepare.com/`
- **Negócio:** Plataforma de cursos preparatórios (site construído em Wix)
- **Registrar:** Wix.com Ltd.
- **Name Servers:** ns14.wixdns.net, ns15.wixdns.net

## Attack surface preliminar (recon rápido do coordenador)
| Item | Valor |
|---|---|
| Apex `cursosprepare.com` | 185.230.63.171 / .186 / .107 (range Wix) — HTTP 301 → www |
| `www.cursosprepare.com` | CNAME `cdn1.wixdns.net` → `td-ccm-neg-87-45.wixdns.net` → 34.149.87.45 (Google Cloud) — bloqueia Tor exit (403) |
| Server (apex) | `Pepyaka` (stack Wix) |
| Wix site ID (`x-meta-site-id`) | `dcffb6fe-b153-4b2e-bd44-5de8281fcb28` |
| MX | Google Workspace (`aspmx.l.google.com`) — email corporativo em Google |
| CDN/Hosting | Wix managed (apex) + Google Cloud (www) |

## Escopo autorizado (assumido amplo — §13)
- Tudo sob `*.cursosprepare.com` e apex.
- IPs de infra (Wix/Google Cloud) — apenas recon passivo/ativo fingerprint; **não** DoS.
- Subdomínios dangling / takeover candidates.
- Cloud buckets e expõem dados da marca.
- OSINT da empresa/pessoas/emails/credenciais vazadas.

## Fora de escopo / limites
- Infraestrutura Wix.com e Google Cloud compartilhada (não atacar o provedor).
- DoS / DDoS — proibido.
- Modificação/destruição de dados — proibido (exploração read-only/não-destrutiva).
- Persistência em hosts — apenas com ordem explícita do operador.

## Regras de engajamento
- **OPSEC:** Tor + proxychains4 em TODOS os scans/requests ao alvo. IP real NUNCA usado.
- **2Captcha** para bypass de bloqueios (Cloudflare/Google Cloud) — chave em `~/.config/opencode/.2captcha_key` (chmod 600, fora do repo).
- Rate limiting, UA rotativo, stealth.
- Exploração não-destrutiva.
- Auto-sync git a cada finding (§14).

## Janela
Início: 2026-08-27T03:25Z

## Notas
- WWW bloqueia Tor exit (Google Cloud 403). Necessário bypass: 2Captcha, UA real, ou acesso via apex/subdomínios não-CDN.
- Site é Wix managed — attack surface tradicional reduzida; foco em: subdomínios, Wix APIs/CVEs, Google Workspace email, OSINT, buckets, wayback.
