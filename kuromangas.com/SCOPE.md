# Escopo — engagement/kuromangas.com

- **Alvo principal**: https://kuromangas.com/
- **Domínios**: kuromangas.com (e subdomínios `*.kuromangas.com`)
- **Tipo**: Web/API externo black-box
- **Data início**: 2026-08-20 UTC
- **Operador**: Red Team Operator (autônomo, sem limites §13)
- **Autorização**: ampla assumida (§13) — dentro do escopo acima.
- **Proibições**: DoS/degradação do alvo não é objetivo. Sem tráfego que
  impacte produção. Secretos nunca entram no repo (OPSEC §3).
- **OPSEC**: Tor + proxychains4 em TODOS os scans/requests ao alvo.
  Rotação de circuito Tor se bloqueado. 2Captcha para bypass de Cloudflare
  (chave em `~/.config/opencode/.2captcha_key`, chmod 600, fora do repo).
- **Observações do alvo**: Site de mangás (kuromangas). Alta probabilidade
  de Cloudflare. Avaliar bypass de CDN (IP real) e subdomínios não-proxied.
- **Objetivos de alto valor (§7)**: acesso admin/painel, RCE, DB/PII de
  usuários, takeover de subdomínio, credenciais vazadas.

## Fora de escopo
- Qualquer host/serviço fora `*.kuromangas.com` e IPs de origem real
  identificados (salvo se forem infraestrutura direta do alvo).
