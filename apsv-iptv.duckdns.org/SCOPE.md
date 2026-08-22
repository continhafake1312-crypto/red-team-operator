# SCOPE — apsv-iptv.duckdns.org

## Alvo
- **Domínio principal**: `apsv-iptv.duckdns.org`
- **Protocolo**: HTTPS (porta 443)
- **Nicho**: IPTV / streaming

## Escopo autorizado
Pentest Web/API externo black-box completo. Assumimos autorização ampla
conforme §13 do AGENTS.md. Inclui:

- Recon passivo completo (DNS, subdomínios, OSINT, wayback, cloud buckets)
- Recon ativo (portscan, fingerprint, vhosts)
- Enumeração profunda (content discovery, JS analysis, API, CMS)
- Ataque webapp (OWASP Top 10, auth bypass, injection, IDOR, SSRF, XSS)
- CVE research e validação de exploits (não-destrutiva)
- Pós-exploração se foothold obtido (privesc, loot, pivoting)

## Regras
- **Exploração não-destrutiva**: sem DoS, sem modificar/deletar dados reais
- **Rate limiting**: respeitar servidor, espaçar requests
- **OPSEC**: Tor obrigatório em todos os requests ao alvo
- **Dados**: PII encontrada é registrada como evidência, não extraída

## Objetivos de alto valor (§7)
1. Acesso interno (foothold na infra)
2. Acesso administrativo (painel admin, RCE)
3. Acesso financeiro (assinaturas, pagamentos)
4. Acesso a dados/PII (usuários, clientes)

## Timeline
- Início: 2026-08-22T21:38:00Z
- Fim: a definir

## Operador
- Red Team Operator autônomo
- Delegado por: humano operador