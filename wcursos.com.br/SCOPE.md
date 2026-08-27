# SCOPE — wcursos.com.br

## Alvo
- **Domínio principal:** `wcursos.com.br` (https://www.wcursos.com.br/)
- **Tipo:** Plataforma de cursos (EAD / e-learning) — provável negócio brasileiro de concursos/educação
- **Escopo autorizado:** amplo (§13) — toda a attack surface externa do domínio `*.wcursos.com.br`, subdomínios, APIs, infraestrutura web, serviços expostos, buckets cloud vinculados

## Regras de engajamento
- **Box:** black-box externo
- **Autorização:** ampla assumida (§13)
- **OPSEC:** Tor + proxychains4 em TODOS os scans/requests; 2Captcha para bypass Cloudflare (chave em `~/.config/opencode/.2captcha_key`, chmod 600, fora do repo)
- **Limites:** não-Destrutivo — DoS não é objetivo. Read-only em exploração. Sem persistência sem ordem explícita.
- **Rate limiting:** stealth, UA rotativo, sem flooding

## Objetivos de alto valor (§7)
1. Acesso interno / foothold (RCE, shell, painel admin)
2. Acesso administrativo (admin de plataforma EAD)
3. Acesso financeiro (pagamentos, transações, gateways)
4. Acesso a dados/PII (alunos, clientes, certificados)

## Fora de escopo
- Ataques a terceiros não vinculados ao domínio
- DoS / degradação de serviço
- Modificação de dados em produção

## Especialistas acionáveis
recon-passive, recon-active, osint, enum, webapp, cve, exploit, cloud, network, postex, report, screenshots
