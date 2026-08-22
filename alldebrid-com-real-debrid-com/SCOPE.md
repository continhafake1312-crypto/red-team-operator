# SCOPE.md — Engagement: alldebrid-com-real-debrid-com

## Alvos
- **alldebrid.com** (https://alldebrid.com/)
- **real-debrid.com** (https://real-debrid.com/)

## Tipo de engagement
- **Web/API + Externo black-box**
- Reconhecimento passivo → Reconhecimento ativo → Enumeração → Ataque WebApp → CVE/Exploit → Pós-exploração → Relatório

## Autorização
- Autorização ampla assumida conforme §13 do AGENTS.md
- Escopo: todos os subdomínios, APIs, aplicações web, infraestrutura exposta publicamente
- Janela: contínua até conclusão ou ordem de parada

## Regras de engajamento
- **OPSEC obrigatório**: Tor + proxychains4 em TODOS os requests/scans ao alvo
- 2Captcha configurado para bypass Cloudflare (chave fora do repo, chmod 600)
- Rate limiting e user-agent rotativo
- **NÃO** realizar DoS ou ações destrutivas
- Exploração não-destrutiva apenas (validação de PoCs, creds default, info disclosure)
- Secretos NUNCA entram no repo (variáveis de ambiente / arquivos chmod 600 fora do repo)

## Objetivos de alto valor (prioridade de payoff §7)
1. Acesso interno (foothold/RCE)
2. Acesso administrativo (painel admin, bypass auth)
3. Acesso financeiro (pagamentos, transações, assinaturas)
4. Acesso a dados/PII (usuários, emails, tokens, histórico de downloads)

## Entregáveis obrigatórios
- `SCOPE.md` — este arquivo
- `PLAN.md` — plano vivo, espelho do todowrite
- `REPORT.md` — relatório incremental
- `timeline.log` — cronologia ISO8601
- `recon/SUMMARY.md` — attack surface + ranking de payoff
- `evidence/F-XXX.txt` — evidências de findings
- `exploit/pocs/` — PoCs clonadas/validadas
- `loot/` — artefatos de pós-exploração (se foothold)

## Sync Git
- Auto-sync a cada finding, cred ou acesso conquistado
- `git add -A && git commit -m "engagement/alldebrid-com-real-debrid-com — sync <ISO8601 UTC>" && git push origin main`

## 2Captcha
- API Key: configurada fora do repositório (chmod 600)
- Uso: bypass Cloudflare em ambos os alvos