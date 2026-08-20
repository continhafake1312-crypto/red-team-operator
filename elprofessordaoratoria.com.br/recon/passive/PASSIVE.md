# Recon Passivo - elprofessordaoratoria.com.br

## Sumário Executivo
- **Total subdomínios descobertos:** 14 (domínio próprio) + dezenas relacionados (novadimensaodigital/hub)
- **Subdomínios vivos (resolvem DNS):** 7
- **Hosts HTTP vivos:** 8 (incluindo relacionados externos)
- **IPs de origem real:** 5 (fora de CDN: GCP, Hostinger)
- **Tecnologias:** WordPress, Portainer, Mautic, n8n, MinIO, Supabase, Odoo, Dify, Baserow

---

## 1. Informações DNS

### Registros Base
| Tipo | Valor |
|------|-------|
| **A** | `89.117.32.51` |
| **AAAA** | `2a02:4780:13:992:0:38da:8ca1:a` |
| **NS** | `ns1.dns-parking.com`, `ns2.dns-parking.com` |
| **MX** | `mx1.hostinger.com` (5), `mx2.hostinger.com` (10) |
| **TXT (SPF)** | `v=spf1 include:_spf.mail.hostinger.com ~all` |
| **DMARC** | `v=DMARC1; p=none` |
| **ANY** | RFC8482 (bloqueado) |
| **AXFR** | Transferência negada |

### WHOIS
- **Proprietário:** Giovanni Alessandro Begossi
- **Email:** gbegossi@live.com
- **CPF:** ***.954.394-**
- **Criação:** 2022-08-17
- **Expira:** 2027-08-17
- **Registro:** .br (whois.registro.br)

---

## 2. Subdomínios Descobertos

### Fontes: subfinder, assetfinder, hackertarget, urlscan.io

```
elprofessordaoratoria.com.br (89.117.32.51)
├── www.elprofessordaoratoria.com.br (89.117.32.51) → 404
├── api.elprofessordaoratoria.com.br (35.199.71.234) → GCP! 400 Bad Request
├── portainer.elprofessordaoratoria.com.br (89.117.32.51) → Portainer! 200 OK
├── mautic.elprofessordaoratoria.com.br (89.117.32.51) → Mautic! 302 /s/dashboard
├── cursos.elprofessordaoratoria.com.br (89.117.32.51) → 301 → main
├── ftp.elprofessordaoratoria.com.br (147.93.38.23) → LiteSpeed 403 Forbidden
├── mail.elprofessordaoratoria.com.br → não resolve
├── webmail.elprofessordaoratoria.com.br → não resolve
├── alunos.elprofessordaoratoria.com.br → não resolve
├── pixels.elprofessordaoratoria.com.br → não resolve
└── www.correios.elprofessordaoratoria.com.br → não resolve
```

### Relacionados externos (urlscan)
- `cursoelprofessordaoratoria.infinityfreeapp.com` → InfinityFree (DNS error)
- `elprofessordaoratoria.inovacaoestrategica.online` → não resolvido
- `giovannibegossi.bonusvirtual.com` → não resolvido

---

## 3. IPs de Origem Real

| IP | ASN | Provider | Hosts |
|---|------|----------|-------|
| `89.117.32.51` | AS47583 | **Hostinger** (Chipre) | Main site, mautic, portainer, cursos, www |
| `35.199.71.234` | AS396982 | **Google Cloud Platform** (US) | api.elprofessordaoratoria.com.br |
| `147.93.38.23` | AS47583 | **Hostinger** (Chipre) | ftp.elprofessordaoratoria.com.br |
| `82.112.244.187` | AS47583 | **Hostinger** (Chipre) | Infra novadimensaodigital (n8n, MinIO, Odoo, Supabase...) |
| `35.199.94.181` | AS396982 | **Google Cloud Platform** (US) | pixels.novadimensaohub.com.br |

**Nenhum IP atrás de Cloudflare** — todos são IPs de origem real diretamente acessíveis.

---

## 4. Tech Stack por Host

### Main Site (89.117.32.51)
```
WordPress 7.0.4 | PHP 8.2.27 | Apache 2.4.62 (Debian)
MySQL | Elementor 3.23.1 | Yoast SEO 23.0
WP Rocket | Draftpress HFCM | Font Awesome
Google Tag Manager | jQuery 3.4.1
Plugins: gdpr-cookie-compliance, elementor, 
         happy-elementor-addons, form-masks-for-elementor
Theme: Hello Elementor
CDN: Google (detectado httpx)
```

### Portainer (portainer.elprofessordaoratoria.com.br)
```
Portainer (Docker Management UI) | AngularJS
Status: 200 OK (acessível!)
```

### Mautic (mautic.elprofessordaoratoria.com.br)
```
Mautic (Marketing Automation) | Apache 2.4.54 (Debian) | PHP 7.4.33
Status: 302 → /s/dashboard
```

### FTP (ftp.elprofessordaoratoria.com.br)
```
LiteSpeed | Status: 403 Forbidden (existe, mas bloqueado)
```

### API (api.elprofessordaoratoria.com.br)
```
Google Cloud Platform | Status: 400 Bad Request (sem corpo)
CDN: Google CDN
```

---

## 5. OSINT

### Proprietário
- **Nome:** Giovanni Alessandro Begossi
- **Email:** gbegossi@live.com
- **CPF:** ***.954.394-**
- **Domínio criado:** 2022-08-17

### Rede de Negócios Relacionados

**Nova Dimensão Digital** (novadimensaodigital.com.br)
- **Proprietário:** José Daniel Santos Lara / Guilherme dos Reis Leoni
- **Email:** guileonidev@gmail.com, danielsantoslaramcc@gmail.com
- Infraestrutura compartilhada com o alvo (mesmo servidor 89.117.32.51)
- Hospeda serviços internos via Hostinger (82.112.244.187):
  - **n8n** (automação workflows)
  - **MinIO** (armazenamento S3)
  - **Supabase** (backend Firebase-like)
  - **Odoo** (ERP)
  - **Dify** (plataforma AI)
  - **Baserow** (banco no-code)
  - **Portainer** (Docker)
  - **Mautic** (marketing)
  - **CRM** interno
  - **S3** (storage)

**Nova Dimensão Hub** (novadimensaohub.com.br)
- **Proprietário:** Nova Dimensao Hub (CNPJ: 54.891.829/0001-50)
- **Email:** daniel@novadimensaodigital.com.br
- Serviços: marketing, bi, inteligencia, vendas, treinamentos, n8n, etc.

### Breaches
- Nenhum vazamento encontrado em APIs públicas consultadas
- DMARC p=none (permite spoofing, sem proteção)

### GitHub
- Nenhum repositório público encontrado

---

## 6. Cloud Buckets

Nenhum bucket S3/GCP/Azure encontrado acessível publicamente.
Variações testadas: elprofessordaoratoria, elprofessordaoratoria-assets, -backup, -static, -files, -media, -uploads, -cdn, -data, -dev, -staging, -prod e professor-da-oratoria.

---

## 7. Wayback / GAU (GetAllUrls)

### Estatísticas Wayback
- `waybackurls`: apenas 3 URLs (site relativamente novo ou pouco crawleado)
- `gau`: **51 URLs** encontradas

### Endpoints Sensíveis (`.well-known`)
- `/.well-known/ai-plugin.json`
- `/.well-known/assetlinks.json`
- `/.well-known/dnt-policy.txt`
- `/.well-known/gpc.json`
- `/.well-known/nodeinfo`
- `/.well-known/openid-configuration`
- `/.well-known/security.txt`
- `/.well-known/trust.txt`

### Rotas de Interesse
- `/ads.txt` e `/app-ads.txt` (publicidade)
- `/atom.xml` e `/author-sitemap.xml` (informação autoral)
- Múltiplas páginas de funil/sales:
  - `/a-matrix-da-oratoria-*/` (funnels de vendas)
  - `/as-48-leis-da-oratoria-*/` (funnels de vendas)
  - `/a-poderosa-oratoria-*/` (funnels de vendas)
  - `/agradecimento-final/`, `/aplicacao-concluida/` (pós-venda)
- Parâmetros: `?external_browser_redirect=true`, `?utm_source=bio&utm_medium=instagram`

### Nenhum endpoint admin/api/wp-json encontrado nos dados wayback

---

## 8. Subdomain Takeover Candidates

- **alunos.elprofessordaoratoria.com.br** → não resolve (sem CNAME dangling)
- **mail.elprofessordaoratoria.com.br** → não resolve (sem CNAME dangling)
- **webmail.elprofessordaoratoria.com.br** → não resolve (sem CNAME dangling)
- **pixels.elprofessordaoratoria.com.br** → não resolve (sem CNAME dangling)
- **www.correios.elprofessordaoratoria.com.br** → não resolve (sem CNAME dangling)
- **cursoelprofessordaoratoria.infinityfreeapp.com** → DNS Error (potencial takeover?)
- **elprofessordaoratoria.inovacaoestrategica.online** → não resolve (potencial takeover?)
- **giovannibegossi.bonusvirtual.com** → não resolve (potencial takeover?)

---

## 9. Limitações e Observações

- **crt.sh** retornou 502 Bad Gateway (possível bloqueio do Cloudflare do crt.sh)
- **theHarvester** não encontrou emails/hosts adicionais (limitado)
- **Shodan/Censys** sem API key configurada — favicon hash não coletado (favicon não acessível)
- **whois** via proxy falhou — usado whois.registro.br diretamente
- **Alguns subdomínios** podem existir mas não resolvem publicamente (DNS interno)
- **Cloudflare** não detectado — todos os IPs são origem real!

---

## 10. Próximos Passos Recomendados (Recon Ativo)

1. **Scanner de portas** nos IPs de origem real:
   - `89.117.32.51` (hostinger - site, mautic, portainer)
   - `35.199.71.234` (GCP - api)
   - `147.93.38.23` (hostinger - ftp)
   - `82.112.244.187` (hostinger - infra novadimensaodigital)
   - `35.199.94.181` (GCP - pixels)

2. **Portainer** (`portainer.elprofessordaoratoria.com.br`) — tentar acesso ao Docker UI (credenciais default?)

3. **Mautic** (`mautic.elprofessordaoratoria.com.br`) — tentar acesso ao `/s/dashboard`

4. **API** (`api.elprofessordaoratoria.com.br`) — investigar endpoints (400 Bad Request sugere que algo espera)

5. **FTP** (`ftp.elprofessordaoratoria.com.br:21`) — testar credenciais anônimas e brute-force

6. **Infra Nova Dimensão** — investigar subdomínios:
   - MinIO, Supabase, Odoo, n8n, Baserow, Dify — todos acessíveis?

7. **DNS brute-force** para encontrar mais subdomínios

8. **Directory busting** nos hosts vivos (wp-admin, api paths, admin panels)

9. **Testar spoofing** (DMARC p=none permite)

10. **Verificar vulnerabilidades WordPress** (plugins: elementor, yoast, etc.)