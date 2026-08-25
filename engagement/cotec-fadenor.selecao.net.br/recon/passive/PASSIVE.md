# Recon Passivo — cotec-fadenor.selecao.net.br

**Data:** 2026-08-25
**Operador:** Tor (185.220.101.16) via proxychains4
**Alvo:** cotec-fadenor.selecao.net.br (sistema de processo seletivo COTEC/FADENOR)
**Domínio pai:** selecao.net.br (ProSeleta / Impacta Soluções Web)

---

## Subdomínios

- **Total encontrados (deduplicados):** 775
- **Resolvidos (DNS):** 349 domínios únicos → 883 entradas (com IPv4/IPv6)
- **Vivos (HTTP/HTTPS respondendo):** 291
- **200 OK:** 60 hosts

### IPs de Origem

| IP | Função | Provider |
|-----|--------|----------|
| 64.31.24.186 | Backend ProSeleta (s5.proseleta.com.br) | Cloudflare / Proseleta |
| 104.26.8.108 | Cloudflare CDN (frontend proxy) | Cloudflare |
| 104.26.9.108 | Cloudflare CDN (frontend proxy) | Cloudflare |
| 172.67.69.147 | Cloudflare CDN (frontend proxy) | Cloudflare |
| 177.53.143.156 | Proxy de autenticação | Locaweb |
| 177.71.249.114 | Proxy de clientes (Banrisul, BRB, Grerio) | Locaweb |
| 143.244.178.136 | Vultr (anteriores.cotec.fadenor.com.br) | Vultr Holdings |

### Subdomínios Notáveis

#### Proxy/Auth (IPs NÃO Cloudflare)
- `proxy.selecao.net.br` → **177.53.143.156**
- `proxy-auth.selecao.net.br` → **177.53.143.156**
- `proxy-hmg.selecao.net.br` → **177.53.143.156**
- `proxy-banrisul.selecao.net.br` → **177.71.249.114**
- `proxy-brb.selecao.net.br` → **177.71.249.114**
- `proxy-grerio.selecao.net.br` → **177.71.249.114**

#### Sem-proxy (bypass Cloudflare)
- `ifes25-semproxy.selecao.net.br` → 64.31.24.186 (backend direto!)
- `semproxy.fucap.selecao.net.br` → (não resolvido)
- `semproxy.fapetec.selecao.net.br` → (não resolvido)

#### Plataforma (ProSeleta)
- `suporte.selecao.net.br` → "Ambiente Teste Suporte"
- `ps-adm-{NUM}.selecao.net.br` → Mapeamento de processos seletivos
- `*.cdn.selecao.net.br` → CloudFront distributions (anexos, dossies, formularios, documentos)

---

## Tech Stack

| Host | Tecnologias |
|------|-------------|
| cotec-fadenor.selecao.net.br | **Cloudflare WAF** (403), HTML5, X-Frame-Options[SAMEORIGIN] |
| selecao.net.br | Apache 2.4.41, Ubuntu Linux, PHP |
| *.selecao.net.br (backend) | Apache 2.4.41, Ubuntu, PHP (PHPSESSID), jQuery 2.1.3, **ProSeleta** platform, Meta-Author[Impacta Soluções Web] |
| ifes25-semproxy.selecao.net.br | Apache 2.4.41, Ubuntu (sem Cloudflare) |
| anteriores.cotec.fadenor.com.br | Bootstrap 5.3.3, HTML5, Vultr |

**Framework:** ProSeleta (plataforma proprietária de processos seletivos da Impacta Soluções Web)
**WAF:** Cloudflare (Enterprise-grade)
**Backend:** Apache/2.4.41 (Ubuntu) — versão pública (CVE-2022-23943, CVE-2021-44790, etc.)
**Linguagem:** PHP (PHPSESSID cookies, .php extension implied)

---

## OSINT

### Emails Encontrados
- `gustavo@impactaweb.com.br` (Responsável técnico: Gustavo Sagrillo dos Santos)
- `postmaster@selecao.net.br` (DMARC RUA)
- `b00809e3f88a4a38b68d52a47f8adce8@dmarc-reports.cloudflare.net`

### CNPJ
- **10.823.473/0001-42** — IMPACTA SOLUÇÕES WEB LTDA ME

### GitHub
- 0 resultados públicos (API rate-limited ou repo privado)
- Recomenda-se: pesquisar "Impacta Soluções Web", "ProSeleta", "selecao.net.br" manualmente

### Google Dorks
- DuckDuckGo via Tor não retornou resultados. Pendente para fase ativa.

---

## Cloud

### Buckets
- **AWS S3:** Nenhum bucket público encontrado (todos 404)
- **GCS:** 403 AccessDenied (Tor bloqueado) — inconclusivo, requer IP brasileiro
- **Azure Blob:** 400 Bad Request

### Takeover Candidates (CloudFront)
| CNAME | CloudFront Distribution | Status | Risco |
|-------|----------------------|--------|-------|
| anexos.cdn.selecao.net.br | `d2pwuwcq2rz4uh.cloudfront.net` | 403 AccessDenied | Baixo |
| dossies.cdn.selecao.net.br | `d1z8y3jujvsfs0.cloudfront.net` | Sem resposta (000) | **Médio** |
| formularios.cdn.selecao.net.br | `d1pbfbzf0n5t4w.cloudfront.net` | Sem resposta (000) | **Médio** |
| documentos.cdn.selecao.net.br | `dz77ct0klqxpz.cloudfront.net` | Sem resposta (000) | **Médio** |

⚠️ **3 CloudFront distributions sem resposta — candidatas a takeover via dangling DNS.**

---

## Wayback Highlights

### URLs Coletadas
- **335 URLs** para cotec-fadenor.selecao.net.br (gau/waybackurls)
- 28 processos seletivos identificados (IDs 351–491)

### Endpoints Sensíveis
- `/assets/documentos/*` — Repositório público de PDFs de editais
- `/assets/documentos/{ID}/anexos/*` — Anexos com dados de candidatos
- `/assets/documentos/{ID}/resultados/*` — Resultados com nomes/classificações
- `/.well-known/` — Vários endpoints padrão (security.txt, openid-configuration, etc.)

### Parâmetros Encontrados
- `?page=` — páginas do sistema (colaboradores, encerrados, fale_conosco, institucional, provas)
- `?pag=` — alias para page
- `?time=` — timestamp de cache

### Domínios Relacionados Descobertos
- `anteriores.cotec.fadenor.com.br` (143.244.178.136) — "Processos anteriores" rodando Bootstrap 5.3.3

### Arquivos com Potencial PII
PDFs de editais, resultados definitivos, listas de espera, classificações de candidatos — todos publicamente acessíveis via Wayback Machine.

---

## Recomendações para Recon Ativo

### Prioridade ALTA
1. **Verificar takeover** CloudFront: `d1z8y3jujvsfs0.cloudfront.net`, `d1pbfbzf0n5t4w.cloudfront.net`, `dz77ct0klqxpz.cloudfront.net` — usar `nuclei -t dns/takeover` ou `subjack`
2. **Escanear 64.31.24.186** (backend ProSeleta) — Apache 2.4.41 antigo com CVEs conhecidos
3. **Acessar cotec-fadenor.selecao.net.br** com 2Captcha bypass Cloudflare — verificar painel real
4. **Escanear 177.53.143.156** e **177.71.249.114** — proxies de autenticação (possível entrada)

### Prioridade MÉDIA
5. **Acessar `anteriores.cotec.fadenor.com.br`** — Vultr VPS, pode conter dados históricos
6. **Enumeração de subdomínios bruteforce** via `ffuf` nos padrões `*-semproxy`, `ps-adm-*`
7. **Spider** nos PDFs do wayback para extrair nomes, CPFs, emails de candidatos
8. **Verificar `suporte.selecao.net.br`** — ambiente de teste/suporte com possíveis credenciais fracas

### Prioridade BAIXA
9. **Google Dorks** com IP real (não Tor)
10. **Shodan/Censys** search para IPs encontrados
11. **Bucket discovery** com `s3scanner`, `cloud_enum` usando região Brasil (sa-east-1)

### Ataques Potenciais (próxima fase)
- **Apache 2.4.41 CVEs:** Path traversal (CVE-2021-41773/CVE-2021-42013) se não patchado
- **PHP:** Session hijacking, LFI/RFI em parâmetros `?page=`
- **Cloudflare Bypass:** Conexão direta via IP 64.31.24.186 (semproxy subdomains)
- **IDOR:** IDs sequenciais em `/assets/documentos/{ID}/` — possível acesso a dados de outros processos
- **Takeover:** DNS dangling para CloudFront pode render RCE/redirect

---

## Resumo Estatístico

| Item | Quantidade |
|------|-----------|
| Subdomínios únicos | 775 |
| Hosts vivos | 291 |
| 200 OK | 60 |
| IPs de origem distintos | 7 |
| Clouds/Providers | Cloudflare, AWS CloudFront, Vultr, Locaweb |
| Emails encontrados | 3 |
| Takeover candidates | 3 (CloudFront) |
| Wayback URLs | 335 |
| Processos seletivos COTEC | 28 |
| Domínios relacionados | 1 (anteriores.cotec.fadenor.com.br) |
