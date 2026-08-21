# Recon Passivo - redecanaisvip.club
**Data**: 2026-08-21  
**Ferramentas**: subfinder, amass, dnsx, gau, waybackurls, crt.sh, certspotter, whatweb, hackertarget, urlscan.io, OTX, theHarvester, subjack, s3scanner, shodan, whois, dig

---

## 1. Subdomínios

**Nenhum subdomínio encontrado.** Domínio muito recente (criado 2026-06-10) e protegido por Cloudflare.

| Fonte | Resultado |
|-------|-----------|
| subfinder | 0 subdomínios (API keys configuradas? Cloudflare bloqueou) |
| crt.sh | 502/blocked (Cloudflare challenge no servidor) |
| certspotter | Apenas `redecanaisvip.club` e `*.redecanaisvip.club` (1 certificado) |
| amass (passive) | 0 subdomínios (apenas NS records) |
| hackertarget | 0 subdomínios (apenas IP do root) |
| theHarvester | 0 subdomínios |
| urlscan.io | 0 resultados |
| OTX/AlienVault | 0 subdomínios |
| Google search | 0 resultados |

**Subdomínios únicos consolidados**: 1 (`redecanaisvip.club`)

---

## 2. DNS / Infraestrutura

| Registro | Valor |
|----------|-------|
| **A** | 104.21.35.113, 172.67.218.231 |
| **AAAA** | 2606:4700:3033::6815:2371, 2606:4700:3037::ac43:dae7 |
| **NS** | kareem.ns.cloudflare.com, kristin.ns.cloudflare.com |
| **SOA** | kareem.ns.cloudflare.com. dns.cloudflare.com. 2411851784 10000 2400 604800 1800 |
| **MX** | Nenhum |
| **TXT** | Nenhum |
| **CNAME** | Nenhum |
| **DNSSEC** | Não configurado |
| **Reverse DNS** | Nenhum PTR encontrado |

**Conclusão**: Cloudflare padrão. IPs de borda, sem MX (sem email), sem TXT (sem SPF/DKIM/DMARC).

---

## 3. Tech Stack

| Tecnologia | Detalhe |
|------------|---------|
| **CDN/WAF** | Cloudflare |
| **Servidor Web** | cloudflare (HTTP server header) |
| **Proteção** | JS Challenge (403 com cf-mitigated: challenge) |
| **HSTS** | Ativado (max-age=31536000; includeSubDomains; preload) |
| **CSP** | Restritivo (default-src 'none'; script-src nonce-based) |
| **X-Frame-Options** | SAMEORIGIN |
| **HTML5** | Detectado (whatweb) |
| **País** | RESERVED (ZZ) - Cloudflare anycast |
| **Título** | "Just a moment..." (página do challenge) |

---

## 4. Wayback Machine / URLs Históricas

**Fontes**: gau, waybackurls, CDX API

Apenas 4 URLs encontradas (todas de 2026-07-23 - Cloudflare challenge pages):
- `https://redecanaisvip.club/?__cf_chl_rt_tk=*` (403)
- `https://redecanaisvip.club/cdn-cgi/challenge-platform/*` (200)
- `https://redecanaisvip.club/favicon.ico` (403)
- `https://redecanaisvip.club/360` (via OTX - mesma proteção Cloudflare)

**Conclusão**: Domínio jovem (~2.5 meses), sem histórico significativo no Wayback Machine.

---

## 5. OSINT

### WHOIS
- **Registrar**: PDR Ltd. d/b/a PublicDomainRegistry.com (IANA ID: 303)
- **Criação**: 2026-06-10T16:44:33Z
- **Expiração**: 2027-06-10T16:44:33Z
- **Última atualização**: 2026-08-09T16:44:36Z
- **Registrante**: Privacy Protect, LLC (PrivacyProtect.org) - WHOIS privacy
- **Estado**: MA (Massachusetts, EUA)
- **Status**: clientTransferProhibited

### Engines de busca
- **Google**: 0 resultados relevantes (domain not indexed)
- **theHarvester**: Apenas NS records do Cloudflare
- **GitHub**: 0 resultados
- **Shodan**: Sem dados para os IPs
- **urlscan.io**: 0 varreduras registradas
- **Pastebin/PSBDMP**: Timeout (Tor lento)

### Análise
- Domínio comprado em 2026-06-10 (~2.5 meses atrás)
- Atualizado recentemente (2026-08-09) - pode indicar configuração ativa
- Privacidade WHOIS ativa (PrivacyProtect.org)
- Sem presença em mecanismos de busca, GitHub, shodan

---

## 6. Bypass CDN / IP Real

**Nenhum IP real encontrado.** Cloudflare protege o origin completamente.

Técnicas tentadas:
- DNS histórico (SecurityTrails, ViewDNS, OTX passive DNS) - sem dados
- Certificates Transparency (crt.sh, certspotter) - apenas Edge IPs
- Shodan - sem dados
- Pingbacks/reverse DNS - sem resultado

**IPs de borda conhecidos**:
- 104.21.35.113 (Cloudflare)
- 172.67.218.231 (Cloudflare)

---

## 7. Subdomain Takeover

**Nenhum takeover detectado.** Único domínio (`redecanaisvip.club`) não vulnerável (Cloudflare responde).

Testado com subjack: **[Not Vulnerable]**

---

## 8. Buckets / Cloud Storage

**Nenhum bucket encontrado.** s3scanner testou `redecanaisvip.club` como nome de bucket AWS - não existe.

Outros provedores não testados por falta de nomes de bucket candidatos.

---

## 9. Endpoints / Paths Interessantes

- `/360` - caminho descoberto via OTX (mas protegido por Cloudflare)

---

## Resumo

| Categoria | Achados |
|-----------|---------|
| Subdomínios | 0 (apenas root domain) |
| IPs (Cloudflare edge) | 2 IPv4 + 2 IPv6 |
| IP real do origin | Não descoberto |
| Serviços de email | Nenhum |
| Takeover candidates | 0 |
| Buckets cloud | 0 |
| Endpoints Wayback | 4 (apenas CF challenge) |
| Tech Stack | Cloudflare + HTML5 |
| WHOIS Privacy | Ativo (PrivacyProtect.org) |
| Domínio ativo desde | 2026-06-10 (~2.5 meses) |