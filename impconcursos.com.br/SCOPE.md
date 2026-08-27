# SCOPE — Engagement de Pentest

## Alvo principal
- **Domínio:** `impconcursos.com.br` (https://impconcursos.com.br/)
- **Tipo:** Loja/Site Shopify (CNAME `shops.myshopify.com`, IPs `23.227.38.32` / `23.227.38.74`)
- **Negócio:** Concursos (vendemos provas/cursos/preparatórios — e-commerce de conteúdo digital)

## Escopo autorizado (§13 — autorização ampla assumida)
- Aplicação web pública (`impconcursos.com.br` e TODOS os subdomínios).
- Infra exposta do alvo (portas/serviços) — quando não hospedada em SaaS
  gerenciado (Shopify). A infra SaaS do Shopify em si está FORA de escopo
  (não atacar `myshopify.com` core); atacamos apenas a configuração/exposição
  da loja do cliente (theme, apps, endpoints, APIs expostas, subdomínios).
- Endpoints/rotas/APIs da loja (Storefront API, AJAX Cart, checkout,
  account, product, collection, search).
- Subdomínios do domínio `impconcursos.com.br` (incluindo takeover).
- OSINT sobre empresa, pessoas, credenciais vazadas.

## Fora de escopo
- Infraestrutura core do Shopify (`myshopify.com`, `shopify.com`) — não
  atacar a plataforma SaaS em si, apenas a loja/config do cliente.
- DoS / degradação de serviço.
- Persistência sem ordem explícita do operador.

## Regras
- OPSEC: Tor + proxychains4 em TODOS os scans/requests ao alvo.
- 2Captcha para bypass Cloudflare (chave em `~/.config/opencode/.2captcha_key`, chmod 600, fora do repo).
- Exploração **não-destrutiva** (read-only, não modificar dados).
- Rate limiting, user-agent rotativo, stealth.
- **Secretos nunca entram no repo.**
- Artefatos em pt-BR.

## Objetivos de alto valor (§7)
1. Acesso administrativo à loja (admin Shopify / painel do cliente).
2. Acesso a dados/PII de clientes (cadastros, pedidos, emails, CPF).
3. Acesso financeiro (pedidos, pagamentos, checkout bypass).
4. Foothold em infra própria (se existir — subdomínios não-Shopify).

## Data de início
2026-08-27 (UTC)
