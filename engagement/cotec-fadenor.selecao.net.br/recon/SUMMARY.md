# Attack Surface Summary — cotec-fadenor.selecao.net.br

> Consolidado em 2026-08-25. Baseado em recon passivo + recon ativo.

## Arquitetura do Alvo

```
Internet → [Cloudflare WAF] → cotec-fadenor.selecao.net.br (403)
                                            ↓ (bypass via semproxy)
Internet → ifes25-semproxy.selecao.net.br → 64.31.24.186 (Backend ProSeleta)
                                            ├── Apache 2.4.41 (Ubuntu) + PHP
                                            ├── MySQL 8.0.32 (porta 3306 exposta!)
                                            ├── OpenSSH 8.2p1 (porta 22)
                                            ├── Postfix SMTP (porta 25)
                                            └── jetdirect (porta 9100)

Internet → proxy-auth.selecao.net.br → 177.53.143.156 (Locaweb)
                                        ├── nginx (502 Bad Gateway)
                                        ├── MySQL 5.5.60 (EOL) (porta 3306)
                                        └── Cert expirado

Internet → proxy-banrisul.selecao.net.br → 177.71.249.114 (Locaweb)
                                           └── nginx (403 Forbidden)

Internet → anteriores.cotec.fadenor.com.br → 143.244.178.136 (Vultr)
                                             ├── nginx 1.18.0
                                             └── Bootstrap 5.3.3
```

## Ranking de Payoff (§16)

### 🔴 ALTO (ações imediatas)
| # | Vetor | Alvo | Payoff | Justificativa |
|---|-------|------|--------|---------------|
| 1 | **MySQL 8.0.32 exposto** | `64.31.24.186:3306` | **ALTO** | Acesso direto ao banco de dados principal. PII de candidatos, creds admin, dados financeiros |
| 2 | **MySQL 5.5.60 (EOL) exposto** | `177.53.143.156:3306` | **ALTO** | Versão EOL desde 2020, múltiplos CVEs conhecidos, pode servir de pivô |
| 3 | **Backend sem WAF** | `ifes25-semproxy.selecao.net.br` | **ALTO** | Sem Cloudflare, acesso direto ao Apache/PHP, painéis admin expostos |
| 4 | **Painéis admin** | `/admin/`, `/painel/`, `/uploads/` | **ALTO** | Acesso administrativo ao sistema de seleção, controle total de dados |
| 5 | **IDOR em documentos** | `/assets/documentos/{ID}/` | **ALTO** | PDFs de candidatos com nomes, CPFs, classificações — violação de privacidade |

### 🟡 MÉDIO
| # | Vetor | Alvo | Payoff | Justificativa |
|---|-------|------|--------|---------------|
| 6 | **LFI/RFI em ?page=** | `ifes25-semproxy.selecao.net.br` | **MÉDIO** | Parâmetro page= suscetível a path traversal |
| 7 | **SMTP exposto** | `64.31.24.186:25` | **MÉDIO** | Postfix pode ser open relay, usado para phishing |
| 8 | **CloudFront takeover** | `*.cdn.selecao.net.br` | **MÉDIO** | 3 distribuições sem conteúdo — possível sequestro de subdomínio |
| 9 | **Proxy auth (502)** | `177.53.143.156` | **MÉDIO** | 502 Bad Gateway pode indicar backend vulnerável, Host header injection |
| 10 | **SSL expirado** | `177.53.143.156:443` | **MÉDIO** | Indica negligência de manutenção, vetor MITM |
| 11 | **Apache 2.4.41 CVEs** | `64.31.24.186:80/443` | **MÉDIO** | CVE-2021-44790 (path traversal), CVE-2021-41773, CVE-2020-1927 |

### 🔵 BAIXO
| # | Vetor | Alvo | Payoff | Justificativa |
|---|-------|------|--------|---------------|
| 12 | **Porta 9100 aberta** | `64.31.24.186:9100` | **BAIXO** | jetdirect raw printing, vetor limitado |
| 13 | **OpenSSH exposto** | `64.31.24.186:22` | **BAIXO** | Força bruta SSH, versão 8.2p1 sem CVEs críticos conhecidos |
| 14 | **nginx 1.18.0** | `143.244.178.136:80/443` | **BAIXO** | CVE-2021-3618 limitado |
| 15 | **Proxy Banrisul (403)** | `177.71.249.114` | **BAIXO** | 403 Forbidden, baixa probabilidade de bypass |
| 16 | **Vhost fuzzing** | `*.selecao.net.br` | **BAIXO** | Já mapeamos 775 subdomínios, retornos marginais |

## Objetivos de Alto Valor (targets primários)
1. **Acesso ao banco MySQL** (64.31.24.186) — PII de candidatos, credenciais admin
2. **Acesso ao painel admin** (/admin/) — RCE via upload/php, gerenciamento de processos seletivos
3. **Acesso ao MySQL 5.5** (177.53.143.156) — pivô para rede interna Locaweb
4. **Credenciais de candidatos/admin** — extração via IDOR, SQLi, brute force

## Próximas Ações Imediatas
1. 🔴 **Enumeração web** em `ifes25-semproxy.selecao.net.br` (diretórios, endpoints, JS params, PHP)
2. 🔴 **Testar conexão MySQL** em `64.31.24.186:3306` (credenciais default/wordlist)
3. 🔴 **Testar conexão MySQL** em `177.53.143.156:3306` (credenciais default para EOL)
4. 🟡 **Fuzzing de endpoints** `/admin/`, `/painel/`, `/uploads/`
5. 🟡 **Testar LFI/RFI** via parâmetro `?page=`
6. 🟡 **Verificar SMTP open relay** (64.31.24.186:25)
7. 🟡 **Verificar CloudFront takeover** via AWS CLI
8. 🔵 **Fuzzing de vhosts** nos IPs proxy