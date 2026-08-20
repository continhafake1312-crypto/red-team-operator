# SCOPE — netmovies.com.br + filmenoisubtitrate.eu + filmekstra.com

## Alvos
| # | Domínio | Tipo | Suspeita |
|---|---------|------|----------|
| 1 | `netmovies.com.br` (www.netmovies.com.br) | Streaming/Brazilian | Site de filmes/séries brasileiro |
| 2 | `filmenoisubtitrate.eu` | Subtitles/European | Site de legendas |
| 3 | `filmekstra.com` | Movie extras | Site de conteúdo cinematográfico |

**Escopo expandido**: `*.netmovies.com.br`, `*.filmenoisubtitrate.eu`, `*.filmekstra.com`
e qualquer subdomínio/IP de origem real descoberto no recon (hosts virtuais, IPs
relacionados via WHOIS/ASN, buckets cloud, APIs, painéis).

**Tipo**: Web/API + Externo black-box (3 alvos independentes).

## Autorização
- Autorização ampla assumida (§13). Nenhuma ação técnica dentro do escopo
  requer confirmação do operador.
- **Limites**: exploração não-destrutiva (read-only, sem drop/modificação de
  dados reais, sem DoS/degradação de produção, sem persistência sem ordem,
  sem exfiltração de dados para serviços externos).

## Regras de engajamento (§10)
1. **OPSEC** (§3): `proxychains4` em TODOS os scans/requests ao alvo.
   Rotação de IP Tor se bloqueado. Nunca usar IP real do operador.
2. **Rate limiting** + user-agent rotativo (pool de UAs reais).
3. **Sem degradação** do alvo (DoS não é objetivo).
4. **Secretos nunca entram no repo** (env vars / arquivos chmod 600 fora do repo).
5. **Auto-sync git** (§14): commit + push a cada finding, cred/acesso, e ao
   final de cada fase.
6. **Artefatos em pt-BR** (§idioma).
7. **Evidência obrigatória** (§8): todo finding com `evidence/F-XXX.txt`.
8. **2Captcha** para bypass de Cloudflare (chave em `~/.config/opencode/.2captcha_key`).

## Objetivos de alto valor (payoff, §7)
1. Acesso interno (foothold) — shell/panel admin
2. Acesso administrativo (admin/RCE) — CMS painels, SSH, databases
3. Acesso financeiro (pagamentos/transações) — assinaturas, planos
4. Acesso a dados/PII (usuários/clientes) — emails, senhas, dados pessoais
5. Buckets/cloud com dados sensíveis vazados
6. Subdomínio takeover para escalação de ataque

## Início
- 2026-08-20T03:15:00Z — engagement iniciado, modo autônomo total (§13).
- 3 alvos independentes — processamento paralelo quando possível.