# SCOPE.md — stormapplications.com

## Alvo
- **Domínio principal**: `stormapplications.com`
- **URL**: `https://www.stormapplications.com/`
- **Tipo**: Pentest Web/API Externo Black-Box

## Autorização
- **Escopo autorizado**: `*.stormapplications.com` e todos os subdomínios/recursos associados ao domínio principal.
- **Testes permitidos**: Exploração não-destrutiva, scans com rate limiting, brute force controlado, default creds, todos os vetores OWASP Top 10.
- **Proibido**: DoS, DDoS, engenharia social contra funcionários, acesso a sistemas de terceiros não autorizados, exfiltração de dados reais.
- **Contato de emergência**: N/A (engagement autônomo black-box autorizado pelo operador §13).

## Regras OPSEC
- `proxychains4` em todos os requests ao alvo.
- Rotação de IP Tor via `NEWNYM` se bloqueado.
- 2Captcha disponível em `~/.config/opencode/.2captcha_key` para bypass de Cloudflare/Captcha.
- Stealth rate limiting: delay mínimo 1s entre requests, user-agent rotativo.
- Secretos nunca entram no repo.

## Duração
- Engagement contínuo até exaustão de vetores ou ordem do operador.

## Metodologia
- Framework Red Team — fases obrigatórias: recon passivo → recon ativo → enum → webapp → CVE/exploit → pós-ex (se foothold) → relatório.
- Caçada de vetores contínua (§19): se um vetor não renderiza, caça outro sem perguntar.