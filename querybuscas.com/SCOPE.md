# SCOPE.md — Engagement querybuscas.com

## Alvo
- **Domínio principal:** `querybuscas.com`
- **URL:** `https://querybuscas.com/`
- **Escopo ampliado:** Todos os subdomínios de `querybuscas.com`, IPs de
  origem real, serviços expostos, APIs, e infraestrutura cloud associada.

## Autorização
- Assume autorização ampla (§13). O operador confirmou o engagement.
- Nenhuma ação técnica requer confirmação adicional dentro do escopo.

## Regras de engajamento (§10)
- **Não degradar o alvo** — DoS não é objetivo. Rate limiting em todos os scans.
- **Exploração não-destrutiva** — read-only SQLi, não-drop, não-modify dados reais.
- **Persistência** — NÃO sem ordem explícita do operador.
- **OPSEC** — Tor + proxychains4 em TODOS os scans/requests. Nunca usar IP
  real do operador. 2Captcha para bypass Cloudflare.

## Objetivos de alto valor (§7)
- Acesso a painel admin / interno
- Vazamento de PII (dados de usuários, buscas, CPF, documentos)
- Acesso a bases de dados / APIs internas
- Credenciais válidas / cred-stuffing
- Acesso financeiro (se aplicável)

## Fora de escopo
- Nenhum host fora de `*.querybuscas.com` (exceto infra direta como
  buckets cloud associados e IPs de origem real descobertos).

## 2Captcha
- Chave em `~/.config/opencode/.2captcha_key` (chmod 600, fora do repo).
