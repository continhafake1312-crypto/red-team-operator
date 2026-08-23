# PASSIVE RECON - StormApplications.com

## Sumário Executivo
- **Alvo**: stormapplications.com (StorM Applications)
- **CNPJ**: 56.913.071/0001-30
- **Registro**: Hostinger (criado 2024-01-14)
- **DNS**: Cloudflare (NS, MX, SPF) | Sem DMARC | AXFR negada
- **Subdomínios descobertos**: 12 (mais o apex)
- **Hosts vivos**: 10 com resposta HTTP
- **Origem real**: AWS (us-east-1 via discloud.com) + Vercel + Cloudflare

---

## DNS & WHOIS
| Campo | Valor |
|---|---|
| Domínio | stormapplications.com |
| Criado | 2024-01-14 |
| Expira | 2027-01-14 |
| Registrador | HOSTINGER operations, UAB |
| NS | duke.ns.cloudflare.com / rosa.ns.cloudflare.com |
| MX | route{1,2,3}.mx.cloudflare.net |
| SPF | v=spf1 include:_spf.mx.cloudflare.net ~all |
| DMARC | NÃO CONFIGURADO |
| CAA | NÃO CONFIGURADO |
| Google Verif | YhVwPmJOry1s_wGlIrOyXi1de-d0sDswKpwb2dec1MU |
| AXFR | FALHOU (esperado, Cloudflare) |
| A (apex) | 76.76.21.21 (Vercel/AS16509) |

---

## Subdomínios (13 no total)
```
stormapplications.com           76.76.21.21          Vercel (307 → www)
www.stormapplications.com       172.67.150.146       Cloudflare + Vercel/Next.js (200)
                                104.21.39.240
api-beta.stormapplications.com  75.2.96.173          AWS → discloud.com (403)
                                99.83.186.151
apitesteeee.stormapplications.com 75.2.96.173         AWS → Caddy/Go (308)
                                99.83.186.151
auth.stormapplications.com      172.67.150.146       Cloudflare (302 → mng/api/login)
                                104.21.39.240
beta.stormapplications.com      -                    Sem resposta HTTP
blob.stormapplications.com      172.67.150.146       Cloudflare (404)
                                104.21.39.240
discord.stormapplications.com   172.67.150.146       Cloudflare (301 → discord.gg/kKf8yjfb56)
                                104.21.39.240
manager.stormapplications.com   172.67.150.146       Cloudflare (301 → mng)
                                104.21.39.240
marketplacee.stormapplications.com 76.76.21.98       Vercel/Next.js (200)
                                66.33.60.67
mng.stormapplications.com       172.67.150.146       Cloudflare + AWS/discloud.com (403)
                                104.21.39.240
status.stormapplications.com    167.235.220.62       BetterUptime/Hetzner (302)
wallet.stormapplications.com    172.67.150.146       Cloudflare (404)
                                104.21.39.240
```

### CNAMEs Externos
| Subdomínio | CNAME | Serviço |
|---|---|---|
| marketplacee | cname.vercel-dns.com | Vercel |
| status | statuspage.betteruptime.com | BetterUptime (Hetzner) |

---

## Tech Stack por Host
| Host | Tech |
|---|---|
| www.stormapplications.com | Cloudflare, Next.js, React, Node.js, Vercel, webpack |
| marketplacee.stormapplications.com | Vercel, Next.js, React, Node.js, webpack |
| mng.stormapplications.com | Cloudflare, Caddy → AWS, discloud.com |
| auth.stormapplications.com | Cloudflare |
| api-beta.stormapplications.com | AWS, Caddy, discloud.com, CORS aberto |
| apitesteeee.stormapplications.com | AWS, Caddy, Go |
| discord.stormapplications.com | Cloudflare (redirect p/ Discord) |
| status.stormapplications.com | BetterUptime (Hetzner) |
| blob/wallet | Cloudflare (ambos 404) |

**Backend real**: `discloud.com` (plataforma de hospedagem de bots Discord)
- Headers `x-aws-instance-id`, `x-aws-region` presentes
- Região AWS: us-east-1
- `X-Powered-By: discloud.com`

### Favicon Hash
- `mmh3:-2070047203` (mesmo hash em stormapps.com, www e marketplacee)
- Útil para correlação Shodan quando API disponível

---

## OSINT
### Empresa
- **Nome**: StorM Applications
- **CNPJ**: 56.913.071/0001-30
- **Negócio**: Bots de venda para Discord com PIX, tickets e verificação
- **Idioma**: Português (BR) - mercado brasileiro
- **Planos**: a partir de R$ 9,90/mês
- **Métodos de pagamento**: Mercado Pago, Efí Bank, PagBank, StorM Wallet

### GitHub
- Repositório: `jooita/StormApplications` (word count com Apache Kafka)

### Discord
- `discord.gg/kKf8yjfb56` → servidor Discord "StorM"

### E-mails/Usuários
- Google verification: `YhVwPmJOry1s_wGlIrOyXi1de-d0sDswKpwb2dec1MU`
- Nenhum email adicional encontrado via theHarvester (API keys ausentes)

### Security.txt
- Não implementado (apenas redirect 307)

---

## Cloud Buckets
Nenhum bucket S3/Azure/GCP encontrado nas variações testadas:
- stormapplications, storm-applications, stormapplicationsapp, stormapp, stormapplications-assets, stormapplications-backup, stormapplications-data, stormapplications-static, stormapplications-media, stormapplications-dev, stormapplications-prod, stormapplications-staging

---

## Wayback Machine
- **Total de URLs**: 240 (domínio principal)
- **Arquivos JS**: 135
- **Endpoints sensíveis**: `/login`, `/api/login`, `/admin` (dashboard routes via Next.js chunks), `.well-known/openid-configuration`, `.well-known/security.txt`
- **Tutoriais**: `/tutoriais/botconfig`, `/tutoriais/comandos/config-cupom`, `/tutoriais/comandos/config-painel`, `/tutoriais/integracao-api`
- **Rotas internas**: `/(dashboard)/` no Next.js

### Well-known endpoints respondendo (307 redirect para www)
- `/.well-known/ai-plugin.json`
- `/.well-known/assetlinks.json`
- `/.well-known/gpc.json`
- `/.well-known/nodeinfo`
- `/.well-known/openid-configuration`
- `/.well-known/security.txt`

---

## Takeover Candidates
- `marketplacee.stormapplications.com` → CNAME `cname.vercel-dns.com` (Vercel - verificar se o Vercel project ainda existe)
- `status.stormapplications.com` → CNAME `statuspage.betteruptime.com` (BetterUptime - baixo risco)
- Nenhum dangling CNAME óbvio identificado

---

## Limitações
1. **crt.sh**: retornou erro (rate limit/bloqueio) - certspotter alternativo foi usado parcialmente
2. **Shodan/Censys**: Sem API keys configuradas → favicon hash preparado (`mmh3:-2070047203`) para consulta futura
3. **theHarvester**: Limitado por falta de API keys (GitHub, Shodan, Hunter, etc.)
4. **DMARC**: Não configurado → vulnerabilidade a spoofing
5. **Cloudflare**: IPs reais atrás de proxy (exceto api-beta, apitesteeee, marketplacee, status)

---

## Próximos Passos (Recomendados para Recon Ativo)
1. **Fuzz de subdomínios** com wordlist maior (dnsbrute, ffuf)
2. **Varrer `/api` endpoints** no `mng.stormapplications.com` (retorna 403 - bypass?)
3. **Testar `api-beta.stormapplications.com`** (CORS aberto, 403 → tentar bypass de auth)
4. **Verificar takeover** do `marketplacee.stormapplications.com` (CNAME Vercel)
5. **Analisar JS bundles** do Next.js para endpoints internos e chaves
6. **Força bruta** em `mng.stormapplications.com/api/login` (retornou "Erro na Verificação")
7. **Email spoofing** devido à falta de DMARC
8. **Shodan search** pelo favicon hash `-2070047203` quando API disponível
9. **GitHub dorks** profundos no repositório `jooita/StormApplications`
10. **Google dorks**: `site:stormapplications.com`, `site:*.stormapplications.com`