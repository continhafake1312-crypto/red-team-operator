# SCOPE — pmminas.com

## Alvo
- **Domínio principal**: `pmminas.com` (https://pmminas.com/)
- **Escopo**: `pmminas.com`, `*.pmminas.com`, `www.pmminas.com` e qualquer
  subdomínio/IP de origem real descoberto no recon (hosts virtuais, IPs
  relacionados via WHOIS/ASN, buckets cloud, APIs, painéis).
- **Tipo**: Web/API + Externo black-box.

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

## Objetivos de alto valor (payoff, §7)
1. Acesso interno (foothold)
2. Acesso administrativo (admin/RCE)
3. Acesso financeiro (pagamentos/transações)
4. Acesso a dados/PII (usuários/clientes)

## Início
- 2026-08-20T03:01Z — engagement iniciado, modo autônomo total (§13).
## Extensão de escopo (ordem direta do humano — 2026-08-20T17:5xZ)
- **ADICIONADO**: `mentoria.metodooba.com.br` + `pmminas.tutory.com.br` — **apenas
  login e área de conta do cliente na Tutory** (LMS da mentoria PMMG).
- **Limites desta extensão**: cred-stuffing rate-limited (máx ~60 tentativas,
  não-destrutivo, só login + enumeração read-only de conta); SEM exploração da
  infra Tutory em si (WAF/ports/APIs internas da plataforma), SEM checkout
  (pay.plataformatutory.com.br segue FORA).
