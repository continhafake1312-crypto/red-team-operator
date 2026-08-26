# SCOPE — Engagement vumpe.com

**Alvo:** https://www.vumpe.com/
**Domínio base:** vumpe.com
**Tipo:** Web/API externo black-box
**Início:** 2026-08-25T00:00:00Z
**Status:** Ativo

## Escopo Autorizado

- **Domínios primários:**
  - `vumpe.com`
  - `www.vumpe.com`
  - Subdomínios de `vumpe.com` (descobertos durante recon)
- **IPs:** Qualquer IP que sirva conteúdo para os domínios acima
- **Serviços:** Web (HTTP/HTTPS), APIs, subdomínios, buckets cloud
- **Portas:** Todas (descoberta via portscan)

## Limitações / Regras

- **Proibido:** DoS, DDoS, ataques de negação de serviço
- **Proibido:** Modificação/destruição de dados (exploração não-destrutiva)
- **Proibido:** Engenharia social contra funcionários
- **Proibido:** Ataques a terceiros (fornecedores, parceiros) sem escopo explícito
- **Permitido:** Scans, enumeração, brute force rate-limited, validação de PoCs
- **Permitido:** Automação com rate limiting (evitar WAF triggers)
- **Autorização ampla:** Assumida conforme §13 do AGENTS.md e skill pentest-methodology

## OPSEC

- **Proxy obrigatório:** Tor + proxychains4 em todos os scans/requests
- **Rate limiting:** Respeitar thresholds; evitar bloqueio por WAF/Cloudflare
- **2Captcha:** Chave configurada em `~/.config/opencode/.2captcha_key`
- **Rotação de IP:** Via Tor NEWNYM se bloqueado
- **User-Agent:** Rotativo (pool de UAs reais)
- **Secretos:** Nunca entram no repo

## Contato de Emergência

- Operador: Via chat do OpenCode (humano)
- Se instrução de parada recebida → pare imediatamente

## Metodologia

Engagement seguindo fases:
1. Escopo (este documento)
2. Recon passivo + OSINT
3. Recon ativo
4. Consolidação do attack surface
5. Enumeração profunda
6. Ataque webapp
7. CVE research + exploit
8. Pós-exploração (se foothold)
9. Relatório

**Todas as fases delegadas a subagentes especialistas via `task`.**