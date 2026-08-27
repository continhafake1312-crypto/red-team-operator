# SCOPE — Engagement de Pentest

## Alvo
- **Domínio principal:** `concurseiroprime.com.br`
- **URL:** `https://concurseiroprime.com.br/`
- **Negócio:** Plataforma de cursos/preparação para concursos (educação)
- **Stack observada (pré-recon):** Laravel (cookies XSRF-TOKEN + laravel_session), Inertia.js, Cloudflare CDN, gateways de pagamento (Pagar.me, Asaas, Getnet, Rede, Mercado Pago), Hubspot, Pandavideo/ConverteAI/VTurb (VSL).

## Escopo Autorizado
- **Inclui:** todos os subdomínios de `concurseiroprime.com.br`, todos os IPs/infra associados, todas as portas/serviços expostos, todas as aplicações web/APIs.
- **Autorização:** ampla (modo black-box, red team). Assume autorização total conforme §13 do AGENTS.md.
- **Janela:** 24/7.

## Fora de Escopo
- Serviços de terceiros não-hospedados pelo alvo (Cloudflare edge, gateways de pagamento externos, YouTube, Google Analytics, Hubspot SaaS) — apenas como pivô de informação, sem ataque.
- DoS / degradação de serviço (exploração é não-destrutiva).

## Regras de Engajamento
- **OPSEC:** Tor + proxychains4 em TODOS os scans/requests. Rotação de IP via NEWNYM. UA rotativo. 2Captcha para bypass Cloudflare (chave em `~/.config/opencode/.2captcha_key`, chmod 600, fora do repo).
- **Não-destrutivo:** read-only em exploração. Não modificar dados, não persistir, não dropar.
- **Secretos:** NUNCA entram no repo — variáveis de ambiente ou arquivos chmod 600 fora do repo.

## Objetivos de Alto Valor (§7)
- Acesso admin / painel de gestão (Laravel Nova/Filament/Backpack/custom)
- Vazamento de PII de alunos (CPF, email, telefone, endereço)
- Dados financeiros / transações (gateways de pagamento)
- Credenciais de BD/API/SMTP/Cloud
- RCE / shell no servidor
- Bypass de autenticação / account takeover de alunos

## Sync Git
- Auto-sync a cada finding/cred/acesso: `git add -A && git commit -m "engagement/concurseiroprime.com.br — sync <ISO8601 UTC>" && git push origin main`

---
*Criado em 2026-08-27T03:25:00Z*
