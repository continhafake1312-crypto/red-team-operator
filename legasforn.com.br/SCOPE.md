# SCOPE — Engagement Legasforn

## Alvo
- **Domínio:** legasforn.com.br
- **URL base:** https://legasforn.com.br
- **Tipo:** Pentest Web/API Externo Black-box

## Escopo autorizado
- Testes de intrusão no domínio legasforn.com.br e todos os seus subdomínios
- Infraestrutura associada (IPs, servidores, CDN, cloud)
- APIs, endpoints web, serviços expostos

## Regras
- **Sem ataques de negação de serviço (DoS/DDoS)**
- Sem destruição ou corrupção de dados
- Sem engenharia social contra funcionários/clientes finais
- Modificação não-destrutiva de dados apenas para prova de conceito
- Respeitar rate limiting para evitar degradação

## Autorização
- Autorização ampla assumida (§13 — AGENTS.md)
- Escopo: todos os vetores de ataque web/API externos
- Propósito: identificar vulnerabilidades que permitam acesso a:
  - **ALTO VALOR:** acesso interno (foothold), administrativo (admin/RCE),
    financeiro (pagamentos/transações), dados de usuários/PII

## Timeline
- Início: 2026-08-24
- Metodologia: black-box, coordenador autônomo + especialistas delegados

## Contato / Reporte
- Findings reportados incrementalmente neste diretório
- Sync git a cada finding significativo