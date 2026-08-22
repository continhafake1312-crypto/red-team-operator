# Fase 2 — Recon Passivo + OSINT: teste-iptv.mov

**Data/Hora:** 2026-08-22T18:18:00Z  
**Operador:** recon-passive agent  
**Alvo:** https://teste-iptv.mov/ (domínio base: teste-iptv.mov)  
**Diretório:** /home/ubuntu/teste-iptv.mov/recon/passive/

---

## 1. Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Subdomínios totais descobertos | 1 (teste-iptv.mov) |
| Subdomínios vivos (HTTP 200) | 1 |
| IPs de origem real descobertos | 0 (protegido por Cloudflare) |
| IPs Cloudflare (edge) | 104.21.71.23, 172.67.142.73 (IPv4) + 2 IPv6 |
| Tech stack principal | Cloudflare (WAF/CDN), Google Analytics, HSTS, HTTP/3 |
| Cloud buckets expostos | 0 |
| Candidatos a takeover | 0 |
| Endpoints Wayback | 0 |
| Contato OSINT | WhatsApp: +55 21 97544-4978 |

---

## 2. DNS Completo (`dns_full.txt`)

```
A Records: 172.67.142.73, 104.21.71.23
AAAA Records: 2606:4700:3033::6815:4717, 2606:4700:3034::ac43:8e49
NS Records: garrett.ns.cloudflare.com, autumn.ns.cloudflare.com
SOA: autumn.ns.cloudflare.com. dns.cloudflare.com. 2412457772 10000 2400 604800 1800
MX: Nenhum
SPF: Nenhum
DMARC: Nenhum
AXFR: Falhou (Cloudflare)
WHOIS: TLD .mov não suportado por whois padrão
```

**Observação:** Domínio totalmente protegido por Cloudflare (proxy ativo). IPs reais de origem não expostos via DNS.

---

## 3. Subdomínios (`subdomains_all.txt`, `subdomains_live.txt`)

### 3.1 Fontes Consultadas
- **subfinder**: 0 resultados
- **amass (passive)**: Apenas domínio apex + infraestrutura real-debrid.com (não relacionado)
- **assetfinder**: 0 resultados
- **crt.sh**: 502 Bad Gateway (indisponível)
- **CertSpotter API**: 7 certificados para `*.teste-iptv.mov` e `teste-iptv.mov` (wildcard)
- **DNS bruteforce (wordlist ~80)**: 0 resultados
- **APIs passivas**: hackertarget, threatcrowd, securitytrails, viewdns, bufferover, sonar.omnisint, subdomain.center, jldc.me, rapiddns — todos 0 subdomínios adicionais

### 3.2 Subdomínios Vivos
```
https://teste-iptv.mov | 200 | Cloudflare | 104.21.71.23,172.67.142.73 | Cloudflare,Cloudflare Browser Insights,Google Analytics,HSTS,HTTP/3
```

**Nota crítica:** Certificados wildcard (`*.teste-iptv.mov`) existem mas nenhum subdomínio resolve publicamente. Possíveis cenários:
- Subdomínios internos/privados (não no DNS público)
- Wildcard emitido preventivamente
- Subdomínios criados dinamicamente via API Cloudflare

---

## 4. Fingerprint Tech Stack (Host Vivo)

### 4.1 Principal: `https://teste-iptv.mov`
| Componente | Versão/Detalhes |
|------------|-----------------|
| CDN/WAF | Cloudflare (proxy full) |
| Web Server | Cloudflare (edge) |
| Analytics | Google Analytics (G-EN9WN676XZ), Google Tag Manager |
| Fonts | Google Fonts (Space Grotesk, Inter) |
| Security Headers | HSTS (preload), CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Protocols | HTTP/3 (QUIC), HTTP/2, TLS 1.3 |
| Favicon MD5 | d56edc3d49fb59cc15db34242af8c27a |

### 4.2 Arquitetura
- Single Page Application (SPA) com navegação por anchors (#catalogo, #dispositivos, #faq, #hero)
- Páginas estáticas separadas: termos-de-uso.html, politica-de-privacidade.html, reembolso.html
- Sem JavaScript externo — scripts inline
- Tracking WhatsApp via cliquex.click (redirect para wa.me)

---

## 5. OSINT (`osint_findings.txt`)

### 5.1 Identidade
- **Marca:** IPTV MOVIE
- **Modelo:** IPTV streaming (canais ao vivo, filmes, séries)
- **Jurisdição aparente:** Brasil (LGPD, CDC, WhatsApp BR +55 21)
- **Pessoa jurídica:** Não divulgada (sem CNPJ, razão social, endereço)

### 5.2 Contato
- **WhatsApp:** +55 21 97544-4978 (Rio de Janeiro)
- **Horário:** Seg-Sáb, 9h-22h
- **Email:** Não encontrado
- **Redes sociais:** Apenas Twitter Card meta tags; sem links ativos

### 5.3 Compliance/Legal
- Termos de Uso: Referência CDC Art. 49 (arrependimento 7 dias)
- Privacidade: Referência LGPD
- Reembolso: 7 dias, processamento 5 dias úteis
- Copyright: © 2026 IPTV MOVIE

---

## 6. Cloud & Takeover

### 6.1 Buckets Testados (AWS S3 + GCP Storage)
Todas as variações retornaram **404**:
- teste-iptv-mov, teste-iptv-mov-assets, teste-iptv-mov-backup, teste-iptv-mov-storage, teste-iptv-mov-media, teste-iptv-mov-content
- iptv-mov, iptv-mov-assets, mov-iptv

### 6.2 Takeover Candidates
**Nenhum.** Nenhum CNAME apontando para:
- GitHub Pages, GitLab Pages, Netlify, Vercel, Heroku, AWS S3, Azure Blob, GCP Storage, Firebase, Shopify, etc.
- Todos os registros DNS apontam para Cloudflare

---

## 7. Wayback Machine (`wayback_urls.txt`)

**Resultado:** Zero URLs arquivadas para teste-iptv.mov
- Domínio provavelmente recente (certificados a partir de maio/2026)
- Wayback não indexou ou domínio bloqueado

---

## 8. Limitações & Gaps

| Limitação | Impacto | Mitigação (Recon Ativo) |
|-----------|---------|------------------------|
| Cloudflare proxy total | IP real oculto | Tentar bypass via subdomínios não proxied, SSL certs, historical DNS, email headers |
| Zero subdomínios públicos | Superfície mínima | Bruteforce DNS ativo maior, vhost fuzzing, certificate transparency monitor |
| Sem MX/SPF/DMARC | Sem infra email exposta | Verificar se usa provedor terceirizado (Google Workspace, Zoho, etc.) |
| Wayback vazio | Sem histórico de endpoints | Content discovery ativo (ffuf), JS analysis |
| theHarvester falhou (dep Python) | OSINT limitado | Usar fontes alternativas (Hunter.io, Phonebook.cz, LinkedIn) |

---

## 9. Próximos Passos Recomendados (Recon Ativo)

1. **Portscan + Service Enum** (nmap/masscan) nos 2 IPs Cloudflare edge — confirmar portas expostas
2. **WAF Detection** (wafw00f) — validar Cloudflare rules
3. **Bypass CDN / Origin IP Discovery**:
   - Verificar subdomínios `mail.`, `ftp.`, `cpanel.`, `webmail.`, `direct.`, `origin.`, `backend.`, `api.` via DNS bruteforce massivo
   - Analisar certificados SSL históricos (CertSpotter, Censys) para IPs em SAN
   - Tentar zone transfer em nameservers não-Cloudflare (se existirem)
   - Verificar cabeçalhos `X-Forwarded-For`, `CF-Connecting-IP` em respostas de erro
4. **VHost Fuzzing** (ffuf) no IP edge Cloudflare — descobrir vhosts internos
5. **Content Discovery** (ffuf/feroxbuster) no host vivo — endpoints ocultos, API, painéis admin
6. **JS Analysis** — embora não haja JS externo, analisar scripts inline por endpoints hardcoded
7. **SSL/TLS Deep Scan** (testssl.sh) — verificar cifras, certificados, vulnerabilidades

---

## 10. Artefatos Gerados

```
/home/ubuntu/teste-iptv.mov/recon/passive/
├── dns_full.txt           # DNS completo
├── subdomains_all.txt     # Todos subdomínios (1)
├── subdomains_live.txt    # Subdomínios vivos com tech-detect
├── subdomains_live.json   # JSON bruto do httpx
├── wayback_urls.txt       # Wayback (vazio)
├── osint_findings.txt     # OSINT consolidado
└── PASSIVE.md             # Este relatório
```

---

## 11. Timeline Log Entry

```
2026-08-22T18:18:00Z — Fase 2 (Recon Passivo + OSINT) concluída para teste-iptv.mov
