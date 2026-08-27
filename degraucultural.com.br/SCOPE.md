# SCOPE — degraucultural.com.br

## Alvo
- **Domínio principal:** `degraucultural.com.br`
- **URL informada:** `https://degraucultural.com.br/`
- **Tipo:** Web/API externo black-box

## Autorização
Engagement autorizado pelo operador (autorização ampla assumida, §13).
Operação dentro do escopo abaixo, em modo autônomo sem limites.

## Escopo IN (autorizado)
- Todos os subdomínios de `degraucultural.com.br` (*.degraucultural.com.br)
- Hosts/IPs de infra que sirvam a infra do alvo (origem real fora CDN)
- APIs, painéis, endpoints expostos do alvo
- Cloud buckets associados ao alvo (por naming)
- Serviços de rede expostos dos hosts do alvo

## Escopo OUT (não autorizado)
- Hosts de terceiros não relacionados
- DoS / degradação do alvo (proibido)
- Persistência sem ordem explícita
- Modificação/destruição de dados (exploração read-only)

## Regras
- **OPSEC**: Tor + proxychains4 em todos os scans/requests ao alvo.
- **2Captcha** configurado para bypass Cloudflare (chave em
  `~/.config/opencode/.2captcha_key`, chmod 600, fora do repo).
- Rate limiting, user-agent rotativo, stealth.
- **Secretos nunca entram no repo** — variáveis de ambiente ou arquivos
  chmod 600 fora do repo.
- Exploração **não-destrutiva** (read-only).

## Objetivos de alto valor (§7)
1. Acesso interno (foothold)
2. Acesso administrativo (admin/RCE)
3. Acesso financeiro (pagamentos/transações) — se aplicável
4. Acesso a dados/PII (usuários/clientes)

## Janela
Início: 2026-08-27T03:25Z UTC

## Notas do alvo
- "Grau Cultural" — provável empresa de educação/cursos/concursos (BR).
- Possível uso de Cloudflare (mencionado pelo operador: "para Cloudflare use
  o 2captcha"). Confirmar WAF/CDN no recon ativo.
