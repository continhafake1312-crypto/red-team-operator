# SUMMARY — Attack Surface Consolidado

## T1: netmovies.com.br (PRIORIDADE ABSOLUTA)

### Infraestrutura
| Item | Valor |
|------|-------|
| IPs reais | 56.126.19.14, 18.229.14.249 (AWS sa-east-1, ELB) |
| CDN | ❌ NENHUMA — IPs expostos diretamente |
| WAF | ❌ NENHUM — tráfego TCP/IP diretamente nos IPs |
| Web Server | awselb/2.0 |
| Framework | Next.js v1.1.0 (SSR/SSG) + ASP.NET Core (API) |
| Backend API | Kestrel em netmovies-service.ottvs.com.br |
| DNS | AWS Route53, DMARC p=none |
| Email | Office 365, Zendesk |
| TLS | GlobalSign AlphaSSL, TLS 1.3 |

### Ecosystem OTT (descoberto via JS)
| Subdomínio | Função |
|------------|--------|
| netmovies-service.ottvs.com.br | API REST (60+ endpoints) |
| heartbeatservice.ottvs.com.br | Heartbeat |
| license.ottvs.com.br | DRM (Widevine/PlayReady/FairPlay) |
| ottvsmisc.blob.core.windows.net | Azure Blob (configs + certs) |
| ottvsimg.ottvs.com.br | CDN imagens |
| asset-01.ottvs.com.br | Streaming assets |

### Ranking de Payoff

| # | Vetor | Payoff | Next Step |
|---|-------|--------|-----------|
| 1 | API Secret vazado: `netmovies@netmovies:a1c2af@#$` | Autenticação total na API | Cred-stuffing, IDOR, mass assignment |
| 2 | /VerifyUserExist enum | Lista de emails de usuários | Enumerar O365 emails |
| 3 | /GetMediaUrl IDOR | Acesso a streaming sem auth | Extrair MediaIds (1..N) |
| 4 | Firebase keys (lisatests) | Acesso Firebase DB | testar .json endpoint |
| 5 | Azure Blob (appconfigs) | Configs + cert DRM expostos | Tentar listar container |
| 6 | Login API sem rate-limit | Brute force de senhas | Testar com email list |
| 7 | Dados PII via API | CPF, endereço, tel | Extrair via GetUserInfo |
| 8 | Azure takeover (prod/tests) | Sequestro subdomínio | Precisa conta Azure |

## T2: filmenoisubtitrate.eu (BAIXA PRIORIDADE)

| Item | Valor |
|------|-------|
| Status | Cloudflare 403 (WAF JS challenge) |
| IPs | 172.67.154.22, 104.21.34.32 (falso — Cloudflare) |
| IP real | ❌ NÃO DESCOBERTO |
| Tech (hist) | WordPress (2014-2019, romeno) |
| Bypass status | ❌ FALHOU (Tor rotation, UA rotation) |

## T3: filmekstra.com (BAIXA PRIORIDADE)

| Item | Valor |
|------|-------|
| Status | Cloudflare 403 (WAF JS challenge) |
| IPs | 104.21.93.242, 172.67.216.224 (falso — Cloudflare) |
| IP real | ❌ NÃO DESCOBERTO |
| Idade | 15 dias (criado 2026-08-05) |
| Bypass status | ❌ FALHOU (Tor rotation, UA rotation) |

## Próximos Passos
1. **Imediato**: Atacar API com secret vazado — login, IDOR, mass assignment
2. **Imediato**: Enumerar emails via VerifyUserExist
3. **Imediato**: Testar Firebase DB (lisatests.firebaseio.com/.json)
4. **Médio**: Listar Azure Blob container
5. **Médio**: Brute force login via API (/Login)
6. **Baixo**: Monitorar T2/T3 para bypass alternativo