# Escopo — centraldeconcursos.com.br

## Alvo
- **Domínio principal:** `centraldeconcursos.com.br`
- **URL base:** `https://centraldeconcursos.com.br/`
- **Negócio (presumido):** Plataforma de concursos/cursos preparatórios
  (Brasil). Possível área de alunos, pagamentos, PII de candidatos.
- **Engagement dir:** `centraldeconcursos/`

## Tipo de teste
- Black-box externo Web/API + serviços expostos.
- Sem credenciais iniciais fornecidas.
- Autorização ampla assumida (§13 do AGENTS.md) sobre o domínio
  `centraldeconcursos.com.br` e seus subdomínios.

## Dentro do escopo (IN)
- `*.centraldeconcursos.com.br` (todos os subdomínios).
- Serviços web/HTTP/HTTPS expostos nos hosts do domínio.
- Serviços de rede expostos nos IPs/resoluções dos hosts do domínio.
- APIs REST/GraphQL sob o domínio.
- Assets de cloud associados (buckets S3/Azure/GCP/OpenStack) cujo naming
  derive do domínio/empresa.
- Takeover de subdomínio (CNAME dangling).

## Fora do escopo (OUT)
- Clientes terceiros não-operados pelo alvo (ex.: provedores de CDN
  Cloudflare, provedores de e-mail terceiros) — apenas fingerprinting.
- DoS / degradação de serviço intencional.
- Ataques a usuários/funcionários via engenharia social (phishing).
- Persistência sem ordem explícita do operador.

## Objetivos de alto valor (prioridades de payoff, §7)
1. Acesso interno / foothold (RCE, shell, SSRF para rede interna).
2. Acesso administrativo (painel admin, RCE admin).
3. Acesso financeiro (pagamentos, transações, assinaturas).
4. Acesso a dados/PII (alunos, candidatos, CPF, contatos).

## Regras de engajamento
- **OPSEC:** Tor + proxychains4 em todos os scans/requests ao alvo.
- **2Captcha** para bypass de Cloudflare (chave em
  `~/.config/opencode/.2captcha_key`, chmod 600, fora do repo).
- **Não-destrutivo:** read-only, sem modificação/exclusão de dados.
- **Rate limiting + UA rotativo + stealth.** DoS não é objetivo.
- **Secretos NUNCA entram no repo** — apenas variáveis de ambiente ou
  arquivos chmod 600 fora do repo.
- **Auto-sync git** a cada finding/cred/acesso (§14).

## Observações
- O alvo aparentemente usa Cloudflare (confirmar na Fase 3). Estratégia:
  descobrir IP real (bypass CDN), testar vhosts direto no IP, enumerar
  subdomínios não-proxied.
