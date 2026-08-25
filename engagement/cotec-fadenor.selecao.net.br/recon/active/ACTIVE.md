# Recon Ativo — cotec-fadenor.selecao.net.br

## Resumo Executivo

Alvo principal protegido por Cloudflare. Descobertos **3 IPs de origem direta** (fora CDN) com serviços expostos:
- **64.31.24.186** — Backend ProSeleta (principal): Apache 2.4.41 + MySQL 8.0.32 + SSH + SMTP
- **143.244.178.136** — Vultr VPS (anteriores.cotec.fadenor.com.br): nginx 1.18.0 + SSH
- **177.53.143.156** — Proxy Auth Locaweb: nginx + MySQL **5.5.60** (antigo) + SSH
- **177.71.249.114** — Proxy Banrisul Locaweb: nginx + SSH (OpenSSH 9.6p1)

Cloudflare bypass funcional via `ifes25-semproxy.selecao.net.br` (resolve para 64.31.24.186 sem CF).

## Hosts Diretos (fora CDN)

| IP | Hostname | Portas Abertas | Serviços/Versões | Notas |
|----|----------|----------------|-------------------|-------|
| **64.31.24.186** | ifes25-semproxy.selecao.net.br, s8.proseleta.com.br | **22**/TCP, **25**/TCP, **80**/TCP, **443**/TCP, **3306**/TCP, **9100**/TCP | OpenSSH 8.2p1 Ubuntu 4ubuntu0.5, Postfix smtpd, Apache 2.4.41 (Ubuntu), Apache 2.4.41 + SSL, MySQL 8.0.32-0ubuntu0.20.04.2, jetdirect? | **ALVO PRINCIPAL**. Backend ProSeleta. Sem Cloudflare neste hostname. Painel admin em /admin/, /painel/, /uploads/ (robots.txt) |
| **143.244.178.136** | anteriores.cotec.fadenor.com.br, analise.cotec.fadenor.com.br | **22**/TCP, **80**/TCP, **443**/TCP | OpenSSH 8.9p1 Ubuntu 3ubuntu0.13, nginx 1.18.0, nginx 1.18.0 + SSL | Vultr VPS. SSL: analise.cotec.fadenor.com.br |
| **177.53.143.156** | proxy-auth.selecao.net.br, proxy.selecao.net.br, proxy-hmg.selecao.net.br, fotonamadeira.com.br | **22**/TCP, **80**/TCP, **443**/TCP, **3306**/TCP | OpenSSH 8.2p1 Ubuntu 4ubuntu0.13, nginx, nginx + SSL, MySQL **5.5.60-log** | Proxy Locaweb. SSL expirado (2024) para fotonamadeira.com.br. MySQL versão antiga vulnerável. 502 Bad Gateway nos hosts. |
| **177.71.249.114** | proxy-banrisul.selecao.net.br, proxy-banrisul-hmg.selecao.net.br, proxy-brb.selecao.net.br | **22**/TCP, **80**/TCP, **443**/TCP | OpenSSH 9.6p1 Ubuntu 3ubuntu13.18, nginx, nginx + SSL | Proxy Locaweb. SSL: proxy-banrisul-hmg.selecao.net.br. 403 Forbidden. |

## Web Fingerprint

| URL | Status | Title | Tech Stack | Server |
|-----|--------|-------|------------|--------|
| https://cotec-fadenor.selecao.net.br | **403** (Cloudflare) | "Just a moment..." | Cloudflare WAF | cloudflare |
| https://ifes25-semproxy.selecao.net.br | **200** | "IFES \| Instituto Federal do Espírito Santo" | Apache 2.4.41, PHP, jQuery 2.1.3, jQuery UI, MySQL 8.0 | Apache/2.4.41 (Ubuntu) |
| https://anteriores.cotec.fadenor.com.br | **200** | "Processos anteriores" | nginx 1.18.0, Bootstrap 5.3.3 | nginx/1.18.0 (Ubuntu) |
| http://suporte.selecao.net.br | **200** | "Ambiente Teste Suporte" | Apache 2.4.41, PHP | Apache/2.4.41 (Ubuntu) |
| https://proxy-auth.selecao.net.br | **502** | "502 Bad Gateway" | nginx | nginx |
| https://proxy.selecao.net.br | **502** | "502 Bad Gateway" | nginx | nginx |
| https://proxy-hmg.selecao.net.br | **502** | "502 Bad Gateway" | nginx | nginx |
| https://proxy-banrisul.selecao.net.br | **403** | - | nginx, proxy reverso | nginx |
| https://proxy-brb.selecao.net.br | **403** | - | nginx, proxy reverso | nginx |
| dossies.cdn.selecao.net.br | **000** | - | CloudFront CNAME d1z8y3jujvsfs0.cloudfront.net | NX |
| formularios.cdn.selecao.net.br | **000** | - | CloudFront CNAME d1pbfbzf0n5t4w.cloudfront.net | NX |
| documentos.cdn.selecao.net.br | **000** | - | CloudFront CNAME dz77ct0klqxpz.cloudfront.net | NX |

## WAF Detection

| Host | WAF Detectado |
|------|---------------|
| cotec-fadenor.selecao.net.br | **Cloudflare** (Cloudflare Inc.) |
| ifes25-semproxy.selecao.net.br | **Nenhum** — acesso direto ao backend |
| anteriores.cotec.fadenor.com.br | **Nenhum** |
| suporte.selecao.net.br | **Nenhum** |
| proxy-auth.selecao.net.br | Inconclusivo (502 Bad Gateway) |

## TLS

| Host | Protocolos | Ciphers | Cert Info |
|------|------------|---------|-----------|
| **64.31.24.186** | TLSv1.2, TLSv1.3 | - | CN=selecao.net.br, SAN=*.selecao.net.br, Let's Encrypt YR1, válido até 2026-10-11 |
| **143.244.178.136** | TLSv1.2, TLSv1.3 | - | CN=analise.cotec.fadenor.com.br, Let's Encrypt YE2, válido até 2026-10-18 |
| **177.53.143.156** | TLSv1.2 | - | CN=fotonamadeira.com.br, Let's Encrypt R3, **EXPIRADO** (2024-05-26) |
| **177.71.249.114** | TLSv1.2, TLSv1.3 | - | CN=proxy-banrisul-hmg.selecao.net.br, Let's Encrypt YE1, válido até 2026-10-25 |
| cotec-fadenor.selecao.net.br | - | - | Cloudflare (não acessível via scan direto) |

## Cloudflare Takeover Check

### CloudFront Distribuições
| Distribuição | CNAME | Status | Risco |
|--------------|-------|--------|-------|
| dossies.cdn.selecao.net.br | d1z8y3jujvsfs0.cloudfront.net | **VÁLIDO** — CNAME resolvendo, mas CloudFront retorna vazio | **MÉDIO** — Distribution ativa mas sem conteúdo |
| formularios.cdn.selecao.net.br | d1pbfbzf0n5t4w.cloudfront.net | **VÁLIDO** — CNAME resolvendo, CloudFront retorna vazio | **MÉDIO** — Distribution ativa mas sem conteúdo |
| documentos.cdn.selecao.net.br | dz77ct0klqxpz.cloudfront.net | **VÁLIDO** — CNAME resolvendo, CloudFront retorna vazio | **MÉDIO** — Distribution ativa mas sem conteúdo |

**Nota**: CloudFront retornou vazio (sem HTTP response body) indicando que as distributions estão configuradas mas sem origin/pode ser configuração incompleta. Não parece ser takeover clássico (distribuição existe mas sem conteúdo servido).

### CloudFront Takeover — Verificação via Navegador
Distribuições retornam resposta vazia (HTTP 000 via curl). Necessário verificar com browser real ou curl com mais headers para confirmar se é takeoverable.

## Vulnerabilidades Preliminares

### Crítico/Alto
1. **MySQL 5.5.60-log** (177.53.143.156:3306) — Versão EOL (fim da vida: 2020). Vulnerável a múltiplos CVEs:
   - CVE-2022-21367, CVE-2021-35630, etc. Diversos CVEs de DoS e escalação de privilégio
   - Sem autenticação requerida? (exposto publicamente)
   - **Payoff: ALTO**

2. **MySQL 8.0.32** (64.31.24.186:3306) — Exposto publicamente. Versão relativamente recente mas exposição direta do banco é grave.
   - **Payoff: ALTO**

3. **Certificado SSL Expirado** (177.53.143.156:443) — CN=fotonamadeira.com.br expirado desde 2024-05-26. Indica abandono/má gestão.
   - **Payoff: MÉDIO**

### Médio
4. **robots.txt com diretórios sensíveis** — /admin/* /painel/* /uploads/* bloqueados no robots.txt (64.31.24.186). Indica endpoints administrativos.
   - **Payoff: MÉDIO**

5. **SMTP Postfix exposto** (64.31.24.186:25) — Pipeline SMTP habilitado (PIPELINING, SIZE, ETRN, etc). Possível open relay? Testar.
   - **Payoff: MÉDIO**

6. **Porta 9100 aberta** (64.31.24.186:9100) — jetdirect (raw printing). Possível vetor para ataques de impressão.
   - **Payoff: BAIXO**

7. **CloudFront sem conteúdo** — Três distribuições CloudFront retornam vazio. Possível configuração incompleta ou takeover.
   - **Payoff: BAIXO-MÉDIO**

### Baixo
8. **Informação de versão exposta** — Apache 2.4.41, nginx 1.18.0, OpenSSH versões expostas.
   - CVE-2021-44790 (Apache 2.4.41), CVE-2021-3618 (nginx 1.18.0)
   - **Payoff: BAIXO**

## Ranking de Payoff (Atualizado)

| Item | Alvo | Payoff |
|------|------|--------|
| MySQL 5.5 público + EOL | 177.53.143.156 | **ALTO** |
| MySQL 8.0 público | 64.31.24.186 | **ALTO** |
| Backend sem WAF (ifes25-semproxy) | 64.31.24.186 | **ALTO** |
| Painéis admin (/admin/, /painel/) | 64.31.24.186 | **ALTO** |
| Cert expirado | 177.53.143.156 | MÉDIO |
| SMTP exposto (relay?) | 64.31.24.186 | MÉDIO |
| Porta 9100 aberta | 64.31.24.186 | BAIXO |
| CloudFront sem conteúdo | *.cdn.selecao.net.br | BAIXO-MÉDIO |
| Proxies 502/403 | 177.53.143.156/177.71.249.114 | BAIXO |

## Recomendações para Enumeração WebApp

### Prioridade 1 — Backend ProSeleta (64.31.24.186) via ifes25-semproxy
- **SEM WAF/Cloudflare** — usar `ifes25-semproxy.selecao.net.br` para todos os testes
- Diretórios: `/admin/`, `/painel/`, `/uploads/`
- Fazer enumeração de diretórios com ffuf/dirsearch
- Testar SQL injection (MySQL 8.0 público, Painel)
- Testar LFI/RFI via parâmetros PHP
- Testar Postfix open relay (25/tcp)
- Verificar autenticação no MySQL 3306 (credenciais default?)
- Força bruta SSH (22/tcp)

### Prioridade 2 — MySQL 5.5.60 (177.53.143.156)
- Tentar conexão direta: `mysql -h 177.53.143.156 -u root -p`
- Versão EOL — múltiplas vulnerabilidades conhecidas
- Se conseguir acesso, pivot para proxies

### Prioridade 3 — VPS Vultr (143.244.178.136)
- nginx 1.18.0 — confirmar se há arquivos .php, .git, etc.
- SSL alternativo: analise.cotec.fadenor.com.br
- Subdomínio: www.analise.cotec.fadenor.com.br

### Prioridade 4 — CloudFront Takeover
- Verificar cada distribuição com mais detalhes (GET /, HEAD, etc.)
- Se possível, tentar criar uma distribuição CloudFront com o mesmo CNAME

### Prioridade 5 — Proxy Locaweb
- 502 Bad Gateway — pode indicar backend quebrado, explorar via Host header injection?
- 403 nos proxies Banrisul/BRB — testar bypass de autenticação

## Artefatos Gerados

| Arquivo | Descrição |
|---------|-----------|
| recon/active/nmap_64.31.24.186_svc.* | Scan completo backend ProSeleta |
| recon/active/nmap_143.244.178.136_svc.* | Scan Vultr VPS |
| recon/active/nmap_177.53.143.156_svc.* | Scan proxy-auth Locaweb |
| recon/active/nmap_177.71.249.114_svc.* | Scan proxy-banrisul Locaweb |
| recon/active/nmap_64.31.24.186.* | Scan inicial (full port - incompleto via Tor) |
| recon/active/httpx_web.txt | Web fingerprint + respostas HTTP |
| recon/active/waf_detection.txt | WAF detection results |
| recon/active/tls_ciphers.txt | TLS/SSL cipher enumeration |
| recon/active/cloudfront_takeover.txt | CloudFront takeover check |
| screenshots/ (gowitness db) | Screenshots dos hosts vivos |

## Próximos Passos Imediatos

1. **Enumeração web** em `https://ifes25-semproxy.selecao.net.br` (sem WAF)
2. **Teste de conexão MySQL** em 64.31.24.186:3306 e 177.53.143.156:3306
3. **Verificação SMTP open relay** em 64.31.24.186:25
4. **Fuzzing de vhosts** nos IPs de proxy (177.53.143.156, 177.71.249.114)
5. **CloudFront takeover** — tentativa de reivindicar as distribuições