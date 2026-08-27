# recon/SUMMARY.md — Attack Surface Consolidada — pgfconcursos.com

> Fases 2+3 consolidadas. 2026-08-27T05:22:00Z. OPSEC: Tor + proxychains4.

## 1. Metadados do alvo
- **Domínio:** pgfconcursos.com (https://pgfconcursos.com/)
- **Negócio:** Curso preparatório para concursos públicos.
- **Dono (OSINT):** Professor Gustavo Fregapani (PUC/RS, ex-Procurador). PGF = Professor Gustavo Fregapani.
- **Outra pessoa:** Jeferson Ortiz Rosa (professor). **Joel H. Metz** (autor meta tag — provável dev).
- **Contato:** pgfconcursos@gmail.com (usam Gmail, não domínio próprio), tel +55 51 99148-8239.
- **Social:** facebook/instagram `pgfconcursos`, youtube `gustavofregapani`.

## 2. Infraestrutura
- **IP real:** 45.151.121.124 (Hostinger shared).
- **Hosts vivos:** pgfconcursos.com, www (→ IP real); ftp, autodiscover, autoconfig (mail Hostinger/Google).
- **Portas expostas:** apenas 80/443 (LiteSpeed). Nenhum serviço não-web público.
- **Sem CDN/WAF real** (apenas anti-bot leve por UA). Cloudflare ausente.
- **TLS:** Let's Encrypt, TLS 1.2/1.3, 1.0/1.1 desabilitados. SANs = apex + www apenas.

## 3. Stack
- **Servidor:** LiteSpeed (Hostinger hPanel). HTTP/2 & HTTP/3.
- **Linguagem:** PHP **7.3.33 (EOL)**, header `x-powered-by` exposto.
- **App:** PHP próprio (cookie cru `PHPSESSID`). Sem CMS/framework conhecido.
- **Front:** jQuery, Modernizr, SweetAlert, Google Analytics.
- **Pagamento:** PagSeguro.

## 4. Endpoints de aplicativo (de JS — alto valor)
| Endpoint | Método | Params | Vetor |
|---|---|---|---|
| `/login` | GET/POST | — | auth bypass, default creds, brute |
| `/cadastro` | POST | — | mass assignment, CPF leak |
| `/recuperar-senha` | POST | — | account takeover, token predizível |
| `/search?q=` | GET | q | SQLi, XSS reflected |
| `/checkout` | POST | id | **IDOR / price tampering** |
| `/checkoutcupom` | POST | id, cupom | **IDOR, business logic cupom** |
| `/find_cupom` | POST | cupom, valorcurso | cupom brute, price tampering |
| `/pesquisa/{nome}/cpf/{cpf}` | GET | — | **área admin: busca de alunos por CPF** (path raiz desconhecido → content discovery) |

## 5. OSINT / Cloud / Takeover
- **Emails:** pgfconcursos@gmail.com (único). Sem emails corporativos no domínio.
- **Breaches:** HIBP sem API key (anotado). GitHub: 0 repos públicos.
- **Buckets cloud:** nenhum público (22 variações testadas S3/Azure/GCP/DO).
- **Takeover:** nenhum CNAME dangling. Sem candidates.

## 6. Wayback
- 2.662 URLs / 2.629 paths (gau). waybackurls bloqueado. Extrair paths únicos em Fase 5.

## 7. Ranking de payoff (re-priorizado — §16)
| # | Prioridade | Vetor | Próxima ação |
|---|---|---|---|
| 1 | **ALTO** | Auth bypass / default creds no painel admin (busca por CPF) | content discovery p/ achar path admin |
| 2 | **ALTO** | IDOR em `/checkout`, `/checkoutcupom` (price tampering) | webapp |
| 3 | **ALTO** | Credential stuffing em pgfconcursos@gmail.com (paineis externos: Gmail, PagSeguro, Hostinger) | webapp/exploit |
| 4 | **ALTO** | PHP 7.3.33 EOL + sem WAF → CVEs, LFI, upload RCE | enum/cve |
| 5 | **MÉDIO** | SQLi/XSS em `/search` | webapp |
| 6 | **MÉDIO** | Account takeover em `/recuperar-senha` | webapp |
| 7 | **MÉDIO** | Cupom brute / business logic em `/find_cupom` | webapp |
| 8 | **MÉDIO** | Mass assignment / CPF leak em `/cadastro` | webapp |
| 9 | **BAIXO** | Info disclosure (PHP version, headers) | report |
| 10 | **BAIXO** | Spoofing de e-mail (DMARC p=none, SPF ~all) | report |

## 8. Objetivos de alto valor (§7)
1. **Acesso admin** ao painel (busca alunos por CPF) → foothold + PII.
2. **PII de alunos** (cadastro, CPF, pagamentos PagSeguro).
3. **Acesso financeiro** (transações PagSeguro — via account takeover do email).
4. **RCE** (upload PHP, LFI, PHP EOL CVE).

## 9. Decisão do coordenador
Avançar para **Fase 5 (Enumeração profunda)** — priorizar content discovery para localizar o path raiz do endpoint admin (`/pesquisa/...`), JS analysis completo, param mining. Depois **Fase 6 (webapp)** focada em auth bypass admin + IDOR checkout + SQLi search.
