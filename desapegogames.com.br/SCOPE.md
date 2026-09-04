# SCOPE.md — Engagement: desapegogames.com.br

> **Red Team Operator — Framework de Pentest Autônomo**

## Metadados do Engagement

| Campo | Valor |
|-------|-------|
| **Alvo principal** | `https://desapegogames.com.br/` |
| **Domínio raiz** | `desapegogames.com.br` |
| **Engagement dir** | `desapegogames.com.br/` |
| **Data de início** | 2026-09-04T22:43:13Z |
| **Operador** | Red Team Operator (autônomo) |
| **Status** | EM ANDAMENTO |

## Escopo Autorizado

Assume autorização ampla (§13). O escopo compreende:

- **Domínio raiz:** `desapegogames.com.br` e TODOS os subdomínios
  (`*.desapegogames.com.br`)
- **Infraestrutura:** IPs de origem real (fora CDN), serviços expostos
  nesses IPs
- **Aplicações web:** TODAS as aplicações/serviços web servidos pelo
  domínio e subdomínios
- **APIs:** TODOS os endpoints de API expostos
- **Serviços de rede:** Portas/serviços expostos nos IPs do alvo

## Fora de Escopo

- Terceiros não relacionadas (provedores de CDN na camada de borde,
  desde que não sirvam conteúdo do alvo)
- Atividades que causem DoS degradando produção

## Regras de Engajamento

- **Modo:** black-box externo
- **OPSEC:** Tor + proxychains4 em TODOS os scans/requests. 2Captcha para
  bypass Cloudflare. Rate limiting, UA rotativo. Nunca usar IP real do
  operador contra o alvo.
- **Exploração:** não-destrutiva (read-only, não-drop, não-modify dados
  reais). Proof-of-concept sem persistência.
- **Secretos:** NUNCA entram no repo. Chaves em arquivos chmod 600 fora do
  repo (`~/.config/opencode/.2captcha_key`).

## Objetivos de Alto Valor (§7)

| Prioridade | Objetivo | Status |
|-----------|----------|--------|
| 1 | Acesso admin/painel de gestão | PENDENTE |
| 2 | Acesso a dados de clientes/PII (cadastro, pedidos) | PENDENTE |
| 3 | Acesso a área financeira/transacional | PENDENTE |
| 4 | RCE / foothold no servidor | PENDENTE |
| 5 | Credenciais vazadas (DB, API, SMTP) | PENDENTE |

## Negócio

Desapego Games — marketplace/e-commerce de jogos (provável). A determinar
stack, infra e natureza exata do negócio durante o recon.

## Ferramentas OPSEC

| Ferramenta | Localização |
|-----------|-------------|
| 2Captcha key | `~/.config/opencode/.2captcha_key` (chmod 600) |
| Tor | SOCKS5 `127.0.0.1:9050` |
| proxychains4 | `/usr/bin/proxychains4` |
| Git remote | `github.com/continhafake1312-crypto/red-team-operator.git` |
