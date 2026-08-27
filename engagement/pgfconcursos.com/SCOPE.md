# SCOPE — pgfconcursos.com

## Alvo
- **Domínio principal:** `pgfconcursos.com`
- **URL:** `https://pgfconcursos.com/`
- **Negócio:** Curso preparatório para concursos públicos (PGF — Provimento
  de Garantia da Função? marca de concursos).
- **Stack observada (rápida):** Hostinger / LiteSpeed / PHP 7.3.33.
  Sem Cloudflare aparente no front (confirmar no recon ativo).
- **Dica do operador:** 2Captcha pode ser necessário — chave em
  `~/.config/opencode/.2captcha_key` (chmod 600, fora do repo).

## Escopo autorizado (assumido amplo — §13)
- TODO o domínio `pgfconcursos.com` e seus subdomínios resolvidos.
- Todos os hosts/IPs apontados pelo DNS do alvo (incl. infra Hostinger).
- Aplicações web, APIs, painéis, endpoints administrativos.
- Serviços expostos em portas TCP/UDP dos hosts do alvo.
- **Fora do escopo:** provedores de terceiros não integrados
  (ex.: CDN legítima, gateways de pagamento externos) salvo se
  hospedarem conteúdo do alvo (ex.: subdomínio CNAME para S3 do alvo).

## Objetivos de alto valor (§7)
1. **Acesso interno/foothold** (RCE, upload de shell, LFI→RCE).
2. **Acesso administrativo** ao painel/CMS do curso.
3. **Acesso a dados/PII** de alunos (cadastro, pagamentos, provas).
4. **Acesso financeiro** (transações, faturamento, gateways).

## Regras de engajamento (§13, §3)
- **Modo autônomo total sem limites**: nenhuma ação técnica dentro do
  escopo requer confirmação do operador.
- **OPSEC**: Tor + proxychains4 em TODOS os scans/requests ao alvo.
  Rotação de IP via NEWNYM se IP for bloqueado. UA rotativo. Rate
  limiting. **DoS não é objetivo** — não degradar o alvo.
- **Exploração não-destrutiva**: read-only. Não modificar dados,
  não criar usuários reais, não persistir shells sem ordem explícita.
- **Secretos nunca entram no repo** (chaves, creds, tokens) — usar
  variáveis de ambiente ou arquivos chmod 600 fora do repo.
- **2Captcha** disponível para bypass de Cloudflare/captcha se necessário.

## Entregáveis obrigatórios
- `SCOPE.md` (este), `PLAN.md`, `REPORT.md`, `timeline.log`
- `recon/SUMMARY.md` (attack surface + ranking de payoff)
- `recon/passive/PASSIVE.md`, `recon/active/ACTIVE.md`
- `enum/ENUM.md` por host
- `evidence/F-XXX.txt` por finding
- `exploit/cve_research.md`, `exploit/pocs/`
- `loot/creds.txt`, `loot/access.txt` (se foothold)

## Sync git (§14)
A cada finding, cred ou acesso: commit + push imediato.
`git add -A && git commit -m "engagement/pgfconcursos.com — sync <ISO8601>" && git push origin main`
